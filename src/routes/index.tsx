import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import logoUrl from "@/assets/andielicious-logo.png";
import heroImg from "@/assets/strawberry-cheesecake.png";
import flavorClassic from "@/assets/strawberry-cheesecake.png";
import flavorChocolate from "@/assets/chocolate-caramel.png";
import bakerImg from "@/assets/baker.jpg";
import flavorRotatingImg from "@/assets/strawberry-cheesecake.png";
import { site } from "@/content/site";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Andielicious Cheesecake · Self-Serve Slices" },
      {
        name: "description",
        content:
          "Local self-serve cheesecake slices from Andielicious. Baked on Thursdays, open Friday through Monday, with weekly flavors and reviews.",
      },
      { property: "og:title", content: "Andielicious Cheesecake · Self-Serve Slices" },
      {
        property: "og:description",
        content:
          "Local self-serve cheesecake slices from Andielicious. Baked on Thursdays, open Friday through Monday, with weekly flavors and reviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://andielicious.com/og-image.png" },
      { name: "twitter:image", content: "https://andielicious.com/og-image.png" },
    ],
  }),
  component: Home,
});

type DbFlavor = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  category: "staple" | "weekly" | "vote_option";
  week_label: string | null;
  position: number;
  sold_out?: boolean;
};

// Fallback local images by slug when admin hasn't set an image_url.
const FALLBACK_IMAGES: Record<string, string> = {
  "classic-vanilla": flavorClassic,
  "chocolate-ganache": flavorChocolate,
  "strawberry-compote": flavorRotatingImg,
};

function imageForFlavor(f: Pick<DbFlavor, "slug" | "image_url">) {
  return f.image_url || FALLBACK_IMAGES[f.slug] || heroImg;
}

function Home() {
  const [flavors, setFlavors] = useState<DbFlavor[]>([]);
  const [authState, setAuthState] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    let ignore = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!ignore) setAuthState(data.user ? "in" : "out");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") return setAuthState("out");
      if (session?.user) setAuthState("in");
    });
    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authState !== "in") return;
    // Page view tracking — once per browser session, guarded against double effects.
    try {
      const key = "andielicious_view_logged";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, String(Date.now()));
        supabase.from("page_views").insert({ path: window.location.pathname }).then(({ error }) => {
          if (error) {
            sessionStorage.removeItem(key);
            console.warn("page view", error);
          }
        });
      }
    } catch {
      /* storage blocked — skip tracking rather than double count */
    }
    // Load flavors from DB (admin-editable)
    supabase
      .from("flavors")
      .select("id,slug,name,description,image_url,category,week_label,position,sold_out")
      .eq("active", true)
      .order("position", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setFlavors((data as DbFlavor[]) ?? []);
      });
  }, [authState]);

  const weekly = flavors.find((f) => f.category === "weekly") ?? null;
  const staples = flavors.filter((f) => f.category === "staple");
  const voteOptions = flavors.filter((f) => f.category === "vote_option");

  if (authState !== "in") {
    return (
      <>
        <Toaster position="top-center" />
        <WelcomeGate loading={authState === "loading"} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Nav />
      <Hero />
      <FlavorOfTheWeek weekly={weekly} />
      <MondayDeal />
      <Flavors staples={staples} weekly={weekly} />
      <HowItWorks />
      <Hours />
      <LocationSection />
      <BakerSection />
      <FlavorVote options={voteOptions} />
      <NewsletterSubscribe />
      <Reviews />
      <Footer />
    </div>
  );
}

