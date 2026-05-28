"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteHousehold } from "@/hooks/use-household";
import type { MembershipResponse } from "@/types/membership";
import { Btn } from "@/components/editorial/button";

interface DangerZoneProps {
  householdId: string;
  members: MembershipResponse[];
}

export function DangerZone({ householdId, members }: DangerZoneProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteHousehold = useDeleteHousehold();

  const activeMemberCount = members.filter((m) => m.isActive).length;
  const canDelete = activeMemberCount <= 1;

  return (
    <section
      className="flex flex-col gap-6 bg-paper p-12 shadow-card"
      style={{ border: "1px solid var(--danger)" }}
    >
      {/* border uses --danger token, not a static Tailwind color — kept as dynamic style */}
      <p className="text-sm font-bold uppercase tracking-[0.1em] text-red">Danger Zone</p>
      {!canDelete ? (
        <p className="text-base text-ink-2">
          To delete this household, first remove all other members or transfer ownership to someone
          else.
        </p>
      ) : showDeleteConfirm ? (
        <div className="flex flex-col gap-5" role="alert">
          <p className="text-base font-semibold text-red">
            Are you sure? Deleting this household is permanent and cannot be undone.
          </p>
          <div className="flex gap-5">
            <Btn
              variant="danger"
              onClick={() =>
                deleteHousehold.mutate(householdId, { onSuccess: () => router.push("/household") })
              }
              disabled={deleteHousehold.isPending}
              aria-label="Confirm: permanently delete this household"
            >
              {deleteHousehold.isPending ? "Deleting…" : "Yes, delete household"}
            </Btn>
            <Btn variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Btn>
          </div>
          {deleteHousehold.isError && (
            <p role="alert" className="text-base text-red">
              {deleteHousehold.error instanceof Error
                ? deleteHousehold.error.message
                : "Failed to delete household."}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="text-base text-ink-2">
            You are the only member. Deleting this household is permanent and cannot be undone.
          </p>
          <Btn variant="danger" onClick={() => setShowDeleteConfirm(true)} className="self-start">
            Delete Household
          </Btn>
        </>
      )}
    </section>
  );
}
