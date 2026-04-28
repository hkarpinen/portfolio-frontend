import { requireAnonymous } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Already-signed-in users have no business on /login or /login/2fa; bounce
  // them server-side before any markup renders.
  await requireAnonymous();
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Gradient mesh blobs */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "9999px",
          background: "var(--accent-subtle)",
          filter: "blur(120px)",
          animation: "meshMove1 18s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "9999px",
          background: "var(--accent-v-subtle)",
          filter: "blur(100px)",
          animation: "meshMove2 22s ease-in-out infinite reverse",
        }} />
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: "440px" }} className="page-enter">
        {/* Logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "32px",
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-v) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--ff-display)",
            fontWeight: "700",
            fontSize: "18px",
            color: "var(--text)",
          }}>
            Portfolio
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
