import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

let started = false;
const seen = new Set<string>();

/** Marker prefix used when the dedicated sign-in log table isn't available. */
export const SIGNIN_MARKER = "auth:signin:";

/** Records a sign-in for the current user (no-op if already recorded this page load). */
async function record(session: Session | null | undefined) {
  const user = session?.user;
  if (!user?.id || seen.has(user.id)) return;
  seen.add(user.id);

  try {
    const { error } = await supabase.rpc("record_sign_in");
    if (!error) return;
  } catch {
    // fall through to the fallback below
  }

  // Fallback: the dedicated log table/function may not exist on this backend.
  // Record the sign-in as an activity row the owner account can already read.
  try {
    const provider = (user.app_metadata?.provider as string) ?? "email";
    const email = user.email ?? "(no email)";
    await supabase
      .from("page_views")
      .insert({ path: `${SIGNIN_MARKER}${user.id}|${provider}|${email}`.slice(0, 2048) });
  } catch {
    // Never let logging break the app.
  }
}

/** Subscribes once (browser only) so every sign-in is logged for the dashboard. */
export function startSignInLogging() {
  if (started || typeof window === "undefined") return;
  started = true;

  void supabase.auth.getSession().then(({ data }) => record(data.session));

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
      void record(session);
    }
    if (event === "SIGNED_OUT") seen.clear();
  });
}
