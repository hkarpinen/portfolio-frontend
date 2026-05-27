"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteHousehold } from "@/hooks/use-household";
import type { MembershipResponse } from "@/types/finance";

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
    <section className="bg-paper p-12 shadow-card flex flex-col gap-6" style={{ border: "1px solid var(--danger)" }}>
      {/* border uses --danger token, not a static Tailwind color — kept as dynamic style */}
      <p className="text-sm font-bold text-red uppercase tracking-[0.1em]">
        Danger Zone
      </p>
      {!canDelete ? (
        <p className="text-base text-ink-2">
          To delete this household, first remove all other members or transfer ownership to someone else.
        </p>
      ) : showDeleteConfirm ? (
        <div className="flex flex-col gap-5" role="alert">
          <p className="text-base text-red font-semibold">
            Are you sure? Deleting this household is permanent and cannot be undone.
          </p>
          <div className="flex gap-5">
            <button
              onClick={() => deleteHousehold.mutate(householdId, { onSuccess: () => router.push("/household") })}
              disabled={deleteHousehold.isPending}
              aria-label="Confirm: permanently delete this household"
              className={`bg-red text-white py-4 px-10 text-base font-semibold font-body border-none ${deleteHousehold.isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {deleteHousehold.isPending ? "Deleting…" : "Yes, delete household"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-transparent text-ink-2 py-4 px-10 text-base font-medium cursor-pointer font-body border-ink"
            >
              Cancel
            </button>
          </div>
          {deleteHousehold.isError && (
            <p role="alert" className="text-base text-red">
              {deleteHousehold.error instanceof Error ? deleteHousehold.error.message : "Failed to delete household."}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="text-base text-ink-2">
            You are the only member. Deleting this household is permanent and cannot be undone.
          </p>
          {/* border uses --danger token — kept as dynamic style */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-soft text-red py-4 px-10 text-base font-medium cursor-pointer self-start font-body" style={{ border: "1px solid var(--danger)" }}
          >
            Delete Household
          </button>
        </>
      )}
    </section>
  );
}
