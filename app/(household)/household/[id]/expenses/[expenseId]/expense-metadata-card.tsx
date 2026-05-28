"use client";

import type { HouseholdExpense } from "@/types/household-expense";
import { formatCurrency, formatFullDate } from "@/lib/formatting";

/** Four-column "amount · date · payer · category" card under the expense header. */
export function ExpenseMetadataCard({ expense }: { expense: HouseholdExpense }) {
  return (
    <div
      className="grid grid-cols-2 gap-px border border-rule bg-[var(--rule)] sm:grid-cols-4"
      aria-label="Expense details"
    >
      <div className="flex flex-col gap-1 bg-paper p-5">
        <p className="ed-kicker text-ink-3">Amount</p>
        <p className="font-serif text-[1.5rem] font-bold leading-none text-red">
          {formatCurrency(Number(expense.amount), expense.currency ?? "USD")}
        </p>
      </div>
      <div className="flex flex-col gap-1 bg-paper p-5">
        <p className="ed-kicker text-ink-3">Date</p>
        <p className="font-mono text-sm text-ink">{formatFullDate(expense.dueDate)}</p>
      </div>
      <div className="flex flex-col gap-1 bg-paper p-5">
        <p className="ed-kicker text-ink-3">Payer</p>
        {/* TODO(handoff8): wire to payer — HouseholdExpense has no payerId field yet */}
        <p className="font-mono text-sm text-ink-3">—</p>
      </div>
      <div className="flex flex-col gap-1 bg-paper p-5">
        <p className="ed-kicker text-ink-3">Category</p>
        {expense.category ? (
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-ink-3">
            {String(expense.category)}
          </span>
        ) : (
          <span className="font-mono text-sm text-ink-3">—</span>
        )}
      </div>
    </div>
  );
}
