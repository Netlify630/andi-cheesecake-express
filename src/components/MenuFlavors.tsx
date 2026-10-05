import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/strawberry-cheesecake.png";
import flavorClassic from "@/assets/strawberry-cheesecake.png";
import flavorChocolate from "@/assets/chocolate-caramel.png";
import { normalizeImageUrl } from "@/lib/image-url";
import { isStoredPhoto, resolveFlavorPhoto } from "@/lib/flavor-photo";
import { Reveal } from "@/components/Reveal";

export type DbFlavor = {
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

export function MenuSection({ items }: { items: DbFlavor[] }) {
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

export function HomeFlavors() {
  const [items, setItems] = useState<DbFlavor[]>([]);
  useEffect(() => {
    supabase
      .from("flavors")
      .select("id,slug,name,description,image_url,category,week_label,position,sold_out")
      .eq("active", true)
      .neq("category", "vote_option")
      .order("position", { ascending: true })
      .then(({ data }) => setItems((data as DbFlavor[]) ?? []));
  }, []);
  return (
    <>
      <MenuSection items={items} />
      <div className="-mt-8 pb-6 text-center">
        <Link to="/flavors" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-primary">
          Vote for the next flavor →
        </Link>
      </div>
    </>
  );
}
