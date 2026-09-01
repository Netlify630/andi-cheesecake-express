// Server-side runtime Supabase config resolution.
//
// Some hosts (edge/serverless bundles) do not surface the non-VITE env vars to
// every module, which made env detection report them as "missing" even though
// they exist. This resolver checks all known sources and falls back to the
// canonical pinned values used everywhere else in the app.

const CANONICAL_URL = "https://olgvvhjguiwgcfxpdnli.supabase.co";
const CANONICAL_PUBLISHABLE_KEY = "sb_publishable_Q5LWwgGUesb3x5rRMDz8Nw_XvPFKXBj";

function env(name: string): string | undefined {
  try {
    const value = typeof process !== "undefined" ? process.env?.[name] : undefined;
    return value && value.length > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

export function resolveSupabaseUrl(): string {
  return env("SUPABASE_URL") ?? env("VITE_SUPABASE_URL") ?? CANONICAL_URL;
}

export function resolveSupabasePublishableKey(): string {
  return (
    env("SUPABASE_PUBLISHABLE_KEY") ??
    env("VITE_SUPABASE_PUBLISHABLE_KEY") ??
    env("SUPABASE_ANON_KEY") ??
    env("VITE_SUPABASE_ANON_KEY") ??
    CANONICAL_PUBLISHABLE_KEY
  );
}

export function resolveServiceRoleKey(): string | undefined {
  return env("SUPABASE_SERVICE_ROLE_KEY");
}
