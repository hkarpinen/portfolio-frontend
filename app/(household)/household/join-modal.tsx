"use client";

import { Alert, Btn, Input, Modal } from "@/components/editorial";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJoinHousehold } from "@/hooks/use-household";
import { getErrorMessage } from "@/lib/error-messages";

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
      <Btn variant="secondary" onClick={() => onOpenChange(false)}>
        Cancel
      </Btn>
      <Btn
        variant="primary"
        onClick={handleJoin}
        disabled={joinMutation.isPending}
        className={joinMutation.isPending ? "opacity-60" : undefined}
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
        <p className="text-base leading-[1.5] text-ink-2">
          Enter the invite code shared by a household member to join their household.
        </p>
        {joinMutation.isError && (
          <Alert variant="danger">
            {getErrorMessage(joinMutation.error, "Invalid or expired invite code.")}
          </Alert>
        )}
        <Input
          label="Invite Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleJoin();
          }}
          placeholder="Enter invite code…"
          autoFocus
        />
      </div>
    </Modal>
  );
}
