import { Reveal } from "@/components/Reveal";
import { site } from "@/content/site";

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Sunday — bake day",
      body:
        "Every Sunday, Andie bakes the week's cheesecakes fresh from scratch. Follow along on the socials and sign up on the newsletter to see what's coming.",
    },
    {
      n: "02",
      title: "Drive over & pick up",
      body:
        "Come by Monday through Thursday, 3pm–8pm, or Friday, 8am–8pm. Grab your slice from the self-serve fridge, pay if you haven't, and enjoy.",
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


export function Hours() {
  return (
    <section id="hours" className="border-y border-border bg-primary py-20 text-primary-foreground md:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:items-center">
        <Reveal variant="left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">Visit</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Open five days a week.</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-primary-foreground/75">
              Bake day is Sunday — the fridge is closed while Andie's in the kitchen.
              Come by any other day and help yourself. <span className="text-blush">{site.payment.methods}.</span>
            </p>
          </div>
        </Reveal>

        <Reveal variant="right" delay={120}>
          <dl className="divide-y divide-primary-foreground/15 border-y border-primary-foreground/15">
            {[
              ["Monday", "3:00 pm — 8:00 pm"],
              ["Tuesday", "3:00 pm — 8:00 pm"],
              ["Wednesday", "3:00 pm — 8:00 pm"],
              ["Thursday", "3:00 pm — 8:00 pm"],
              ["Friday", "8:00 am — 8:00 pm"],
              ["Saturday", "Closed"],
              ["Sunday", "Bake day — closed"],
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

export function LocationSection() {
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
