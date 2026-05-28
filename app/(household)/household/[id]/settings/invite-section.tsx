"use client";

import { useState } from "react";
import Link from "next/link";
import { Btn, Alert, Input } from "@/components/editorial";
import { useGenerateInvite } from "@/hooks/use-household";

export function InviteSection({ householdId }: { householdId: string }) {
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const generateInviteMutation = useGenerateInvite(householdId);

  const onGenerateInvite = () => {
    setInviteResult(null);
    setInviteError(null);
    setCopied(false);
    const email = recipientEmail.trim() || undefined;
    generateInviteMutation.mutate(email, {
      onSuccess: (result) =>
        setInviteResult((result as { invitationCode?: string })?.invitationCode ?? ""),
      onError: (err) =>
        setInviteError(err instanceof Error ? err.message : "Failed to generate invite."),
    });
  };

  const onCopy = () => {
    if (!inviteResult) return;
    navigator.clipboard.writeText(inviteResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="flex flex-col gap-[16px] border-ink bg-paper-2 p-[24px] shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.1em] text-ink-3">Invite Someone</p>
      <p className="text-base text-ink-2">
        Generate a one-time invite code and share it. The recipient can use it at{" "}
        <Link href="/household/join" className="font-mono text-base text-red no-underline">
          /households/join
        </Link>
        .
      </p>
      <Input
        type="email"
        label="Send to email (optional)"
        value={recipientEmail}
        onChange={(e) => setRecipientEmail(e.target.value)}
        placeholder="recipient@example.com"
      />
      {inviteError && <Alert variant="danger">{inviteError}</Alert>}
      {inviteResult ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <code className="flex-1 break-all border-ink bg-paper-2 px-8 py-5 font-mono text-md text-ink">
              {inviteResult}
            </code>
            <Btn
              variant="secondary"
              onClick={onCopy}
              className={`whitespace-nowrap${copied ? "text-green" : ""}`}
            >
              {copied ? "Copied!" : "Copy"}
            </Btn>
          </div>
          <Btn
            variant="ghost"
            onClick={() => {
              setInviteResult(null);
              setRecipientEmail("");
            }}
            className="self-start p-0"
          >
            Generate another
          </Btn>
        </div>
      ) : (
        <Btn
          onClick={onGenerateInvite}
          disabled={generateInviteMutation.isPending}
          variant="primary"
        >
          {generateInviteMutation.isPending ? "Generating…" : "Generate Invite Code"}
        </Btn>
      )}
    </section>
  );
}
