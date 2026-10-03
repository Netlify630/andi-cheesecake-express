import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import logoUrl from "@/assets/andielicious-logo.png";
import heroImg from "@/assets/strawberry-cheesecake.png";
import flavorClassic from "@/assets/strawberry-cheesecake.png";
import flavorChocolate from "@/assets/chocolate-caramel.png";
import { normalizeImageUrl } from "@/lib/image-url";
import { isStoredPhoto, resolveFlavorPhoto } from "@/lib/flavor-photo";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/flavors")({
  head: () => ({
    meta: [
      { title: "Flavors & Voting · Andielicious Cheesecake" },
      {
        name: "description",
        content:
          "This week's Andielicious cheesecake flavors, plus the full flavor list — vote for whichever flavor you want Andie to bake next.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Flavors & Voting · Andielicious Cheesecake" },
      {
        property: "og:description",
        content:
          "This week's Andielicious cheesecake flavors, plus the full flavor list — vote for whichever flavor you want Andie to bake next.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FlavorsPage,
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
  "strawberry-compote": heroImg,
};

function imageForFlavor(f: Pick<DbFlavor, "slug" | "image_url">) {
  if (isStoredPhoto(f.image_url)) return FALLBACK_IMAGES[f.slug] || heroImg;
  return normalizeImageUrl(f.image_url ?? "") || FALLBACK_IMAGES[f.slug] || heroImg;
}

function fallbackForFlavor(f: Pick<DbFlavor, "slug">) {
  return FALLBACK_IMAGES[f.slug] || heroImg;
}

/** Renders the flavor photo, swapping to a local image if the pasted link fails. */
function FlavorImage({
  flavor,
  className,
  width = 900,
  height = 900,
}: {
  flavor: Pick<DbFlavor, "slug" | "image_url" | "name">;
  className?: string;
  width?: number;
  height?: number;
}) {
  const [src, setSrc] = useState(() => imageForFlavor(flavor));

  useEffect(() => {
    let active = true;
    const load = async () => {
      const resolved = flavor.image_url ? await resolveFlavorPhoto(flavor.image_url) : null;
      if (active) setSrc(resolved || imageForFlavor(flavor));
    };
    void load();
    return () => {
      active = false;
    };
  }, [flavor.slug, flavor.image_url]);

  return (
    <img
      src={src}
      alt={flavor.name}
      loading="lazy"
      width={width}
      height={height}
      onError={() => {
        const fb = fallbackForFlavor(flavor);
        if (src !== fb) setSrc(fb);
      }}
      className={className}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// THE BIG FLAVOR LIST — every flavor neighbors can vote on.
// ─────────────────────────────────────────────────────────────
const ALL_FLAVORS: { slug: string; label: string }[] = [
  { slug: "peppermint", label: "Peppermint" },
  { slug: "dulce-de-leche-caramel", label: "Dulce De Leche Caramel" },
  { slug: "pumpkin", label: "Pumpkin" },
  { slug: "lavender-lemonade", label: "Lavender Lemonade" },
  { slug: "smores-galore", label: "Smores Galore" },
  { slug: "cookie-dough", label: "Cookie Dough" },
  { slug: "red-velvet", label: "Red Velvet" },
  { slug: "coconut-cream", label: "Coconut Cream" },
  { slug: "banana-cream", label: "Banana Cream" },
  { slug: "chocolate-caramel", label: "Chocolate Caramel" },
  { slug: "cherry-chocolate", label: "Cherry Chocolate" },
  { slug: "cherry-limeade", label: "Cherry Limeade" },
  { slug: "apple-cobbler", label: "Apple Cobbler" },
  { slug: "white-chocolate-raspberry", label: "White Chocolate Raspberry" },
  { slug: "triple-white-chocolate-berry", label: "Triple White Chocolate Berry" },
  { slug: "triple-chocolate-fudge", label: "Triple Chocolate Fudge" },
  { slug: "oreo", label: "Oreo" },
  { slug: "gingerbread", label: "Gingerbread" },
  { slug: "lemon-meringue", label: "Lemon Meringue" },
  { slug: "huckleberry", label: "Huckleberry" },
  { slug: "pineapple-chocolate", label: "Pineapple Chocolate" },
  { slug: "watermelon", label: "Watermelon" },
  { slug: "tiramisu", label: "Tiramisu" },
  { slug: "brownie", label: "Brownie" },
  { slug: "eggnog", label: "Eggnog" },
  { slug: "fudge-caramel-peanut-butter-cups", label: "Fudge Caramel Peanut Butter Cups" },
  { slug: "orange-creamsicle", label: "Orange Creamsicle" },
  { slug: "dubai", label: "Dubai" },
  { slug: "nutella", label: "Nutella" },
  { slug: "bueno", label: "Bueno" },
  { slug: "chocolate-pumpkin", label: "Chocolate Pumpkin" },
  { slug: "wassail", label: "Wassail" },
  { slug: "kiwi", label: "Kiwi" },
  { slug: "chocolate", label: "Chocolate" },
  { slug: "strawberry", label: "Strawberry" },
  { slug: "blueberry", label: "Blueberry" },
  { slug: "mango-coconut", label: "Mango Coconut" },
  { slug: "caramel-ganache", label: "Caramel Ganache" },
  { slug: "lime", label: "Lime" },
  { slug: "lemon-raspberry", label: "Lemon Raspberry" },
  { slug: "mango-lime", label: "Mango-Lime" },
  { slug: "snickerdoodle", label: "Snickerdoodle" },
  { slug: "butter-pecan", label: "Butter Pecan" },
  { slug: "biscoff", label: "Biscoff" },
  { slug: "cranberry", label: "Cranberry" },
  { slug: "pistachio", label: "Pistachio" },
];

function FlavorsPage() {
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
    // Load menu flavors from DB (admin-editable)
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

  const menuFlavors = flavors.filter((f) => f.category !== "vote_option");

  if (authState !== "in") {
    return (
      <>
        <Toaster position="top-center" />
        <Gate loading={authState === "loading"} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <PageNav />
      <MenuSection items={menuFlavors} />
      <VoteSection />
      <PageFooter />
    </div>
  );
}

function Gate({ loading }: { loading: boolean }) {
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
          The <em className="italic text-accent">flavors</em> live here
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Sign in (it's free) to see this week's menu and vote for the flavor you want Andie
          to bake next.
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
              to="/"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
            >
              ← Back home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function PageNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
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
        </Link>
        <Link
          to="/"
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-secondary"
        >
          ← Home
        </Link>
      </div>
    </header>
  );
}

function StockBadge({ soldOut, className = "" }: { soldOut: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] shadow-sm backdrop-blur ${
        soldOut ? "bg-ink/85 text-cream" : "bg-sage/90 text-cream"
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${soldOut ? "bg-berry" : "bg-butter"}`} />
      {soldOut ? "Sold out" : "In stock"}
    </span>
  );
}

function MenuSection({ items }: { items: DbFlavor[] }) {
  return (
    <section id="menu" className="bg-gradient-to-b from-blush/50 via-background to-background py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">The Menu</p>
            <h1 className="mt-3 font-display text-4xl md:text-6xl">Flavors.</h1>
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
                    <FlavorImage
                      flavor={f}
                      className={`aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${f.sold_out ? "opacity-60 grayscale" : ""}`}
                    />
                    <StockBadge soldOut={!!f.sold_out} className="absolute left-3 top-3" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl">{f.name}</h3>
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

function VoteSection() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votedSlug, setVotedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Voting resets at the start of every calendar month (the dashboard archive
  // keeps every month's results forever).
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const voteStorageKey = `andielicious_voted_flavor_${monthKey}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(voteStorageKey);
      if (saved) setVotedSlug(saved);
    } catch {}
    loadCounts();
    async function loadCounts() {
      const { data, error } = await supabase
        .from("flavor_votes")
        .select("flavor_slug")
        .gte("created_at", monthStart);
      if (error) console.error(error);
      const tally: Record<string, number> = {};
      (data ?? []).forEach((row: { flavor_slug: string }) => {
        tally[row.flavor_slug] = (tally[row.flavor_slug] ?? 0) + 1;
      });
      setCounts(tally);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? ALL_FLAVORS.filter((f) => f.label.toLowerCase().includes(q))
      : ALL_FLAVORS;
    // Once results are revealed, sort by votes (desc), then alphabetically.
    if (!votedSlug) return list;
    return [...list].sort((a, b) => {
      const diff = (counts[b.slug] ?? 0) - (counts[a.slug] ?? 0);
      return diff !== 0 ? diff : a.label.localeCompare(b.label);
    });
  }, [query, votedSlug, counts]);

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
      localStorage.setItem(voteStorageKey, slug);
    } catch {}
    setVotedSlug(slug);
    setCounts((prev) => ({ ...prev, [slug]: (prev[slug] ?? 0) + 1 }));
    toast.success("Thanks for voting! Andie will see this.");
  }

  return (
    <section id="vote" className="border-t border-border bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              You pick
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Vote for <em className="italic text-accent">any flavor</em>.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            The full Andielicious flavor list — vote for whichever one you want
            to see in the fridge. On the last week of every month, Andie bakes
            the top voted. One vote per neighbor, please.
          </p>
        </div>

        <div className="mb-8">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the flavor list…"
            className="w-full max-w-md rounded-full border border-input bg-background px-5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((f) => {
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
                className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
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
                  <p className="font-display text-lg leading-tight">{f.label}</p>
                  {votedSlug && (
                    <div className="shrink-0 text-right">
                      <p className="font-display text-lg text-accent">{pct}%</p>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {count} vote{count === 1 ? "" : "s"}
                      </p>
                    </div>
                  )}
                </div>
                <p className="relative mt-3 text-[10px] font-semibold uppercase tracking-[0.22em]">
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
          {visible.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm italic text-muted-foreground">
              No flavors match “{query}”.
            </p>
          )}
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

function PageFooter() {
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
