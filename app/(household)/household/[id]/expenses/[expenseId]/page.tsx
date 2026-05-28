"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/lib/error-messages";
import { useHouseholdExpenseDetail, useDeleteHouseholdExpense } from "@/hooks/use-expenses";
import { useMe } from "@/hooks/use-identity";
import { useHousehold, useHouseholdMembers } from "@/hooks/use-household";
import { ExpenseEditForm } from "./expense-edit-form";
import { ExpenseMetadataCard } from "./expense-metadata-card";
import { ExpenseSplitsSection } from "./expense-splits-section";
import { Alert, Btn } from "@/components/editorial";

// TODO(handoff8): activity sidebar — no activity hook exists; omitted per instructions

export default function ExpensePage() {
  const { id, expenseId } = useParams<{ id: string; expenseId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: page, isLoading, error: fetchError } = useHouseholdExpenseDetail(id, expenseId);
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

  const expense = page?.expense;
  const splits = page?.splits ?? [];
  const members = householdMembers ?? [];
  const currentMembership =
    members.find((m) => me?.id && m.userId?.toLowerCase() === me.id.toLowerCase()) ?? null;
  // Ownership lives on the household entity (`ownerId`), separate from the
  // membership row's role — the owner's membership isn't always labelled
  // "Owner". Mirror the household page's `isOwner || role === "Admin"` check
  // so the owner sees Edit/Delete here too.
  const isOwner = !!(
    me?.id &&
    household?.ownerId &&
    me.id.toLowerCase() === household.ownerId.toLowerCase()
  );
  const isPrivileged =
    isOwner || currentMembership?.role === "Owner" || currentMembership?.role === "Admin";

  function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    deleteMutation.mutate(expenseId, {
      onSuccess: () => router.push(`/household/${id}`),
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="h-16 w-16 animate-spin border-2 border-ink-4 border-t-[var(--ink)]" />
      </div>
    );
  }

  if (fetchError) {
    return <Alert variant="danger">{getErrorMessage(fetchError, "Failed to load expense.")}</Alert>;
  }

  if (!expense) return null;

  return (
    <div className="page-enter flex max-w-[800px] flex-col gap-10">
      <Link href={`/household/${id}`} className="ed-label-muted no-underline hover:text-red">
        ← Back to household
      </Link>

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
          expenseId={expenseId}
          onClose={() => setEditOpen(false)}
        />
      )}

      <ExpenseMetadataCard expense={expense} />

      <ExpenseSplitsSection
        householdId={id}
        expenseId={expenseId}
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
