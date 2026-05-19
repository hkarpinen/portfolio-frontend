import { Btn } from "@/components/editorial/button";
import { Icon } from "@/components/editorial/icon";

export function Lede() {
  return (
    <section style={{
      padding: "52px 0 40px",
      borderBottom: "3px double var(--ink)",
    }}>
      {/* Kicker */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ width: 28, height: 1, background: "var(--red)", display: "inline-block" }} />
        <span style={{
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--bs-meta)",
          color: "var(--red)",
          textTransform: "uppercase",
          letterSpacing: "0.32em",
        }}>Lead Story · Engineering desk · 4 min read</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "8fr 4fr",
        gap: 56,
        alignItems: "end",
      }} className="lede-grid">
        {/* Headline */}
        <div>
          <h1 style={{
            fontFamily: "var(--ff-serif)",
            fontWeight: 400,
            fontSize: "var(--bs-headline)",
            lineHeight: 0.86,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
          }}>
            A full-stack app,<br />
            <span style={{ display: "block", fontStyle: "italic", color: "var(--red)", textIndent: "1.6em" }}>built</span>
            <span style={{ display: "block", fontStyle: "italic" }}>from scratch.</span>
          </h1>
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--bs-meta)",
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.24em",
            marginTop: 22,
          }}>By Hank Karpinen · Filed from localhost</p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Btn href="/about" variant="primary" size="lg" iconRight={<Icon name="arrowRight" size={14} />}>View the work</Btn>
            <Btn href="/bills" variant="secondary" size="lg">Explore the modules</Btn>
          </div>
        </div>

        {/* Aside — dropcap column */}
        <div style={{
          borderLeft: "1.5px solid var(--ink)",
          paddingLeft: 28,
          fontFamily: "var(--ff-body)",
          fontSize: "var(--bs-col)",
          lineHeight: 1.55,
          color: "var(--ink-2)",
        }} className="lede-aside">
          {/* Dropcap paragraph */}
          <p style={{ marginBottom: 14 }}>
            <span style={{
              fontFamily: "var(--ff-serif)",
              fontStyle: "italic",
              fontSize: "var(--bs-dropcap)",
              color: "var(--red)",
              float: "left",
              lineHeight: 0.85,
              padding: "6px 10px 0 0",
            }}>I</span>
            t started because microservices articles always handwave the boundaries. Six services, six Postgres databases, one Compose file. Within a week you find out which of your choices were lazy. Some were mine. I rewrote the Household service twice.
          </p>

          {/* Pull quote */}
          <blockquote style={{
            borderTop: "1px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
            padding: "14px 0",
            margin: "16px 0",
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--bs-card-h)",
            color: "var(--ink)",
            lineHeight: 1.25,
          }}>
            &ldquo;Identity, Household, Finance, Forum, Notifications. Six services. One frontend that ties them together.&rdquo;
          </blockquote>

          <p>
            <b>.NET 8</b> on the back, <b>Next.js</b> on the front, <b>Postgres</b> for storage, <b>RabbitMQ</b> for the bus, <b>Nginx</b> in front. No Auth0 — I wanted to know what JWT rotation actually looked like.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Ledger strip ─────────────────────────────────────────────────────────────*/
