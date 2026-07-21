import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import logoAsset from "@/assets/andielicious-logo.png.asset.json";
import heroImg from "@/assets/hero-cheesecake.jpg";
import flavorClassic from "@/assets/flavor-classic.jpg";
import flavorChocolate from "@/assets/flavor-chocolate.jpg";
import { flavorOfTheWeek } from "@/content/flavor-of-the-week";
import { site } from "@/content/site";

export const Route = createFileRoute("/")({
  component: Home,
});

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Nav />
      <Hero />
      <FlavorOfTheWeek />
      <Flavors />
      <HowItWorks />
      <Hours />
      <Location />
      <Reviews />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="Andielicious" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-xl tracking-tight">Andielicious</span>
        </a>
        <nav className="hidden gap-8 text-xs font-medium uppercase tracking-[0.18em] sm:flex">
          <a href="#flavors" className="hover:text-accent transition-colors">Flavors</a>
          <a href="#how" className="hover:text-accent transition-colors">How it works</a>
          <a href="#hours" className="hover:text-accent transition-colors">Hours</a>
          <a href="#reviews" className="hover:text-accent transition-colors">Reviews</a>
        </nav>
        <a
          href="#hours"
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent"
        >
          Order ahead
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:py-28">
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Est. 2024 · Baked on Thursdays
          </p>
          <h1 className="font-display text-5xl leading-[1.02] md:text-7xl">
            Small-batch cheesecake,<br />
            <em className="font-normal italic text-accent">self-served</em> with love.
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            Every Thursday we bake. Friday through Tuesday, our little cheesecake
            fridge is open — drive over on your own time, pay, and take home a slice
            (or a whole cake).
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#flavors"
              className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent"
            >
              See this week's flavors
            </a>
            <a
              href="#how"
              className="rounded-full border border-border bg-transparent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
            >
              How self-serve works
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-secondary" />
          <img
            src={heroImg}
            alt="A single slice of Andielicious cheesecake on a matte black plate"
            width={1400}
            height={1600}
            className="aspect-[7/8] w-full rounded-3xl object-cover shadow-xl"
          />
          <div className="absolute -bottom-6 left-6 max-w-[220px] rounded-2xl border border-border bg-background p-5 shadow-lg">
            <p className="font-display text-lg italic leading-snug">
              "Tastes homemade because it is."
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              — a happy neighbor
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FLAVORS = [
  {
    tag: "Always on the menu",
    name: "Classic Vanilla Bean",
    desc: "Our signature. Tall, silky, Madagascar vanilla with a buttery graham crust.",
    img: flavorClassic,
  },
  {
    tag: "Always on the menu",
    name: "Deep Chocolate Ganache",
    desc: "Dark chocolate cheesecake blanketed in glossy ganache. For the serious sweet tooth.",
    img: flavorChocolate,
  },
  {
    tag: "This week's rotating flavor",
    name: flavorOfTheWeek.name,
    desc: flavorOfTheWeek.description,
    img: flavorOfTheWeek.image,
  },
];

function FlavorOfTheWeek() {
  if (!flavorOfTheWeek.visible) return null;
  return (
    <section id="flavor-of-the-week" className="border-t border-border py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1fr_1.05fr]">
        <div className="relative order-2 md:order-1">
          <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-secondary" />
          <img
            src={flavorOfTheWeek.image}
            alt={flavorOfTheWeek.name}
            width={1200}
            height={1200}
            className="aspect-square w-full rounded-3xl object-cover shadow-xl"
          />
        </div>
        <div className="order-1 md:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            {flavorOfTheWeek.weekLabel}
          </p>
          <h2 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">
            <em className="font-normal italic text-accent">Flavor</em> of the week
          </h2>
          <p className="mt-6 font-display text-3xl md:text-4xl">{flavorOfTheWeek.name}</p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            {flavorOfTheWeek.description}
          </p>
          <a
            href="#hours"
            className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent"
          >
            Reserve a slice
          </a>
        </div>
      </div>
    </section>
  );
}

