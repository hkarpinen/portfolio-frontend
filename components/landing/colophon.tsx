import type React from "react";

export function Colophon() {
  return (
    <div style={{
      padding: "36px 0 50px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 32,
    }} className="colophon-grid">
      <div>
        <h5 style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--bs-lede)", marginBottom: 10, color: "var(--ink)" }}>Colophon</h5>
        <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.7rem", color: "var(--ink-2)", lineHeight: 1.55 }}>
          Set in <em>Instrument Serif</em> for display and <em>JetBrains Mono</em> for body copy. Printed on the web at 96 DPI. No models were prompted in the making of this page.
        </p>
      </div>
      <div>
        <h5 style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--bs-lede)", marginBottom: 10, color: "var(--ink)" }}>Departments</h5>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { label: "Front Page", href: "#lede" },
            { label: "Architecture Desk", href: "#dispatches" },
            { label: "Module Classifieds", href: "#modules" },
            { label: "The Stack", href: "#stack" },
            { label: "Want Ads", href: "#wanted" },
          ].map(item => (
            <a key={item.href} href={item.href} className="lp-colophon-link" style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--bs-meta)",
              color: "var(--ink)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              textDecoration: "none",
            }}>{item.label}</a>
          ))}
        </div>
      </div>
      <div>
        <h5 style={{ fontFamily: "var(--ff-serif)", fontStyle: "italic", fontSize: "var(--bs-lede)", marginBottom: 10, color: "var(--ink)" }}>Contact the editor</h5>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { label: "hank@thestack.dev", href: "mailto:hank@thestack.dev" },
            { label: "github.com/hkarpinen", href: "https://github.com/hkarpinen" },
            { label: "linkedin.com/in/hank-karpinen", href: "https://linkedin.com/in/hank-karpinen" },
          ].map(item => (
            <a key={item.href} href={item.href} className="lp-colophon-link" style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--bs-meta)",
              color: "var(--ink)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              textDecoration: "none",
            }}>{item.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Endmark ──────────────────────────────────────────────────────────────────*/
