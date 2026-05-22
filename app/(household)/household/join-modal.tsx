"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJoinHousehold } from "@/hooks/use-household";
import { ApiError } from "@/lib/api-client";
import { Btn, Modal, Alert } from "@/components/editorial";

interface JoinHouseholdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinHouseholdModal({ open, onOpenChange }: JoinHouseholdModalProps) {
  const router = useRouter();
  const joinMutation = useJoinHousehold();
  const [code, setCode] = useState("");

  function handleJoin() {
    if (!code.trim()) return;
    joinMutation.mutate(code.trim(), {
      onSuccess: () => {
        onOpenChange(false);
        router.refresh();
      },
    });
  }

  const actions = (
    <>
      <Btn variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Btn>
      <Btn
        variant="primary"
        onClick={handleJoin}
        disabled={joinMutation.isPending}
        style={{ opacity: joinMutation.isPending ? 0.6 : 1 }}
      >
        {joinMutation.isPending ? "Joining…" : "Join Household"}
      </Btn>
    </>
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Join a Household"
      actions={actions}
      maxWidth={400}
    >
      <div className="flex flex-col gap-[14px]">
        <p className="text-base text-ink-2 leading-[1.5]">
          Enter the invite code shared by a household member to join their household.
        </p>
        {joinMutation.isError && (
          <Alert variant="danger">
            {joinMutation.error instanceof ApiError ? joinMutation.error.message : "Invalid or expired invite code."}
          </Alert>
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
            className="h-[38px] w-full bg-paper-2 p-[0_12px] text-md text-ink outline-none font-mono border-ink"
            style={{ transition: "border-color 110ms, box-shadow 110ms" }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