function Flavors() {
  return (
    <section id="flavors" className="border-t border-border bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">The Menu</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Two staples. One surprise.</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Every whole cheesecake is $38. Individual slices $7. Pay ahead by DM, or in
            person at the fridge.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {FLAVORS.map((f) => (
            <article key={f.name} className="group flex flex-col">
              <div className="overflow-hidden rounded-2xl bg-background">
                <img
                  src={f.img}
                  alt={f.name}
                  loading="lazy"
                  width={900}
                  height={900}
                  className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                {f.tag}
              </p>
              <h3 className="mt-2 font-display text-2xl">{f.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </article>
          ))}
        </div>
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
        "Every Thursday, Andie bakes the week's cheesecakes fresh from scratch. Follow along on the socials to see what's coming.",
    },
    {
      n: "02",
      title: "Order ahead (optional)",
      body:
        "You can reserve a whole cake or slice by messaging us ahead of time. Payment can be sent in advance to lock in your order.",
    },
    {
      n: "03",
      title: "Drive over & pick up",
      body:
        "Come by any time Friday through Tuesday, 8am–9pm. Grab your cheesecake from the self-serve fridge, pay if you haven't, and enjoy.",
    },
  ];
  return (
    <section id="how" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Self-Serve, Simplified</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">How it works</h2>
        </div>

        <ol className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="border-t border-border pt-6">
              <span className="font-display text-4xl italic text-accent">{s.n}</span>
              <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Visit</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Open five days a week.</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-primary-foreground/70">
            Bake day is Thursday — the fridge is closed while Andie's in the kitchen.
            Come by any other day and help yourself.
          </p>
          <a
            href="mailto:hello@andielicious.com"
            className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Reserve a cheesecake
          </a>
        </div>

        <dl className="divide-y divide-primary-foreground/15 border-y border-primary-foreground/15">
          {[
            ["Thursday", "Bake day — closed"],
            ["Friday", "8:00 am — 9:00 pm"],
            ["Saturday", "8:00 am — 9:00 pm"],
            ["Sunday", "8:00 am — 9:00 pm"],
            ["Monday", "8:00 am — 9:00 pm"],
            ["Tuesday", "8:00 am — 9:00 pm"],
            ["Wednesday", "Closed"],
          ].map(([day, hrs]) => (
            <div key={day} className="flex items-baseline justify-between py-4">
              <dt className="font-display text-xl">{day}</dt>
              <dd className="text-sm tracking-wide text-primary-foreground/75">{hrs}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    supabase
      .from("reviews")
      .select("id,name,rating,comment,created_at")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) console.error(error);
        setReviews((data as Review[]) ?? []);
        setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section id="reviews" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Kind Words</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">From the neighborhood.</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Have you tried one? Leave a note below — and let us know if we can share it here.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary" />
            ))
          ) : reviews.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm italic text-muted-foreground">
              Be the first to leave a review.
            </p>
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>

        <ReviewForm
          onSubmitted={(r) => {
            if (r) setReviews((prev) => [r, ...prev]);
          }}
        />
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <Stars value={review.rating} />
      <p className="mt-4 font-display text-lg italic leading-snug">"{review.comment}"</p>
      <p className="mt-auto pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        — {review.name}
      </p>
    </article>
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

function ReviewForm({ onSubmitted }: { onSubmitted: (r: Review | null) => void }) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [publicConsent, setPublicConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Please add your name and a short note.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        name: name.trim(),
        rating,
        comment: comment.trim(),
        public_consent: publicConsent,
      })
      .select("id,name,rating,comment,created_at,public_consent")
      .single();
    setSubmitting(false);

    if (error) {
      toast.error("Couldn't send your review. Try again in a moment.");
      return;
    }

    toast.success(
      publicConsent
        ? "Thank you! Your review is now on the site."
        : "Thank you! Andie will read this — it won't be shown publicly."
    );
    setName("");
    setComment("");
    setRating(5);
    setPublicConsent(false);
    if (publicConsent && data) {
      onSubmitted(data as Review);
    } else {
      onSubmitted(null);
    }
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
          <span className="font-medium">It's okay to share this review publicly</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Check this box to let Andielicious show your review on the website and on
            social media. Leave it unchecked to send Andie private feedback.
          </span>
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-fit rounded-full bg-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
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
          <img src={logoAsset.url} alt="Andielicious" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="font-display text-xl">Andielicious Cheesecake</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Since 2024
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Andielicious Cheesecake. Baked with love.
        </p>
      </div>
    </footer>
  );
}
