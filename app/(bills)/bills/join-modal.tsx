"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJoinHousehold } from "@/hooks/use-household";
import { ApiError } from "@/lib/api-client";
import { Btn } from "@/components/editorial";

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
      className="fixed inset-0 flex items-center justify-center z-[50] p-8" style={{ background: "oklch(0% 0 0 / 0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-paper shadow-modal w-full max-w-[400px]" style={{ border: "1.5px solid var(--ink)", animation: "scaleIn 200ms cubic-bezier(0.16,1,0.3,1) both" }}>
        {/* Header */}
        <div className="py-10 px-12 flex items-center justify-between" style={{ borderBottom: "1.5px solid var(--ink)" }}>
          <h2 className="font-serif font-bold text-md text-ink m-0">
            Join a Household
          </h2>
          <button
            onClick={onClose}
            className="bg-transparent cursor-pointer text-ink-3 p-2 flex items-center" style={{ border: "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="py-10 px-12 flex flex-col gap-[14px]">
          <p className="text-base text-ink-2 leading-[1.5]">
            Enter the invite code shared by a household member to join their household.
          </p>
          {joinMutation.isError && (
            <div className="bg-[rgba(178,42,26,0.10)] py-[10px] px-[14px] text-base text-red" style={{ border: "1px solid var(--danger)" }}>
              {joinMutation.error instanceof ApiError ? joinMutation.error.message : "Invalid or expired invite code."}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
              Invite Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
              placeholder="Enter invite code…"
              autoFocus
              className="h-[38px] w-full bg-paper-2 p-[0_12px] text-md text-ink outline-none font-mono" style={{ border: "1.5px solid var(--ink)", transition: "border-color 110ms, box-shadow 110ms" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--ink)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--ink-3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="py-8 px-12 flex justify-end gap-4" style={{ borderTop: "1.5px solid var(--ink)" }}>
          <button
            onClick={onClose}
            className="bg-paper-2 text-ink-2 py-4 px-8 text-base font-medium cursor-pointer font-body" style={{ border: "1.5px solid var(--ink)" }}
          >
            Cancel
          </button>
          <Btn
            onClick={handleJoin}
            disabled={joinMutation.isPending}
            variant="primary"
            style={{ opacity: joinMutation.isPending ? 0.6 : 1 }}
          >
            {joinMutation.isPending ? "Joining…" : "Join Household"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
