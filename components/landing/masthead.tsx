import Link from "next/link";

export function Masthead() {
  return (
    <div style={{
      padding: "32px 5% 22px",
      borderBottom: "3px solid var(--ink)",
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      gap: 28,
      alignItems: "end",
    }}
    className="landing-masthead"
    >
      {/* Left */}
      <div style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--bs-meta)",
        color: "var(--ink-2)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        lineHeight: 1.55,
        textAlign: "left",
      }}>
        <div><b style={{ color: "var(--ink)" }}>Vol. I · No. 04</b></div>
        <div>Thursday, 15 May 2026</div>
        <div>The portfolio edition</div>
      </div>

      {/* Center — Nameplate */}
      <div style={{ textAlign: "center" }}>
        <Link href="/" style={{ textDecoration: "none", display: "block" }}>
          <span style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--bs-nameplate)",
            letterSpacing: "-0.035em",
            lineHeight: 0.9,
            whiteSpace: "nowrap",
            color: "var(--ink)",
            display: "block",
          }}>
            The Stack<span style={{ color: "var(--red)" }}>.</span>
          </span>
        </Link>
        <p style={{
          fontFamily: "var(--ff-serif)",
          fontStyle: "italic",
          fontSize: "0.95rem",
          color: "var(--ink-2)",
          marginTop: 16,
        }}>&ldquo;All the code that&rsquo;s fit to ship.&rdquo;</p>
      </div>

      {/* Right */}
      <div style={{
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--bs-meta)",
        color: "var(--ink-2)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        lineHeight: 1.55,
        textAlign: "right",
      }}>
        <div><b style={{ color: "var(--ink)" }}>Issue Price</b> · Free<span style={{ color: "var(--red)" }}>*</span></div>
        <div>Circulation: One reader</div>
        <div><span style={{ color: "var(--red)" }}>*</span>Hiring me costs more</div>
      </div>
    </div>
  );
}

/* ── Edition nav ──────────────────────────────────────────────────────────────*/
