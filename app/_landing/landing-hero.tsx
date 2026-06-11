import { Btn, Icon } from "@/components/editorial";

/**
 * Landing hero — kicker + display headline + deck + CTA row.
 *
 * Heading semantics are tuned for "Hank Karpinen" name-search dominance:
 * the byline carries the H1 (it names the page's subject — the person),
 * and the editorial hook below carries the H2. Visual treatment is
 * unchanged — the class-based typography ed-kicker / ed-display drives
 * the look regardless of tag.
 */
export function LandingHero() {
  return (
    <section className="ed-hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading" className="ed-kicker mb-3 inline-flex items-center gap-2">
        <span className="pulse-dot" aria-hidden="true" />
        Hank Karpinen · Full-stack engineer · Open to roles
      </h1>
      <h2 className="ed-display mx-auto max-w-[18ch]">
        A full-stack app, <em>built from scratch.</em>
      </h2>
      <p className="ed-deck ed-hero-deck">
        Six services, thirty screens, hand-rolled auth and a moderation queue — all running behind a
        single Nginx gateway. Click <em>Try the demo</em> below — no signup, no email, you&apos;re
        in inside three seconds.
      </p>
      <div className="ed-hero-cta-row">
        <Btn href="/demo" variant="primary" size="lg" iconRight={<Icon name="arrowRight" size={14} strokeWidth={2} />}>
          Try the demo
        </Btn>
        <Btn asChild variant="secondary" size="lg">
          <a href="/cv.pdf" download="Hank-Karpinen-CV.pdf">
            Download CV
          </a>
        </Btn>
      </div>
      <p className="ed-hero-cta-foot">No account needed · Demo resets nightly · No data persists</p>
    </section>
  );
}
