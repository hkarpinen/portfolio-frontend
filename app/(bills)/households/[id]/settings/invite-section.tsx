"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGenerateInvite } from "@/hooks/use-household";

export function InviteSection({ householdId }: { householdId: string }) {
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const generateInviteMutation = useGenerateInvite(householdId);

  const onGenerateInvite = () => {
    setInviteResult(null);
    setInviteError(null);
    setCopied(false);
    generateInviteMutation.mutate(undefined, {
      onSuccess: (result) => setInviteResult((result as { invitationCode?: string })?.invitationCode ?? ""),
      onError: (err) => setInviteError(err instanceof Error ? err.message : "Failed to generate invite."),
    });
  };

  const onCopy = () => {
    if (!inviteResult) return;
    navigator.clipboard.writeText(inviteResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  return (
    <section style={cardStyle}>
      <p style={{ fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Invite Someone
      </p>
      <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-2)" }}>
        Generate a one-time invite code and share it. The recipient can use it at{" "}
        <Link href="/households/join" style={{ color: "var(--accent)", textDecoration: "none", fontFamily: "monospace", fontSize: "var(--ts-label)" }}>
          /households/join
        </Link>
        .
      </p>
      {inviteError && (
        <div style={{ background: "var(--danger-s)", border: "1px solid var(--danger)", borderRadius: "10px", padding: "10px 14px", fontSize: "var(--ts-body-sm)", color: "var(--danger)" }}>
          {inviteError}
        </div>
      )}
      {inviteResult ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <code style={{ flex: 1, fontFamily: "monospace", fontSize: "var(--ts-body)", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "10px 16px", borderRadius: "12px", color: "var(--text)", wordBreak: "break-all" }}>
              {inviteResult}
            </code>
            <button
              onClick={onCopy}
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: copied ? "var(--success)" : "var(--text-2)", padding: "8px 16px", borderRadius: "12px", fontSize: "var(--ts-body-sm)", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--ff-body)" }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setInviteResult(null)}
            style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "var(--ff-body)" }}
          >
            Generate another
          </button>
        </div>
      ) : (
        <Button onClick={onGenerateInvite} disabled={generateInviteMutation.isPending} variant="primary">
          {generateInviteMutation.isPending ? "Generating…" : "Generate Invite Code"}
        </Button>
      )}
    </section>
  );
}
