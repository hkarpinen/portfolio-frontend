"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRemoveMember } from "@/hooks/use-household";

interface LeaveHouseholdProps {
  householdId: string;
  membershipId: string;
}

export function LeaveHousehold({ householdId, membershipId }: LeaveHouseholdProps) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const removeMember = useRemoveMember(householdId);

  function handleLeave() {
    if (!confirm) { setConfirm(true); return; }
    removeMember.mutate(membershipId, {
      onSuccess: () => router.push("/household"),
    });
  }

  return (
    <section className="flex flex-col gap-5 bg-paper p-6" style={{ border: "1px solid var(--danger)" }}>
      <p className="font-mono text-[0.72rem] tracking-[0.1em] uppercase text-red font-bold">Leave household</p>
      {confirm ? (
        <div className="flex flex-col gap-4" role="alert">
          <p className="ed-body text-red">Are you sure? You will lose access to this household immediately.</p>
          <div className="flex gap-3">
            <button
              onClick={handleLeave}
              disabled={removeMember.isPending}
              aria-label="Confirm: leave this household"
              className="font-mono text-[0.72rem] tracking-[0.1em] uppercase h-11 px-5 bg-red text-paper cursor-pointer border-none disabled:opacity-60"
            >
              {removeMember.isPending ? "Leaving…" : "Yes, leave"}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="font-mono text-[0.72rem] tracking-[0.1em] uppercase h-11 px-5 bg-transparent text-ink-2 cursor-pointer border border-[var(--rule)]"
            >
              Cancel
            </button>
          </div>
          {removeMember.isError && (
            <p role="alert" className="ed-hint text-red">
              {removeMember.error instanceof Error ? removeMember.error.message : "Failed to leave household."}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="ed-body text-ink-2">
            Leaving will remove you from this household. Your past expense history will remain.
          </p>
          <button
            onClick={handleLeave}
            className="self-start font-mono text-[0.72rem] tracking-[0.1em] uppercase h-11 px-5 bg-paper text-red cursor-pointer"
            style={{ border: "1px solid var(--danger)" }}
          >
            Leave household
          </button>
        </>
      )}
    </section>
  );
}
