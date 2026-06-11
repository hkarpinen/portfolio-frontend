"use client";

import { Alert, ArrowLink, Btn, LoadingSplash } from "@/components/editorial";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/lib/error-messages";
import { useHouseholdExpenseDetail, useDeleteHouseholdExpense } from "@/hooks/use-expenses";
import { useMe } from "@/hooks/use-identity";
import { useHousehold, useHouseholdMembers } from "@/hooks/use-household";
import { idsEqual } from "@/lib/utils";
import { ExpenseEditForm } from "./expense-edit-form";
import { ExpenseMetadataCard } from "./expense-metadata-card";
import { ExpenseSplitsSection } from "./expense-splits-section";
import { VendorPaymentPanel } from "./vendor-payment-panel";

// TODO(handoff8): activity sidebar — no activity hook exists; omitted per instructions

export default function ExpensePage() {
  const { id, chargeId } = useParams<{ id: string; chargeId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: page, isLoading, error: fetchError } = useHouseholdExpenseDetail(id, chargeId);
  const { data: me } = useMe();
  // `?edit=1` from the household list's row-level Edit link auto-opens the
  // form so the user lands directly in edit mode.
  const [editOpen, setEditOpen] = useState(() => searchParams.get("edit") === "1");
  useEffect(() => {
    if (searchParams.get("edit") === "1") setEditOpen(true);
  }, [searchParams]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { data: householdMembers } = useHouseholdMembers(id);
  const { data: household } = useHousehold(id);
  const deleteMutation = useDeleteHouseholdExpense(id);

  const expense = page?.charge;
  const splits = page?.allocations ?? [];
  const members = householdMembers ?? [];
  const currentMembership = members.find((m) => idsEqual(m.userId, me?.id)) ?? null;
  // Ownership lives on the household entity (`ownerId`), separate from the
  // membership row's role — the owner's membership isn't always labelled
  // "Owner". Mirror the household page's `isOwner || role === "Admin"` check
  // so the owner sees Edit/Delete here too. `idsEqual` returns false when
  // either side is missing, so the `me?.id && household?.ownerId &&` guards
  // are no longer needed.
  const isOwner = idsEqual(me?.id, household?.ownerId);
  const isPrivileged =
    isOwner || currentMembership?.role === "Owner" || currentMembership?.role === "Admin";

  function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    deleteMutation.mutate(chargeId, {
      onSuccess: () => router.push(`/household/${id}`),
    });
  }

  if (isLoading) {
    return <LoadingSplash kicker="Loading expense" />;
  }

  if (fetchError) {
    return <Alert variant="danger">{getErrorMessage(fetchError, "Failed to load expense.")}</Alert>;
  }

  if (!expense) return null;

  return (
    <div className="page-enter flex max-w-[800px] flex-col gap-10">
      <ArrowLink href={`/household/${id}`} direction="left" className="ed-label-muted">
        Back to household
      </ArrowLink>

      <header className="ed-section-head">
        <p className="ed-kicker">Expense</p>
        <div className="ed-section-head-row">
          <div className="min-w-0 flex-1">
            <h1 className="ed-h1">{expense.title}</h1>
            {expense.description && <p className="ed-deck mt-2">{expense.description}</p>}
          </div>
          {isPrivileged && (
            <ExpenseActions
              editOpen={editOpen}
              deleteConfirm={deleteConfirm}
              isDeleting={deleteMutation.isPending}
              onToggleEdit={() => setEditOpen((v) => !v)}
              onDelete={handleDelete}
              onCancelDelete={() => setDeleteConfirm(false)}
            />
          )}
        </div>
      </header>

      {deleteMutation.isError && (
        <Alert variant="danger">
          {getErrorMessage(deleteMutation.error, "Failed to delete expense.")}
        </Alert>
      )}

      {editOpen && isPrivileged && (
        <ExpenseEditForm
          expense={expense}
          householdId={id}
          chargeId={chargeId}
          onClose={() => setEditOpen(false)}
        />
      )}

      <ExpenseMetadataCard expense={expense} members={members} />

      <VendorPaymentPanel
        householdId={id}
        chargeId={chargeId}
        expense={expense}
        members={members}
        isOwner={idsEqual(expense.createdBy, me?.id)}
        paidCount={splits.filter((s) => s.isPaid).length}
        totalCount={splits.length}
      />

      <ExpenseSplitsSection
        householdId={id}
        chargeId={chargeId}
        expense={expense}
        splits={splits}
        members={members}
        currentMembership={currentMembership}
        isPrivileged={isPrivileged}
      />
    </div>
  );
}

function ExpenseActions({
  editOpen,
  deleteConfirm,
  isDeleting,
  onToggleEdit,
  onDelete,
  onCancelDelete,
}: {
  editOpen: boolean;
  deleteConfirm: boolean;
  isDeleting: boolean;
  onToggleEdit: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <Btn variant="secondary" size="sm" onClick={onToggleEdit}>
        {editOpen ? "Cancel" : "Edit"}
      </Btn>
      {deleteConfirm ? (
        <>
          <Btn variant="danger" size="sm" disabled={isDeleting} onClick={onDelete}>
            {isDeleting ? "Deleting…" : "Confirm delete"}
          </Btn>
          <Btn variant="ghost" size="sm" onClick={onCancelDelete}>
            Cancel
          </Btn>
        </>
      ) : (
        <Btn variant="danger" size="sm" onClick={onDelete}>
          Delete
        </Btn>
      )}
    </div>
  );
}
