import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/google-auth";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import logoUrl from "@/assets/andielicious-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Andielicious Cheesecake" },
      { name: "description", content: "Sign in or create an account to save favorites and get updates from Andielicious." },
      { property: "og:title", content: "Sign in · Andielicious" },
      { property: "og:description", content: "Sign in to Andielicious Cheesecake." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleEmail(e: FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        const alreadyExists = error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered");
        if (alreadyExists) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
          setBusy(false);
          if (signInError) {
            return toast.error("That Gmail already has an account. Sign in with Google, or use the same password you first created.");
          }
          toast.success("You're signed in.");
          router.invalidate();
          navigate({ to: "/" });
          return;
        }
        setBusy(false);
        return toast.error(error.message);
      }
      setBusy(false);
      toast.success("Welcome! You're signed in.");
      router.invalidate();
      navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back!");
      router.invalidate();
      navigate({ to: "/" });
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await signInWithGoogle(window.location.origin);
    if (!result.ok) {
      setBusy(false);
      return toast.error(result.message);
    }
    if (result.redirected) return;
    setBusy(false);
    router.invalidate();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blush/50 via-background to-background">
      <Toaster position="top-center" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <a href="/" className="mb-10 flex items-center justify-center gap-3">
          <img src={logoUrl} alt="Andielicious" className="h-14 w-14 rounded-full object-cover ring-2 ring-berry/40" />
          <span className="font-display text-2xl text-accent">Andielicious</span>
        </a>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
          <h1 className="font-display text-3xl">
            {mode === "signin" ? "Welcome!" : "Create an account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Create a free account to leave reviews and get updates."
              : "It's free — just an email and a password."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-60"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or email <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="grid gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-colors hover:bg-primary disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-accent"
          >
            {mode === "signin" ? "New here? Create an account →" : "Already have an account? Sign in →"}
          </button>
        </div>

        <a href="/" className="mt-8 text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-accent">
          ← BACK TO THE WELCOME PAGE
        </a>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1a6.98 6.98 0 0 1 0-4.2V7.07H2.18a11.001 11.001 0 0 0 0 9.87l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
