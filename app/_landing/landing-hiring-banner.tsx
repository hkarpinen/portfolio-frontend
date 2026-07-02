import { Btn, Icon } from "@/components/editorial";

/**
 * CURRENTLY_OPEN_TO_ROLES — the Terminus landing's closing banner.
 *
 * Mirrors the prototype `.public-section` > `.banner.accent`: a left
 * block (kicker + `.b-title` + availability line) and a `.cta-row` with
 * the direct email and a `$ get-in-touch →` link to /contact.
 */
export function LandingHiringBanner() {
  return (
    <section className="public-section">
      <div className="banner accent" aria-label="Hiring — get in touch">
        <div>
          <div className="kicker" style={{ marginBottom: 8 }}>
            // CURRENTLY_OPEN_TO_ROLES
          </div>
          <div className="b-title">Let&apos;s work together.</div>
          <p style={{ marginTop: 8, fontSize: "0.75rem" }}>
            Senior &amp; staff full-stack · Remote, hybrid, or onsite · Pullman, WA
          </p>
        </div>
        <div className="cta-row" style={{ margin: 0 }}>
          <Btn asChild variant="primary" size="lg">
            <a href="mailto:contact@hankkarpinen.com">contact@hankkarpinen.com</a>
          </Btn>
          <Btn
            href="/contact"
            variant="secondary"
            size="lg"
            iconRight={<Icon name="arrowRight" size={14} strokeWidth={2} />}
          >
            $ get-in-touch
          </Btn>
        </div>
      </div>
    </section>
  );
}
