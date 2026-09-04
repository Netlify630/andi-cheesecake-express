import { supabase } from "@/integrations/supabase/client";

let started = false;
const seen = new Set<string>();

/** Records a sign-in for the current user (no-op if already recorded this page load). */
async function record(userId: string | undefined) {
  if (!userId || seen.has(userId)) return;
  seen.add(userId);
  try {
    await supabase.rpc("record_sign_in");
  } catch {
    // Never let logging break the app.
  }
}

/** Subscribes once (browser only) so every sign-in is logged for the dashboard. */
export function startSignInLogging() {
  if (started || typeof window === "undefined") return;
  started = true;

  void supabase.auth.getSession().then(({ data }) => record(data.session?.user?.id));

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
      void record(session?.user?.id);
    }
    if (event === "SIGNED_OUT") seen.clear();
  });
}
