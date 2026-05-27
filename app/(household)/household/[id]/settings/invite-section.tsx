"use client";

import { useState } from "react";
import Link from "next/link";
import { Btn, Alert } from "@/components/editorial";
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

  return (
    <section className="border-ink bg-paper-2 p-[24px] shadow-sm flex flex-col gap-[16px]">
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
      <div className="flex flex-col gap-2">
        <label className="text-sm text-ink-3 font-body">
          Send to email <span className="text-ink-4">(optional)</span>
        </label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="recipient@example.com"
          className="bg-paper py-[10px] px-[12px] text-base text-ink font-body border-ink w-full outline-none"
        />
      </div>
      {inviteError && <Alert variant="danger">{inviteError}</Alert>}
      {inviteResult ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <code className="flex-1 font-mono text-md bg-paper-2 py-5 px-8 text-ink break-all border-ink">
              {inviteResult}
            </code>
            <Btn
              variant="secondary"
              onClick={onCopy}
              className={`whitespace-nowrap${copied ? " text-green" : ""}`}
            >
              {copied ? "Copied!" : "Copy"}
            </Btn>
          </div>
          <Btn
            variant="ghost"
            onClick={() => { setInviteResult(null); setRecipientEmail(""); }}
            className="self-start p-0"
          >
            Generate another
          </Btn>
        </div>
      ) : (
        <Btn onClick={onGenerateInvite} disabled={generateInviteMutation.isPending} variant="primary">
          {generateInviteMutation.isPending ? "Generating…" : "Generate Invite Code"}
        </Btn>
      )}
    </section>
  );
}
