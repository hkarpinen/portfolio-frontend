"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { identityKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";

export default function TwoFactorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post("/api/identity/2fa/verify", { code });
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
      router.push("/communities");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{
      background: "var(--paper-2)",
      border: "1.5px solid var(--ink)",
      boxShadow: "var(--shadow-stamp)",
      padding: "32px",
    }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontFamily: "var(--ff-serif)", fontStyle: "italic", fontWeight: 400,
          fontSize: "var(--ts-h3)", letterSpacing: "-0.025em", color: "var(--ink)",
          marginBottom: "6px",
        }}>
          Two-factor auth<span style={{ color: "var(--red)" }}>.</span>
        </h1>
        <p style={{ fontFamily: "var(--ff-mono)", fontSize: "var(--ts-meta)", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.20em" }}>
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
            fontSize: "var(--ts-body-sm)",
            color: "var(--danger)",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{
            fontSize: "var(--ts-label)", fontWeight: "500", color: "var(--text-2)",
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
              fontSize: "var(--ts-sub)",
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

        <Button
          type="submit"
          disabled={isSubmitting || code.length !== 6}
          variant="primary"
          fullWidth
          style={{ marginTop: "4px", height: "42px" }}
        >
          {isSubmitting ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </div>
  );
}
