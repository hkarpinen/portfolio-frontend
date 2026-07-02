"use client";

import { Btn, ConfirmDeleteDialog } from "@/components/editorial";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteHousehold } from "@/hooks/use-household";
import type { MembershipResponse } from "@/types/membership";

interface DangerZoneProps {
  householdId: string;
  householdName?: string;
  members: MembershipResponse[];
}

/**
 * Permanent household deletion. The audit (§5.2) called out this flow as
 * one of three sites that hand-rolled the confirm-delete state; routes
 * through `<ConfirmDeleteDialog>` instead. `requireText` makes the user
 * type the household name before the confirm button enables — an extra
 * gate on the most irreversible action in the app.
 */
export function DangerZone({ householdId, householdName, members }: DangerZoneProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const deleteHousehold = useDeleteHousehold();

  // Active members are those who have joined (no pending invitation code).
  const activeMemberCount = members.filter((m) => !m.pendingInvitationCode).length;
  const canDelete = activeMemberCount <= 1;

  return (
    <section
      className="flex flex-col gap-6 bg-paper p-12"
      style={{ border: "1px solid var(--danger)" }}
    >
      {/* border uses --danger token, not a static Tailwind color — kept as dynamic style */}
      <p className="text-sm font-bold uppercase tracking-[0.1em] text-red">Danger Zone</p>
      {!canDelete ? (
        <p className="text-base text-ink-2">
          To delete this household, first remove all other members or transfer ownership to someone
          else.
        </p>
      ) : (
        <>
          <p className="text-base text-ink-2">
            You are the only member. Deleting this household is permanent and cannot be undone.
          </p>
          <Btn variant="danger" onClick={() => setOpen(true)} className="self-start">
            Delete Household
          </Btn>
        </>
      )}

      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this household?"
        body="This permanently removes the household, every shared expense, and every split. There is no undo."
        confirmLabel="Delete household"
        isPending={deleteHousehold.isPending}
        requireText={
          householdName
            ? { expectedText: householdName, label: `Type "${householdName}" to confirm` }
            : undefined
        }
        onConfirm={() =>
          deleteHousehold.mutate(householdId, {
            onSuccess: () => router.push("/household"),
          })
        }
      />

      {deleteHousehold.isError && (
        <p role="alert" className="text-base text-red">
          {deleteHousehold.error instanceof Error
            ? deleteHousehold.error.message
            : "Failed to delete household."}
        </p>
      )}
    </section>
  );
}
