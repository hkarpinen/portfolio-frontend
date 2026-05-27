"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRemoveMember } from "@/hooks/use-household";
import { ConfirmDeleteDialog } from "@/components/editorial/confirm-delete-dialog";

interface LeaveHouseholdProps {
  householdId: string;
  membershipId: string;
}

export function LeaveHousehold({ householdId, membershipId }: LeaveHouseholdProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const removeMember = useRemoveMember(householdId);

  function handleConfirm() {
    removeMember.mutate(membershipId, {
      onSuccess: () => router.push("/household"),
    });
  }

  return (
    <section className="flex flex-col gap-5 bg-paper p-6" style={{ border: "1px solid var(--danger)" }}>
      <p className="font-mono text-[0.72rem] tracking-[0.1em] uppercase text-red font-bold">Leave household</p>
      <p className="ed-body text-ink-2">
        Leaving will remove you from this household. Your past expense history will remain.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="self-start font-mono text-[0.72rem] tracking-[0.1em] uppercase h-11 px-5 bg-paper text-red cursor-pointer"
        style={{ border: "1px solid var(--danger)" }}
      >
        Leave household
      </button>

      {removeMember.isError && (
        <p role="alert" className="ed-hint text-red">
          {removeMember.error instanceof Error ? removeMember.error.message : "Failed to leave household."}
        </p>
      )}

      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title="Leave household?"
        body="Are you sure? You will lose access to this household immediately."
        confirmLabel="Yes, leave"
        isPending={removeMember.isPending}
        onConfirm={handleConfirm}
      />
    </section>
  );
}
