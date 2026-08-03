import { supabase } from "@/integrations/supabase/client";

export type GoogleSignInResult =
  | { ok: true; redirected: boolean }
  | { ok: false; message: string };

/**
 * Native Supabase Google OAuth — works on any host (Vercel, custom domain,
 * self-hosted export). No Lovable-hosted broker involved.
 */
export async function signInWithGoogle(redirectTo?: string): Promise<GoogleSignInResult> {
  const redirectUri = redirectTo ?? window.location.origin;

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
