"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJoinHousehold } from "@/hooks/use-household";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function JoinHouseholdModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const joinMutation = useJoinHousehold();
  const [code, setCode] = useState("");

  function handleJoin() {
    if (!code.trim()) return;
    joinMutation.mutate(code.trim(), {
      onSuccess: () => {
        onClose();
        router.refresh();
      },
    });
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "oklch(0% 0 0 / 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, padding: "16px",
      }}
    >
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "20px", boxShadow: "var(--shadow-lg)",
        width: "100%", maxWidth: "400px",
        animation: "scaleIn 200ms cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)", margin: 0 }}>
            Join a Household
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "4px", borderRadius: "8px", display: "flex", alignItems: "center" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.5" }}>
            Enter the invite code shared by a household member to join their household.
          </p>
          {joinMutation.isError && (
            <div style={{ background: "var(--danger-s)", border: "1px solid var(--danger)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--danger)" }}>
              {joinMutation.error instanceof ApiError ? joinMutation.error.message : "Invalid or expired invite code."}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-2)", letterSpacing: "0.02em" }}>
              Invite Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
              placeholder="Enter invite code…"
              autoFocus
              style={{
                height: "38px", width: "100%",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "0 12px",
                fontSize: "14px",
                color: "var(--text)",
                outline: "none",
                fontFamily: "monospace",
                transition: "border-color 110ms, box-shadow 110ms",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-2)", padding: "8px 16px", borderRadius: "12px",
              fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--ff-body)",
            }}
          >
            Cancel
          </button>
          <Button
            onClick={handleJoin}
            disabled={joinMutation.isPending}
            variant="primary"
            style={{ opacity: joinMutation.isPending ? 0.6 : 1 }}
          >
            {joinMutation.isPending ? "Joining…" : "Join Household"}
          </Button>
        </div>
      </div>
    </div>
  );
}
