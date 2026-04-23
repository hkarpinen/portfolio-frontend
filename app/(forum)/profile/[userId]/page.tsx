export default function ProfilePage({ params }: { params: { userId: string } }) {
  const initials = params.userId.slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="page-enter">
      {/* Hero */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "24px", padding: "32px",
        boxShadow: "var(--shadow-sm)", position: "relative", overflow: "hidden",
      }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "9999px",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-v) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", fontWeight: "800", color: "#fff",
            fontFamily: "var(--ff-display)", flexShrink: 0,
            border: "3px solid var(--surface)",
          }}>
            {initials}
          </div>
          <div>
            <h1 style={{
              fontFamily: "var(--ff-display)", fontWeight: "800",
              fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)",
              marginBottom: "4px",
            }}>User Profile</h1>
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
              ID: {params.userId}
            </p>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)",
      }}>
        <h2 style={{
          fontFamily: "var(--ff-display)", fontWeight: "700",
          fontSize: "15px", color: "var(--text)", marginBottom: "12px",
        }}>Profile Info</h2>
        <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
          User profile information will appear here.
        </p>
      </div>
    </div>
  );
}
