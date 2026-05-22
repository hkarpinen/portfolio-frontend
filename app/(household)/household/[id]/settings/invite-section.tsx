"use client";

import { useState } from "react";
import Link from "next/link";
import { Btn, Alert } from "@/components/editorial";
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
    background: "var(--paper-2)",
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  return (
    <section className="border-ink" style={cardStyle}>
      <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
        Invite Someone
      </p>
      <p className="text-base text-ink-2">
        Generate a one-time invite code and share it. The recipient can use it at{" "}
        <Link href="/household/join" className="text-red no-underline font-mono text-base">
          /households/join
        </Link>
        .
      </p>
      {inviteError && <Alert variant="danger">{inviteError}</Alert>}
      {inviteResult ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <code className="flex-1 font-mono text-md bg-paper-2 py-5 px-8 text-ink break-all border-ink">
              {inviteResult}
            </code>
            <button
              onClick={onCopy}
              className="bg-paper-2 py-4 px-8 text-base font-medium cursor-pointer whitespace-nowrap font-body border-ink" style={{color: copied ? "var(--success)" : "var(--text-2)" }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setInviteResult(null)}
            className="text-base text-ink-3 bg-transparent cursor-pointer p-0 text-left font-body" style={{ border: "none" }}
          >
            Generate another
          </button>
        </div>
      ) : (
        <Btn onClick={onGenerateInvite} disabled={generateInviteMutation.isPending} variant="primary">
          {generateInviteMutation.isPending ? "Generating…" : "Generate Invite Code"}
        </Btn>
      )}
    </section>
  );
}
