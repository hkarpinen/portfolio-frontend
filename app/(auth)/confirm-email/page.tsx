"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    if (!token || !userId) {
      setStatus("error");
      setMessage("Missing token or userId in the confirmation link.");
      return;
    }

    api.post("/api/identity/confirm-email", { userId, token })
      .then(() => {
        setStatus("success");
        setMessage("Your email has been confirmed. You can now sign in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Network error. Please try again.");
      });
  }, [searchParams]);

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "24px",
      padding: "40px 32px",
      boxShadow: "var(--shadow-lg)",
      textAlign: "center",
    }}>
      {status === "loading" && (
        <>
          <div style={{
            width: "56px", height: "56px", borderRadius: "9999px",
            border: "2px solid var(--border-2)",
            borderTopColor: "var(--accent)",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px",
          }} />
          <p style={{ fontSize: "14px", color: "var(--text-2)" }}>Confirming your email…</p>
        </>
      )}

      {status === "success" && (
        <>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "var(--success-s)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: "var(--ff-display)", fontWeight: "800",
            fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)",
            marginBottom: "8px",
          }}>Email confirmed!</h1>
          <p style={{ fontSize: "13px", color: "var(--text-3)", lineHeight: "1.6", marginBottom: "28px" }}>
            {message}
          </p>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center",
            padding: "10px 24px", borderRadius: "12px",
            background: "var(--accent)", color: "#fff",
            fontSize: "14px", fontWeight: "600", textDecoration: "none",
            transition: "background 110ms",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--accent-hi)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--accent)"}
          >
            Sign in
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "var(--danger-s)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: "var(--ff-display)", fontWeight: "800",
            fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)",
            marginBottom: "8px",
          }}>Confirmation failed</h1>
          <p style={{ fontSize: "13px", color: "var(--text-3)", lineHeight: "1.6", marginBottom: "28px" }}>
            {message}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              padding: "10px 20px", borderRadius: "12px",
              background: "var(--accent)", color: "#fff",
              fontSize: "13px", fontWeight: "600", textDecoration: "none",
            }}>
              Try again
            </Link>
            <Link href="/login" style={{
              padding: "10px 20px", borderRadius: "12px",
              background: "var(--surface-2)", color: "var(--text-2)",
              border: "1px solid var(--border)",
              fontSize: "13px", fontWeight: "500", textDecoration: "none",
            }}>
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "24px", padding: "40px 32px", boxShadow: "var(--shadow-lg)",
          textAlign: "center",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "9999px",
            border: "2px solid var(--border-2)", borderTopColor: "var(--accent)",
            animation: "spin 0.8s linear infinite", margin: "0 auto",
          }} />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
