import type React from "react";

export function EditionNav() {
  return (
    <div style={{
      padding: "10px 5%",
      borderBottom: "1.5px solid var(--ink)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
      flexWrap: "wrap",
      fontFamily: "var(--ff-mono)",
      fontSize: "var(--bs-meta)",
      textTransform: "uppercase",
      letterSpacing: "0.20em",
      color: "var(--ink-2)",
    }}>
      <span>Sections within →</span>
      <div className="edition-nav-center" style={{ display: "flex", gap: 24 }}>
        {[
          { label: "Front Page", href: "#lede" },
          { label: "Architecture", href: "#dispatches" },
          { label: "Modules", href: "#modules" },
          { label: "Stack", href: "#stack" },
          { label: "Want Ads", href: "#wanted" },
        ].map(item => (
          <a
            key={item.href}
            href={item.href}
            className="lp-nav-link"
            style={{
              color: "var(--ink)",
              textDecoration: "none",
              borderBottom: "1px solid transparent",
              paddingBottom: 1,
            }}
          >{item.label}</a>
        ))}
      </div>
      <span style={{ color: "var(--red)", fontWeight: 700 }}>Filed: 15·V·2026</span>
    </div>
  );
}

/* ── Lede ─────────────────────────────────────────────────────────────────────*/
