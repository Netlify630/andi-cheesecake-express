import { createFileRoute, Link } from "@tanstack/react-router";
import logoUrl from "@/assets/andielicious-logo.png";
import { HowItWorks, Hours, LocationSection } from "@/components/VisitSections";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit · How It Works, Hours & Location · Andielicious" },
      { name: "description", content: "How the Andielicious self-serve cheesecake fridge works, opening hours, location, and payment options." },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Visit · How It Works, Hours & Location · Andielicious" },
      { property: "og:description", content: "How the Andielicious self-serve cheesecake fridge works, opening hours, location, and payment options." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VisitPage,
});

function VisitPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoUrl} alt="Andielicious" className="h-12 w-12 rounded-full object-cover ring-2 ring-berry/40 ring-offset-2 ring-offset-background" />
            <span className="font-display text-2xl tracking-tight text-accent">Andielicious</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/flavors" className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-secondary">Flavors</Link>
            <Link to="/" className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-secondary">← Home</Link>
          </div>
        </div>
      </header>
      <HowItWorks />
      <Hours />
      <LocationSection />
      <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Andielicious Cheesecake. Baked with love.
      </footer>
    </div>
  );
}
