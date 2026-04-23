"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post("/api/identity/2fa/verify", { code });
      router.refresh();
      router.push("/communities");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "var(--shadow-lg)",
    }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{
          fontFamily: "var(--ff-display)", fontWeight: "800",
          fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)",
          marginBottom: "8px",
        }}>
          Two-factor authentication
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "var(--danger-s)",
            border: "1px solid oklch(62% 0.21 22 / 0.3)",
            fontSize: "13px",
            color: "var(--danger)",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{
            fontSize: "12px", fontWeight: "500", color: "var(--text-2)",
            letterSpacing: "0.02em",
          }}>
            Authenticator code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            style={{
              height: "38px",
              background: "var(--surface-2)",
              border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
              borderRadius: "12px",
              padding: "0 12px",
              fontSize: "20px",
              letterSpacing: "0.25em",
              color: "var(--text)",
              outline: "none",
              textAlign: "center",
              transition: "border-color 110ms, box-shadow 110ms",
            }}
            onFocus={e => {
              if (!error) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
              }
            }}
            onBlur={e => {
              if (!error) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || code.length !== 6}
          style={{
            height: "42px",
            borderRadius: "12px",
            background: (isSubmitting || code.length !== 6) ? "var(--surface-3)" : "var(--accent)",
            color: (isSubmitting || code.length !== 6) ? "var(--text-3)" : "#fff",
            border: "none",
            cursor: (isSubmitting || code.length !== 6) ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
            fontFamily: "var(--ff-display)",
            transition: "background 110ms, transform 100ms",
            marginTop: "4px",
          }}
          onMouseEnter={e => {
            if (!isSubmitting && code.length === 6)
              (e.currentTarget as HTMLElement).style.background = "var(--accent-hi)";
          }}
          onMouseLeave={e => {
            if (!isSubmitting && code.length === 6)
              (e.currentTarget as HTMLElement).style.background = "var(--accent)";
          }}
          onMouseDown={e => {
            if (!isSubmitting && code.length === 6)
              (e.currentTarget as HTMLElement).style.transform = "scale(0.97)";
          }}
          onMouseUp={e => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        >
          {isSubmitting ? "Verifying…" : "Verify"}
        </button>
      </form>
    </div>
  );
}
