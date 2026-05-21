import type React from "react";

export function LedgerStrip() {
  const cells = [
    { n: "07",   italic: false, desc: "Modules shipped" },
    { n: "30+",  italic: true,  desc: "Screens designed" },
    { n: "07",   italic: false, desc: "Services standing" },
    { n: "100%", italic: true,  desc: "TypeScript frontend" },
  ];

  return (
    <div style={{
      padding: "24px 0",
      borderBottom: "1.5px solid var(--ink)",
      display: "grid",
      gridTemplateColumns: "auto repeat(4, 1fr)",
      alignItems: "stretch",
    }} className="ledger-strip">
      {/* Label cell — desktop only */}
      <div className="ledger-label" style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--bs-eyebrow)",
        color: "var(--ink-3)",
        textTransform: "uppercase",
        letterSpacing: "0.22em",
        alignSelf: "end",
        paddingRight: 28,
        borderRight: "1.5px solid var(--ink)",
        maxWidth: 200,
      }}>The figures, at a glance →</div>

      {cells.map((cell, i) => (
        <div key={i} style={{
          padding: "6px 22px",
          borderRight: i < cells.length - 1 ? "1.5px solid var(--ink)" : undefined,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}>
          <span style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: cell.italic ? "italic" : "normal",
            fontSize: "var(--bs-lede-num)",
            lineHeight: 0.9,
            letterSpacing: "-0.025em",
            color: cell.italic ? "var(--red)" : "var(--ink)",
          }}>{cell.n}</span>
          <span style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--bs-eyebrow)",
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            marginTop: 8,
          }}>{cell.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Section header shared ────────────────────────────────────────────────────*/
