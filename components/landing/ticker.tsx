import type React from "react";

const TICKER_PHRASES = [
  "Now hiring me", "Seven services standing", "30+ screens shipped",
  "RabbitMQ humming", "Zero downtime since last Tuesday", "Coffee consumed: 1,284 cups",
  "Open to relocate", "References available",
];

export function Ticker() {
  const items = [...TICKER_PHRASES, ...TICKER_PHRASES].map((p, i) => (
    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      {p}
      <span style={{ color: "var(--red)", fontSize: "8px" }}>▪</span>
    </span>
  ));

  return (
    <div style={{
      borderBottom: "1.5px solid var(--ink)",
      padding: "7px 0",
      display: "flex",
      alignItems: "center",
      gap: 14,
      overflow: "hidden",
      whiteSpace: "nowrap",
      fontFamily: "var(--ff-mono)",
      fontSize: "var(--bs-eyebrow)",
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      color: "var(--ink-2)",
    }}>
      <span className="pulse-dot" style={{ marginLeft: 32 }} aria-hidden="true" />
      <div style={{
        flex: 1,
        overflow: "hidden",
        maskImage: "linear-gradient(90deg, transparent, #000 40px, #000 calc(100% - 40px), transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 40px, #000 calc(100% - 40px), transparent)",
      }}>
        <div className="ticker-track">
          {items}
        </div>
      </div>
    </div>
  );
}

/* ── Masthead ─────────────────────────────────────────────────────────────────*/
