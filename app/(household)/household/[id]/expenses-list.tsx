"use client";

import { useState } from "react";
import Link from "next/link";
import { useHouseholdExpenses, useDeleteHouseholdExpense, usePayHouseholdExpense, useUnpayHouseholdExpense } from "@/hooks/use-expenses";
import { EmptyState } from "@/components/editorial/empty-state";
import { Icon } from "@/components/editorial/icon";
import type { HouseholdExpense, HouseholdExpenseListResponse } from "@/types/finance";
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
        aria-pressed={true}
        className="inline-flex items-center gap-[5px] font-mono text-xs tracking-[0.08em] text-ink-3 cursor-pointer border-none bg-transparent p-0 disabled:opacity-50"
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
      className="inline-flex items-center font-mono text-xs tracking-[0.08em] text-red cursor-pointer bg-transparent disabled:opacity-50"
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
  onDelete,
  isDeleting,
}: {
  expense: HouseholdExpense;
  householdId: string;
  canManage: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const formattedDate = formatShortDate(expense.dueDate);
  const detailHref = `/household/${householdId}/expenses/${expense.expenseId}`;

  return (
    <tr className="border-b border-[var(--rule-soft)] group">
      <td className="py-[14px] pr-6">
        <Link
          href={detailHref}
          className="font-serif italic text-ink text-[1.0625rem] no-underline hover:text-red focus:text-red"
        >
          {expense.title}
        </Link>
      </td>
      <td className="py-[14px] pr-6 font-mono text-xs tracking-[0.08em] uppercase text-ink-3 whitespace-nowrap">
        {expense.category ? expense.category : (
          <span aria-label="No category">—</span>
        )}
      </td>
      <td className="py-[14px] pr-6 font-mono text-xs tracking-[0.04em] text-ink-3 whitespace-nowrap">
        {formattedDate}
      </td>
      {/* TODO(handoff8): wire to payer — HouseholdExpense has no payerId yet; show "—" until API returns it */}
      <td className="py-[14px] pr-6 font-mono text-xs tracking-[0.04em] text-ink-3 whitespace-nowrap">
        <span aria-label="Payer not yet available">—</span>
      </td>
      <td className="py-[14px] pr-6 text-right font-serif font-bold text-ink text-[1.0625rem] whitespace-nowrap">
        {formatCurrency(Number(expense.amount), expense.currency)}
      </td>
      <td className="py-[14px] whitespace-nowrap">
        <div className="flex items-center gap-3">
          <StatusCell expense={expense} householdId={householdId} />
          {canManage && !confirmDelete && (
            <>
              <Link
                href={`${detailHref}?edit=1`}
                className="inline-flex items-center justify-center w-7 h-7 text-ink-3 hover:text-red focus:text-red no-underline"
                aria-label={`Edit expense: ${expense.title}`}
                title="Edit"
              >
                <Icon name="edit" size={14} strokeWidth={2} aria-hidden />
              </Link>
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center w-7 h-7 text-ink-3 hover:text-red focus:text-red cursor-pointer border-none bg-transparent p-0 disabled:opacity-50"
                aria-label={`Delete expense: ${expense.title}`}
                title="Delete"
              >
                <Icon name="trash" size={14} strokeWidth={2} aria-hidden />
              </button>
            </>
          )}
          {canManage && confirmDelete && (
            <span className="flex items-center gap-2">
              <button
                onClick={() => { onDelete(expense.expenseId); setConfirmDelete(false); }}
                disabled={isDeleting}
                className="font-mono text-xs tracking-[0.08em] text-red cursor-pointer border-none bg-transparent p-0 disabled:opacity-50"
                aria-label={`Confirm delete expense: ${expense.title}`}
              >
                {isDeleting ? "…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-mono text-xs tracking-[0.08em] text-ink-3 cursor-pointer border-none bg-transparent p-0"
                aria-label="Cancel delete"
              >
                Cancel
              </button>
            </span>
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

  const onDelete = (householdExpenseId: string) => {
    deleteMutation.mutate(householdExpenseId);
  };

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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" aria-label="Shared expenses">
        <thead>
          <tr className="border-b border-[var(--ink)]">
            <th scope="col" className="text-left ed-kicker pb-[10px] pr-6 font-normal">Expense</th>
            <th scope="col" className="text-left ed-kicker pb-[10px] pr-6 font-normal">Category</th>
            <th scope="col" className="text-left ed-kicker pb-[10px] pr-6 font-normal">Date</th>
            <th scope="col" className="text-left ed-kicker pb-[10px] pr-6 font-normal">Payer</th>
            <th scope="col" className="text-right ed-kicker pb-[10px] pr-6 font-normal">Amount</th>
            <th scope="col" className="text-left ed-kicker pb-[10px] font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.expenseId}
              expense={expense}
              householdId={householdId}
              canManage={canManage}
              onDelete={onDelete}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
