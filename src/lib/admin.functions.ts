import { createServerFn } from "@tanstack/react-start";

export type AppMember = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  provider: string;
};

/**
 * Admin-only: list everyone who has created an account / signed in.
 *
 * Reads Supabase configuration through the shared runtime resolver so it works
 * on any host, instead of failing on strict env-var detection.
 */
export const listAppMembers = createServerFn({ method: "GET" }).handler(
  async (): Promise<AppMember[]> => {
    const { createClient } = await import("@supabase/supabase-js");
    const { getRequest } = await import("@tanstack/react-start/server");
    const {
      resolveSupabaseUrl,
      resolveSupabasePublishableKey,
      resolveServiceRoleKey,
    } = await import("./supabase-runtime.server");

    const url = resolveSupabaseUrl();
    const publishableKey = resolveSupabasePublishableKey();

    const request = getRequest();
    const authHeader = request?.headers?.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token || token.split(".").length !== 3) {
      throw new Error("Please sign in again to view members.");
    }

    const makeFetch = (key: string): typeof fetch => (input, init) => {
      const headers = new Headers(
        typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
      );
      if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
      if (
        (key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) &&
        headers.get("Authorization") === `Bearer ${key}`
      ) {
        headers.delete("Authorization");
      }
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    };

    const userClient = createClient(url, publishableKey, {
      global: {
        fetch: makeFetch(publishableKey),
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;
    if (claimsError || !userId) {
      throw new Error("Please sign in again to view members.");
    }

    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("Only the owner account can view members.");

    const serviceRoleKey = resolveServiceRoleKey();
    if (!serviceRoleKey) {
      throw new Error("Member list unavailable: the server is missing its admin key.");
    }

    const adminClient = createClient(url, serviceRoleKey, {
      global: { fetch: makeFetch(serviceRoleKey) },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);

    return data.users.map((u) => ({
      id: u.id,
      email: u.email ?? "(no email)",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      provider: (u.app_metadata?.provider as string) ?? "email",
    }));
  },
);