function WelcomeGate({ loading }: { loading: boolean }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-blush/60 via-background to-background px-6 py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sage/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-berry/20 blur-3xl" />
      <div className="relative w-full max-w-lg rounded-3xl border border-berry/20 bg-card/90 p-10 text-center shadow-2xl backdrop-blur">
        <img
          src={logoUrl}
          alt="Andielicious logo"
          className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-cream"
        />
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
          Welcome to <em className="italic text-accent">Andielicious</em>
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Small-batch, self-serve cheesecake slices. Sign in (it's free) to see this week's
          flavors, hours, and the little fridge's whereabouts.
        </p>
        {loading ? (
          <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">Checking…</p>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/auth"
              className="w-full rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-colors hover:bg-primary"
            >
              Sign in to enter
            </Link>
            <Link
              to="/auth"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
            >
              New here? Create a free account →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function MondayDeal() {
  return (
    <section className="border-t border-border bg-berry/15">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-center md:flex-row md:justify-center md:gap-6">
        <span className="rounded-full bg-accent px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent-foreground">
          Weekly deal
        </span>
        <p className="font-display text-3xl italic text-accent md:text-4xl">50% off Mondays</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Every Monday, every slice is half price at the fridge.
        </p>
      </div>
    </section>
  );
}


function Nav() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function refresh() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!ignore) setEmail(sessionData.session?.user.email ?? null);

      const { data } = await supabase.auth.getUser();
      if (ignore) return;
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        if (ignore) return;
        setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      } else {
        setIsAdmin(false);
      }
    }
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setEmail(null);
        setIsAdmin(false);
        return;
      }
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        setEmail(session?.user.email ?? null);
        refresh();
      }
    });
    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt="Andielicious"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-berry/40 ring-offset-2 ring-offset-background"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-2xl tracking-tight text-accent">Andielicious</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sage">
              Cheesecake
            </span>
          </span>
        </a>
        <nav className="hidden gap-6 text-xs font-medium uppercase tracking-[0.18em] lg:flex">
          <a href="#flavors" className="hover:text-accent transition-colors">Flavors</a>
          <a href="#how" className="hover:text-accent transition-colors">How it works</a>
          <a href="#hours" className="hover:text-accent transition-colors">Hours</a>
          <a href="#location" className="hover:text-accent transition-colors">Location</a>
          <a href="#baker" className="hover:text-accent transition-colors">Baker</a>
          <a href="#vote" className="hover:text-accent transition-colors">Vote</a>
          <a href="#reviews" className="hover:text-accent transition-colors">Reviews</a>
        </nav>
        <div className="flex items-center gap-2">
          {email ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex rounded-full border border-accent bg-accent/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground sm:px-4 sm:text-xs"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={signOut}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-secondary"
                title={email}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-accent-foreground hover:bg-primary"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-blush/60 via-background to-background">
      {/* decorative sprig blobs */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sage/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-berry/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:py-28">
        <div>
          <div className="mb-6 flex items-center gap-4">
            <img
              src={logoUrl}
              alt="Andielicious logo"
              className="h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-cream md:h-24 md:w-24"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-sage">
                Baked fresh on Thursdays
              </span>
              <span className="font-display text-3xl italic text-accent md:text-4xl">
                Andielicious
              </span>
            </div>
          </div>

          <h1 className="font-display text-5xl leading-[1.02] md:text-7xl">
            Small-batch <span className="text-accent">cheesecake</span>,<br />
            <em className="font-normal italic text-sage">self-served</em> with love.
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            Every Thursday Andie bakes. Friday through Monday, the little cheesecake
            fridge is open — drive over on the available times, pay, and take home a
            fresh slice. <span className="italic text-accent">Slices only</span>, always made from scratch.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#flavors"
              className="rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-colors hover:bg-primary"
            >
              See this week's flavors
            </a>
            <a
              href="#how"
              className="rounded-full border border-accent bg-transparent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              How self-serve works
            </a>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sage">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            {site.payment.methods}
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-blush" />
          <div className="absolute -inset-2 -z-10 rounded-[2rem] bg-sage/20" />
          <img
            src={heroImg}
            alt="A single slice of Andielicious cheesecake"
            width={1400}
            height={1600}
            className="aspect-[7/8] w-full rounded-3xl object-cover shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}

function StockBadge({ soldOut, className = "" }: { soldOut: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] shadow-sm backdrop-blur ${
        soldOut
          ? "bg-ink/85 text-cream"
          : "bg-sage/90 text-cream"
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${soldOut ? "bg-berry" : "bg-butter"}`} />
      {soldOut ? "Sold out" : "In stock"}
    </span>
  );
}

function FlavorOfTheWeek({ weekly }: { weekly: DbFlavor | null }) {
  if (!weekly) return null;
  return (
    <section id="flavor-of-the-week" className="border-t border-border py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1fr_1.05fr]">
        <Reveal className="order-2 md:order-1">
          <div className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-secondary" />
            <img
              src={imageForFlavor(weekly)}
              alt={weekly.name}
              width={1200}
              height={1200}
              className={`aspect-square w-full rounded-3xl object-cover shadow-xl ${weekly.sold_out ? "opacity-60 grayscale" : ""}`}
            />
            <StockBadge soldOut={!!weekly.sold_out} className="absolute left-4 top-4" />
          </div>
        </Reveal>
        <Reveal delay={120} className="order-1 md:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            {weekly.week_label || "This week only"}
          </p>
          <h2 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">
            <em className="font-normal italic text-accent">Flavor</em> of the week
          </h2>
          <p className="mt-6 font-display text-3xl md:text-4xl">{weekly.name}</p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            {weekly.description}
          </p>
        </Reveal>

      </div>
    </section>
  );
}

function Flavors({ staples, weekly }: { staples: DbFlavor[]; weekly: DbFlavor | null }) {
  const items = [
    ...staples.map((f) => ({ ...f, tag: "Always on the menu" })),
    ...(weekly ? [{ ...weekly, tag: "This week's rotating flavor" }] : []),
  ];
  return (
    <section id="flavors" className="border-t border-border bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">The Menu</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Staples & this week's pick.</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Sold by the slice only — $6 each. Pay ahead by DM to reserve, or in
            person at the fridge.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm italic text-muted-foreground">
              Menu coming soon.
            </p>
          ) : (
            items.map((f, i) => (
              <Reveal key={f.id} delay={i * 90}>
                <article className="group flex flex-col">
                  <div className="relative overflow-hidden rounded-2xl bg-background">
                    <img
                      src={imageForFlavor(f)}
                      alt={f.name}
                      loading="lazy"
                      width={900}
                      height={900}
                      className={`aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${f.sold_out ? "opacity-60 grayscale" : ""}`}
                    />
                    <StockBadge soldOut={!!f.sold_out} className="absolute left-3 top-3" />
                  </div>
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                    {f.tag}
                  </p>
                  <h3 className="mt-2 font-display text-2xl">{f.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </article>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return toast.error("Please enter a valid email.");
    }
    setBusy(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: value });
    setBusy(false);
    if (error) {
      if (error.code === "23505") {
        setDone(true);
        return toast.success("You're already on the list — thanks!");
      }
      return toast.error("Couldn't subscribe. Try again in a moment.");
    }
    setDone(true);
    setEmail("");
    toast.success("You're on the list! 🎉");
  }

  return (
    <section id="subscribe" className="border-t border-border bg-blush/40 py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sage">Stay in the loop</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">
          Get the <em className="italic text-accent">weekly flavor</em> in your inbox.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          One friendly email a week from Andie — this week's flavor, bake-day updates, and
          the occasional cheesecake secret. Unsubscribe anytime.
        </p>
        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-full border border-input bg-background px-5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            disabled={busy || done}
            className="rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-colors hover:bg-primary disabled:opacity-60"
          >
            {done ? "Subscribed ✓" : busy ? "…" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Thursday — bake day",
      body:
        "Every Thursday, Andie bakes the week's cheesecakes fresh from scratch. Follow along on the socials and sign up on the newsletter to see what's coming.",
    },
    {
      n: "02",
      title: "Drive over & pick up",
      body:
        "Come by any time Friday through Sunday, 8am–8pm, Monday 3pm-8pm. Grab your slice from the self-serve fridge, pay if you haven't, and enjoy.",
    },
    {
      n: "03",
      title: "Venmo or cash",
      body:
        "Pay right at the fridge — Venmo (@Andielicious) or drop cash in the box. No cards, no apps, no fuss.",
    },

  ];
  return (
    <section id="how" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Self-Serve, Simplified</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">How it works</h2>
          </div>
        </Reveal>

        <ol className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120} variant="up">
              <li className="border-t border-border pt-6">
                <span className="font-display text-4xl italic text-accent">{s.n}</span>
                <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}


function Hours() {
  return (
    <section id="hours" className="border-y border-border bg-primary py-20 text-primary-foreground md:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:items-center">
        <Reveal variant="left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">Visit</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Open five days a week.</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-primary-foreground/75">
              Bake day is Thursday — the fridge is closed while Andie's in the kitchen.
              Come by any other day and help yourself. <span className="text-blush">{site.payment.methods}.</span>
            </p>
          </div>
        </Reveal>

        <Reveal variant="right" delay={120}>
          <dl className="divide-y divide-primary-foreground/15 border-y border-primary-foreground/15">
            {[
              ["Monday", "3:00pm-8:00pm· 50% off"],
              ["Tuesday", "Closed"],
              ["Wednesday", "Closed"],
              ["Thursday", "Bake day — closed"],
              ["Friday", "8:00 am — 8:00 pm"],
              ["Saturday", "8:00 am — 8:00 pm"],
              ["Sunday", "8:00 am — 8:00 pm"],
            ].map(([day, hrs]) => (
              <div key={day} className="flex items-baseline justify-between py-4">
                <dt className="font-display text-xl">{day}</dt>
                <dd className="text-sm tracking-wide text-primary-foreground/75">{hrs}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

    </section>
  );
}

function LocationSection() {
  const { location, payment } = site;
  return (
    <section id="location" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blush/40 to-transparent" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 md:grid-cols-2">
        {/* Location card */}
        <Reveal variant="left">
          <div className="rounded-3xl border border-berry/20 bg-card p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sage">Find the fridge</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Where to <em className="italic text-accent">find us</em>
            </h2>
            <address className="mt-6 not-italic">
              <p className="font-display text-2xl">{location.addressLine1}</p>
              <p className="font-display text-2xl">{location.addressLine2}</p>
            </address>
            {location.note && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{location.note}</p>
            )}
            {location.mapsUrl && (
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-colors hover:bg-primary"
              >
                Get directions
              </a>
            )}
          </div>
        </Reveal>

        {/* Payment card */}
        <Reveal variant="right" delay={120}>
          <div className="rounded-3xl bg-sage/15 p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Payment</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              {payment.methods.split(" or ")[0]} <em className="italic text-sage">or</em> {payment.methods.split(" or ")[1] ?? ""}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Sorry, no cards. Pay over Venmo, or drop cash in the box at the fridge.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-berry px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground">
                Venmo · {payment.venmoHandle}
              </span>
              <span className="rounded-full border border-sage px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sage">
                Cash accepted
              </span>
            </div>
          </div>
        </Reveal>
      </div>

    </section>
  );
}

function BakerSection() {
  const { baker } = site;
  return (
    <section id="baker" className="border-t border-border bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1fr_1.1fr]">
        <Reveal variant="scale">
          <div className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-blush" />
            <div className="absolute -inset-2 -z-10 rounded-[2rem] bg-sage/25" />
            <img
              src={bakerImg}
              alt={`${baker.name}, the baker behind Andielicious`}
              loading="lazy"
              width={1200}
              height={1400}
              className="aspect-[6/7] w-full rounded-3xl object-cover shadow-xl"
            />
          </div>
        </Reveal>
        <Reveal variant="right" delay={140}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Meet the baker
            </p>
            <h2 className="mt-3 font-display text-5xl leading-[1.05] md:text-6xl">
              Hi, I'm <em className="italic text-accent">{baker.name}</em>.
            </h2>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-sage">
              {baker.role}
            </p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              {baker.bio}
            </p>
          </div>
        </Reveal>
      </div>

    </section>
  );
}

function FlavorVote({ options }: { options: DbFlavor[] }) {
  // Merge DB vote-options with the site.ts config so we still get emojis.
  const flavors = options.length
    ? options.map((o) => {
        const cfg = site.voteFlavors.find((f) => f.slug === o.slug);
        return { slug: o.slug, label: o.name, emoji: cfg?.emoji ?? "🍰" };
      })
    : site.voteFlavors;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votedSlug, setVotedSlug] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("andielicious_voted_flavor");
      if (saved) setVotedSlug(saved);
    } catch {}
    loadCounts();
    async function loadCounts() {
      const { data, error } = await supabase
        .from("flavor_votes")
        .select("flavor_slug");
      if (error) console.error(error);
      const tally: Record<string, number> = {};
      (data ?? []).forEach((row: { flavor_slug: string }) => {
        tally[row.flavor_slug] = (tally[row.flavor_slug] ?? 0) + 1;
      });
      setCounts(tally);
      setLoading(false);
    }
  }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  async function vote(slug: string) {
    if (votedSlug || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from("flavor_votes").insert({ flavor_slug: slug });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't record your vote. Try again in a moment.");
      return;
    }
    try {
      localStorage.setItem("andielicious_voted_flavor", slug);
    } catch {}
    setVotedSlug(slug);
    setCounts((prev) => ({ ...prev, [slug]: (prev[slug] ?? 0) + 1 }));
    toast.success("Thanks for voting! Andie will see this.");
  }

  return (
    <section id="vote" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              You pick
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Vote on the <em className="italic text-accent">next flavor</em>.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            The top pick shows up in an upcoming rotating slot. On the last week
            of every month, I will bake the top voted. One vote per neighbor,
            please.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {flavors.map((f) => {
            const count = counts[f.slug] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isVoted = votedSlug === f.slug;
            const disabled = !!votedSlug || submitting || loading;
            return (
              <button
                key={f.slug}
                type="button"
                onClick={() => vote(f.slug)}
                disabled={disabled}
                className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all ${
                  isVoted
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/60 hover:-translate-y-0.5"
                } ${disabled && !isVoted ? "opacity-70" : ""}`}
              >
                {/* progress bar background */}
                <div
                  className="absolute inset-y-0 left-0 -z-0 bg-blush/50 transition-all duration-500"
                  style={{ width: votedSlug ? `${pct}%` : "0%" }}
                  aria-hidden
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl">{f.emoji}</div>
                    <p className="mt-3 font-display text-xl leading-tight">{f.label}</p>
                  </div>
                  {votedSlug && (
                    <div className="text-right">
                      <p className="font-display text-xl text-accent">{pct}%</p>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {count} vote{count === 1 ? "" : "s"}
                      </p>
                    </div>
                  )}
                </div>
                <p className="relative mt-4 text-[10px] font-semibold uppercase tracking-[0.22em]">
                  {isVoted ? (
                    <span className="text-accent">✓ Your pick</span>
                  ) : votedSlug ? (
                    <span className="text-muted-foreground">Tap disabled</span>
                  ) : (
                    <span className="text-sage">Tap to vote</span>
                  )}
                </p>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {loading
            ? "Loading votes…"
            : votedSlug
            ? `${total} vote${total === 1 ? "" : "s"} so far — thanks for weighing in!`
            : `${total} vote${total === 1 ? "" : "s"} so far.`}
        </p>
      </div>
    </section>
  );
}





function Reviews() {
  return (
    <section id="reviews" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Kind Words</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Leave <em className="italic text-accent">Andie</em> a note.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
              Reviews go straight to Andie — nothing shows up on the site unless she picks it to feature later.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <ReviewForm />
        </Reveal>
      </div>
    </section>
  );
}


function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        const Icon = (
          <Star
            className={`h-5 w-5 ${active ? "fill-accent text-accent" : "text-border"}`}
            strokeWidth={1.5}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110"
          >
            {Icon}
          </button>
        ) : (
          <span key={n}>{Icon}</span>
        );
      })}
    </div>
  );
}

