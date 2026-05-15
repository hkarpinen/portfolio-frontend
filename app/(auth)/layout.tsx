import Link from "next/link";
import { requireAnonymous } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Already-signed-in users have no business on /login or /login/2fa; bounce server-side.
  await requireAnonymous();

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--paper)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Masthead strip */}
      <header style={{
        borderBottom: "3px solid var(--ink)",
        padding: "20px 5%",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--ts-card-h)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--ink)",
          }}>
            The Stack<span style={{ color: "var(--red)" }}>.</span>
          </span>
        </Link>
        <span style={{
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--ts-meta)",
          color: "var(--ink-3)",
          textTransform: "uppercase",
          letterSpacing: "0.20em",
        }}>
          Vol. I · No. 04
        </span>
      </header>

      <div style={{ borderBottom: "1px solid var(--ink-4)" }} />

      {/* Content — centered column */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Column label */}
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 22, height: 1, background: "var(--red)", display: "inline-block" }} />
            <span style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
              color: "var(--red)",
              textTransform: "uppercase",
              letterSpacing: "0.30em",
            }}>
              Reader access
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>

  );
}
