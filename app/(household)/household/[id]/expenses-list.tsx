"use client";

import { ConfirmDeleteDialog, EmptyState, Icon } from "@/components/editorial";
import { useState } from "react";
import Link from "next/link";
import {
  useHouseholdExpenses,
  useDeleteHouseholdExpense,
  usePayHouseholdExpense,
  useUnpayHouseholdExpense,
} from "@/hooks/use-expenses";

import type { HouseholdExpense, HouseholdExpenseListResponse } from "@/types/household-expense";
import { formatCurrency, formatShortDate } from "@/lib/formatting";
import { useMe } from "@/hooks/use-identity";
import { idsEqual } from "@/lib/utils";

function StatusCell({ expense, householdId }: { expense: HouseholdExpense; householdId: string }) {
  const payMutation = usePayHouseholdExpense(householdId, expense.chargeId);
  const unpayMutation = useUnpayHouseholdExpense(householdId, expense.chargeId);
  const isPending = payMutation.isPending || unpayMutation.isPending;
  const isPaid = !!expense.isPaid;
  const { data: me } = useMe();
  // Under front-and-reimburse the payer's own share is covered by fronting the vendor (a static
  // badge, not a reversible toggle). Under the shared pot the payer settles like everyone else.
  const isPayer =
    idsEqual(expense.payerUserId, me?.id) && expense.fundingSource !== "GroupCash";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const occ = expense.currentOccurrenceDate ?? new Date().toISOString();
    isPaid ? unpayMutation.mutate(occ) : payMutation.mutate(occ);
  };

  // The bill itself hasn't been paid yet — shares aren't settleable until it is. Link to the
  // detail page where it can be marked paid.
  if (expense.vendorPaid === false) {
    return (
      <Link
        href={`/household/${householdId}/expenses/${expense.chargeId}`}
        className="inline-flex items-center gap-[5px] font-mono text-xs uppercase tracking-[0.08em] text-red no-underline hover:opacity-80"
        aria-label={`${expense.title}: upcoming — not yet paid. Open to mark it paid.`}
      >
        <Icon name="alert" size={11} strokeWidth={2} aria-hidden />
        <span>Upcoming</span>
      </Link>
    );
  }

  if (isPayer) {
    return (
      <span
        className="inline-flex items-center gap-[5px] font-mono text-xs tracking-[0.08em] text-ink-3"
        aria-label={`${expense.title}: you paid the bill — your share is covered`}
      >
        <Icon name="check" size={11} strokeWidth={2.5} aria-hidden />
        <span>COVERED</span>
      </span>
    );
  }

  if (isPaid) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={`${expense.title}: marked as paid. Click to undo.`}
        aria-pressed
        className="inline-flex cursor-pointer items-center gap-[5px] border-none bg-transparent p-0 font-mono text-xs tracking-[0.08em] text-ink-3 disabled:opacity-50"
      >
        <Icon name="check" size={11} strokeWidth={2.5} aria-hidden />
        <span>PAID</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={`${expense.title}: open, not yet paid. Click to mark as paid.`}
      aria-pressed={false}
      className="inline-flex cursor-pointer items-center bg-transparent font-mono text-xs tracking-[0.08em] text-red disabled:opacity-50"
      style={{ border: "1px solid var(--red)", padding: "3px 8px" }}
    >
      <span>OPEN</span>
    </button>
  );
}

/** Confirm-before-delete row — no inaccessible browser confirm() dialog.
 *  `canManage` (Owner/Admin) gates both Edit and Delete affordances; non-
 *  privileged members see neither and can only navigate to the detail page
 *  via the bill title link. */
function ExpenseRow({
  expense,
  householdId,
  canManage,
  onDeleteClick,
  isDeleting,
}: {
  expense: HouseholdExpense;
  householdId: string;
  canManage: boolean;
  onDeleteClick: (id: string) => void;
  isDeleting: boolean;
}) {
  const formattedDate = formatShortDate(expense.dueDate);
  const detailHref = `/household/${householdId}/expenses/${expense.chargeId}`;

  return (
    <tr>
      <td>
        <Link
          href={detailHref}
          className="font-serif text-base font-bold text-ink no-underline hover:text-red focus:text-red"
        >
          {expense.title}
        </Link>
        {/* Mobile: category + date collapse under the title so the table fits a phone. */}
        <p className="ed-hint mt-0.5 sm:hidden">
          {expense.category ? expense.category : "—"} · {formattedDate}
        </p>
      </td>
      <td className="muted hidden sm:table-cell">
        {expense.category ? expense.category : <span aria-label="No category">—</span>}
      </td>
      <td className="muted hidden sm:table-cell">{formattedDate}</td>
      {/* TODO(handoff8): wire to payer — HouseholdExpense has no payerId yet; show "—" until API returns it */}
      <td className="muted hidden sm:table-cell">
        <span aria-label="Payer not yet available">—</span>
      </td>
      <td className="num">{formatCurrency(Number(expense.amount), expense.currency)}</td>
      <td>
        <div className="flex items-center gap-2">
          <StatusCell expense={expense} householdId={householdId} />
          {canManage && (
            <>
              <Link
                href={`${detailHref}?edit=1`}
                className="ed-icon-btn"
                aria-label={`Edit expense: ${expense.title}`}
                title="Edit"
              >
                <Icon name="edit" size={14} strokeWidth={2} aria-hidden />
              </Link>
              <button
                onClick={() => onDeleteClick(expense.chargeId)}
                disabled={isDeleting}
                className="ed-icon-btn disabled:opacity-50"
                aria-label={`Delete expense: ${expense.title}`}
                title="Delete"
              >
                <Icon name="trash" size={14} strokeWidth={2} aria-hidden />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export function ExpensesList({
  householdId,
  initialData,
  canManage,
}: {
  householdId: string;
  initialData: HouseholdExpenseListResponse;
  /** Owner/Admin: gates row-level Edit and Delete affordances. */
  canManage: boolean;
}) {
  const { data } = useHouseholdExpenses(householdId, initialData);
  const expenses = data?.items ?? initialData.items;
  const deleteMutation = useDeleteHouseholdExpense(householdId);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const targetExpense = expenses.find((e) => e.chargeId === deleteTargetId);

  function handleDeleteConfirm() {
    if (!deleteTargetId) return;
    deleteMutation.mutate(deleteTargetId, {
      onSuccess: () => setDeleteTargetId(null),
    });
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        glyph={<Icon name="expenses" size={24} strokeWidth={1.5} />}
        title="No expenses yet"
        body="Add your first shared expense to start tracking."
        cta={{ label: "+ Add expense", href: `/household/${householdId}/expenses/new` }}
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="ed-agate" aria-label="Shared expenses">
          <thead>
            <tr>
              <th scope="col">Expense</th>
              <th scope="col" className="hidden sm:table-cell">
                Category
              </th>
              <th scope="col" className="hidden sm:table-cell">
                Date
              </th>
              <th scope="col" className="hidden sm:table-cell">
                Payer
              </th>
              <th scope="col" className="num">
                Amount
              </th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <ExpenseRow
                key={expense.chargeId}
                expense={expense}
                householdId={householdId}
                canManage={canManage}
                onDeleteClick={(id) => setDeleteTargetId(id)}
                isDeleting={
                  deleteMutation.isPending && deleteMutation.variables === expense.chargeId
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={deleteTargetId !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteTargetId(null);
        }}
        title={`Delete "${targetExpense?.title ?? "expense"}"?`}
        body="This expense will be permanently removed from the household."
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