function ReviewForm() {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [publicConsent, setPublicConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; message: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setStatus({ kind: "error", message: "Please add your name and a short note." });
      toast.error("Please add your name and a short note.");
      return;
    }
    setStatus(null);
    setSubmitting(true);
    const { error } = await supabase
      .from("reviews")
      .insert({
        name: name.trim().slice(0, 80),
        rating,
        comment: comment.trim().slice(0, 2000),
        public_consent: publicConsent,
      });
    setSubmitting(false);

    if (error) {
      const message = `Couldn't send your review: ${error.message}`;
      setStatus({ kind: "error", message });
      toast.error(message);
      return;
    }

    const okMessage = "Thank you! Andie will read this — she'll decide what to feature on the site.";
    setStatus({ kind: "ok", message: okMessage });
    toast.success(okMessage);
    setName("");
    setComment("");
    setRating(5);
    setPublicConsent(false);
  }


  return (
    <form
      onSubmit={submit}
      className="mt-16 grid gap-6 rounded-3xl border border-border bg-card p-8 md:p-10"
    >
      <div>
        <h3 className="font-display text-3xl">Leave a review</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us how your cheesecake was. Nothing is shared unless you say it's okay.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            className="rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="e.g. Sam from down the street"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Rating
          </span>
          <div className="flex items-center rounded-lg border border-input bg-background px-4 py-3">
            <Stars value={rating} onChange={setRating} />
          </div>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Your review
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          maxLength={600}
          rows={4}
          className="resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="What did you love?"
        />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4">
        <input
          type="checkbox"
          checked={publicConsent}
          onChange={(e) => setPublicConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[oklch(0.62_0.11_60)]"
        />
        <span className="text-sm leading-relaxed">
          <span className="font-medium">Andie may share this review publicly if she chooses</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Check this box to give Andie permission to feature your review on the website
            or social media. Leave it unchecked and it stays completely private — just for her.
          </span>
        </span>
      </label>

      {status && (
        <p
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            status.kind === "ok"
              ? "border-sage/50 bg-sage/10 text-foreground"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full justify-center rounded-full bg-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60 sm:w-fit"
      >
        {submitting ? "Sending…" : "Send review"}
      </button>
    </form>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Andielicious" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="font-display text-xl">Andielicious Cheesecake</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Andielicious Cheesecake. Baked with love.
        </p>
      </div>
    </footer>
  );
}
