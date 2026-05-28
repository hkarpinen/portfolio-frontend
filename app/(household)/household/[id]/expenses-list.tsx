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

function StatusCell({ expense, householdId }: { expense: HouseholdExpense; householdId: string }) {
  const payMutation = usePayHouseholdExpense(householdId, expense.expenseId);
  const unpayMutation = useUnpayHouseholdExpense(householdId, expense.expenseId);
  const isPending = payMutation.isPending || unpayMutation.isPending;
  const isPaid = !!expense.callerIsPaid;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const occ = expense.currentOccurrenceDate ?? new Date().toISOString();
    isPaid ? unpayMutation.mutate(occ) : payMutation.mutate(occ);
  };

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
  const detailHref = `/household/${householdId}/expenses/${expense.expenseId}`;

  return (
    <tr className="group border-b border-rule-soft">
      <td className="py-7 pr-6">
        <Link
          href={detailHref}
          className="font-serif text-[1.0625rem] italic text-ink no-underline hover:text-red focus:text-red"
        >
          {expense.title}
        </Link>
      </td>
      <td className="whitespace-nowrap py-7 pr-6 font-mono text-xs uppercase tracking-[0.08em] text-ink-3">
        {expense.category ? expense.category : <span aria-label="No category">—</span>}
      </td>
      <td className="whitespace-nowrap py-7 pr-6 font-mono text-xs tracking-[0.04em] text-ink-3">
        {formattedDate}
      </td>
      {/* TODO(handoff8): wire to payer — HouseholdExpense has no payerId yet; show "—" until API returns it */}
      <td className="whitespace-nowrap py-7 pr-6 font-mono text-xs tracking-[0.04em] text-ink-3">
        <span aria-label="Payer not yet available">—</span>
      </td>
      <td className="whitespace-nowrap py-7 pr-6 text-right font-serif text-[1.0625rem] font-bold text-ink">
        {formatCurrency(Number(expense.amount), expense.currency)}
      </td>
      <td className="whitespace-nowrap py-7">
        <div className="flex items-center gap-3">
          <StatusCell expense={expense} householdId={householdId} />
          {canManage && (
            <>
              <Link
                href={`${detailHref}?edit=1`}
                className="inline-flex min-h-hit min-w-hit items-center justify-center text-ink-3 no-underline hover:text-red focus:text-red"
                aria-label={`Edit expense: ${expense.title}`}
                title="Edit"
              >
                <Icon name="edit" size={14} strokeWidth={2} aria-hidden />
              </Link>
              <button
                onClick={() => onDeleteClick(expense.expenseId)}
                disabled={isDeleting}
                className="inline-flex min-h-hit min-w-hit cursor-pointer items-center justify-center border-none bg-transparent p-0 text-ink-3 hover:text-red focus:text-red disabled:opacity-50"
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

  const targetExpense = expenses.find((e) => e.expenseId === deleteTargetId);

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
        <table className="w-full border-collapse" aria-label="Shared expenses">
          <thead>
            <tr className="border-b border-[var(--ink)]">
              <th scope="col" className="ed-kicker pb-5 pr-6 text-left font-normal">
                Expense
              </th>
              <th scope="col" className="ed-kicker pb-5 pr-6 text-left font-normal">
                Category
              </th>
              <th scope="col" className="ed-kicker pb-5 pr-6 text-left font-normal">
                Date
              </th>
              <th scope="col" className="ed-kicker pb-5 pr-6 text-left font-normal">
                Payer
              </th>
              <th scope="col" className="ed-kicker pb-5 pr-6 text-right font-normal">
                Amount
              </th>
              <th scope="col" className="ed-kicker pb-5 text-left font-normal">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <ExpenseRow
                key={expense.expenseId}
                expense={expense}
                householdId={householdId}
                canManage={canManage}
                onDeleteClick={(id) => setDeleteTargetId(id)}
                isDeleting={
                  deleteMutation.isPending && deleteMutation.variables === expense.expenseId
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
