import { Btn, Icon } from "@/components/editorial";

/**
 * Landing hero — mirrors the Terminus prototype `.hero`: a 1fr/360px
 * grid of the headline column (`.eyebrow` with `.pulse-dot`, H1 with
 * `<em>`, `.deck`, `.cta-row`, `.cta-foot`, `.hero-stat-row`) and the
 * decorative `.hero-visual` terminal readout.
 */
const HERO_STATS: [string, string][] = [
  ["4+", "Years exp"],
  ["30+", "Screens built"],
  ["AWS", "Certified"],
  ["OPEN", "To roles"],
];

export function LandingHero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div>
        <p className="eyebrow">
          <span className="pulse-dot" aria-hidden="true" />
          &nbsp;HANK KARPINEN&nbsp;·&nbsp;FULL-STACK ENGINEER&nbsp;·&nbsp;OPEN TO ROLES
        </p>
        <h1 id="hero-heading">
          A full-stack app,
          <br />
          <em>built from scratch.</em>
        </h1>
        <p className="deck">
          I&apos;m a full-stack software engineer — 4+ years&apos; experience, AWS certified. This
          whole website is a working app I built myself, front to back, so you can{" "}
          <em>see what I do</em> instead of just reading about it. Click <em>Try the demo</em> — no
          signup, no email, you&apos;re in within seconds.
        </p>
        <div className="cta-row">
          <Btn
            href="/demo"
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrowRight" size={14} strokeWidth={2} />}
          >
            $ try-demo
          </Btn>
          <Btn href="/about" variant="secondary" size="lg">
            $ see-the-work
          </Btn>
        </div>
        <p className="cta-foot">// No account needed · Demo resets nightly · No data persists</p>
        <div className="hero-stat-row">
          {HERO_STATS.map(([n, l]) => (
            <div key={l} className="hero-stat">
              <div className="n">{n}</div>
              <div className="l">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative terminal readout — presentational only, hidden from a11y tree */}
      <div className="hero-visual" aria-hidden="true" role="presentation">
        <div className="term-line">
          <span className="prompt">$</span>
          <span className="cmd">whoami</span>
        </div>
        <div className="term-line">
          <span className="prompt">&gt;</span>
          <span className="out">hank-karpinen</span>
        </div>
        <div className="term-line">
          <span className="comment">// full-stack-engineer · pullman-wa</span>
        </div>
        <div className="term-line">
          <span className="prompt">$</span>
          <span className="cmd">cat services.txt</span>
        </div>
        <div className="term-line">
          <span className="prompt">&gt;</span>
          <span className="out">identity · forum · household</span>
        </div>
        <div className="term-line">
          <span className="prompt">&gt;</span>
          <span className="out">finance · weather · convert</span>
        </div>
        <div className="term-line">
          <span className="comment">// 7 services · 1 RabbitMQ bus</span>
        </div>
        <div className="term-line">
          <span className="prompt">$</span>
          <span className="cmd">./stack --list</span>
        </div>
        <div className="term-line">
          <span className="prompt">&gt;</span>
          <span className="out">.NET 8 · Postgres · RabbitMQ</span>
        </div>
        <div className="term-line">
          <span className="prompt">&gt;</span>
          <span className="out">Next.js · TypeScript · Tailwind</span>
        </div>
        <div className="term-line">
          <span className="prompt">$</span>
          <span className="cmd">git status</span>
        </div>
        <div className="term-line">
          <span className="prompt">&gt;</span>
          <span style={{ color: "var(--green)" }}>On branch main · nothing to commit</span>
        </div>
        <div className="term-line">
          <span className="prompt">$</span>
          <span className="cmd">
            _
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 12,
                background: "var(--amber)",
                animation: "blink 1s step-end infinite",
                verticalAlign: "text-bottom",
                marginLeft: 2,
              }}
            />
          </span>
        </div>
      </div>
    </section>
  );
}
