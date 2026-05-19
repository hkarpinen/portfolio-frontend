import type React from "react";

export function SectionHead({
  numeral, title, accentWord, meta,
}: {
  numeral: string;
  title: React.ReactNode;
  accentWord?: string;
  meta: string;
}) {
  return (
    <div style={{
      padding: "28px 0 16px",
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 24,
      borderBottom: "1.5px solid var(--ink)",
      flexWrap: "wrap",
    }}>
      <span style={{
        fontFamily: "var(--ff-serif)",
        fontStyle: "italic",
        fontSize: "2.4rem",
        color: "var(--red)",
        lineHeight: 1,
        flexShrink: 0,
      }}>{numeral}</span>
      <h2 style={{
        fontFamily: "var(--ff-serif)",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: "var(--bs-sec-h)",
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color: "var(--ink)",
        flex: 1,
        marginLeft: 18,
      }}>{title}</h2>
      <p style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--bs-eyebrow)",
        color: "var(--ink-3)",
        textTransform: "uppercase",
        letterSpacing: "0.20em",
        maxWidth: 280,
        lineHeight: 1.6,
        textAlign: "right",
      }}>{meta}</p>
    </div>
  );
}

/* ── Dispatches ───────────────────────────────────────────────────────────────*/
