import { Btn } from "@/components/editorial/button";
import { Icon } from "@/components/editorial/icon";

export function Wanted() {
  return (
    <section id="wanted" style={{
      padding: "60px 0 50px",
      borderBottom: "3px double var(--ink)",
      display: "grid",
      gridTemplateColumns: "5fr 7fr",
      gap: 56,
      alignItems: "center",
    }} className="wanted-grid">
      {/* Stamp */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="wanted-stamp">
          <p style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--bs-wanted-st)",
            color: "var(--red)",
            letterSpacing: "-0.02em",
            lineHeight: 0.9,
          }}>Wanted</p>
          <div style={{ width: "60%", height: 1, background: "var(--ink)", margin: "14px auto" }} />
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--bs-meta)",
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            color: "var(--ink)",
            marginBottom: 10,
          }}>Full-Stack Roles</p>
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "0.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "var(--ink-3)",
            lineHeight: 1.8,
          }}>Apply within<br />References on file<br />Reward: gainful employment</p>
        </div>
      </div>

      {/* Body */}
      <div>
        <h2 style={{
          fontFamily: "var(--ff-serif)",
          fontWeight: 400,
          fontSize: "var(--bs-wanted)",
          lineHeight: 0.95,
          letterSpacing: "-0.025em",
          marginBottom: 18,
          color: "var(--ink)",
        }}>Let&rsquo;s <em style={{ color: "var(--red)" }}>work</em> together.</h2>
        <p style={{
          fontFamily: "var(--ff-body)",
          fontSize: "var(--bs-note)",
          color: "var(--ink-2)",
          lineHeight: 1.5,
          maxWidth: 520,
          marginBottom: 22,
        }}>
          Currently open to full-stack engineering roles — remote, hybrid, or on-site for the right team. Senior or staff. I write the database migrations, the auth flows, <em>and</em> the marketing site.
        </p>

        {/* Contact lines */}
        <div style={{
          borderTop: "1px solid var(--ink)",
          paddingTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--bs-micro)",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "var(--ink-2)",
          marginBottom: 24,
        }}>
          {[
            { label: "Email",    value: "hank@thestack.dev", href: "mailto:hank@thestack.dev" },
            { label: "Based",    value: "Pullman, WA · open to relocate", href: undefined },
            { label: "GitHub",   value: "github.com/hkarpinen", href: "https://github.com/hkarpinen" },
            { label: "LinkedIn", value: "/in/hank-karpinen", href: "https://linkedin.com/in/hank-karpinen" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", gap: 16 }}>
              <span style={{ color: "var(--ink-3)", minWidth: 60 }}>{row.label}</span>
              {row.href ? (
                <a href={row.href} style={{ color: "var(--ink)", textDecoration: "underline" }}>{row.value}</a>
              ) : (
                <span style={{ color: "var(--ink)" }}>{row.value}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn href="mailto:hank@thestack.dev" variant="primary" size="lg" iconRight={<Icon name="arrowRight" size={14} />}>Reply by post</Btn>
          <Btn href="/about" variant="secondary" size="lg">Tour the work</Btn>
        </div>
      </div>
    </section>
  );
}

/* ── Colophon ─────────────────────────────────────────────────────────────────*/
