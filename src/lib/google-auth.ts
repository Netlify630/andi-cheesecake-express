import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

/**
 * The `/~oauth/initiate` broker only exists on Lovable-hosted origins
 * (*.lovable.app / *.lovableproject.com). On any other host — Vercel,
 * Netlify, a self-hosted export — that path 404s, so we fall back to
 * native Supabase Google OAuth.
 */
export function isLovableHostedOrigin(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host.endsWith(".lovable.dev") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

export type GoogleSignInResult =
  | { ok: true; redirected: boolean }
  | { ok: false; message: string };

export async function signInWithGoogle(redirectTo?: string): Promise<GoogleSignInResult> {
  const redirectUri = redirectTo ?? window.location.origin;

  if (isLovableHostedOrigin()) {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: redirectUri,
    });
    if (result.error) {
      return { ok: false, message: result.error.message || "Google sign-in failed." };
    }
    return { ok: true, redirected: Boolean(result.redirected) };
  }

  // Native Supabase OAuth — works on any host (Vercel, custom domain, export).
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUri,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) {
    return { ok: false, message: error.message || "Google sign-in failed." };
  }
  // Supabase performs a full-page navigation to Google.
  return { ok: true, redirected: true };
}
