export default function ModLogPage({ params }: { params: { slug: string } }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="page-enter">
      <div>
        <h1 style={{
          fontFamily: "var(--ff-display)", fontWeight: "800",
          fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)",
          marginBottom: "4px",
        }}>Moderation Log</h1>
        <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
          r/{params.slug}
        </p>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "48px 24px",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "var(--accent-subtle)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.75}>
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          </svg>
        </div>
        <p style={{ fontSize: "14px", fontWeight: "600", fontFamily: "var(--ff-display)", color: "var(--text)", marginBottom: "4px" }}>
          No moderation actions yet
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
          Moderation actions will appear here.
        </p>
      </div>
    </div>
  );
}
