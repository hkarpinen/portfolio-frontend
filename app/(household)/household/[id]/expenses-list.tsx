"use client";

import Link from "next/link";
import { useHouseholdExpenses, useDeleteHouseholdExpense } from "@/hooks/use-expenses";
import { MarkPaidButton } from "./mark-paid-button";
import styles from "./expenses-list.module.css";
import { cn } from "@/lib/utils";
import type { HouseholdExpenseListResponse } from "@/types/finance";

interface ExpensesListProps {
  householdId: string;
  initialData: HouseholdExpenseListResponse;
  canDelete: boolean;
}

export function ExpensesList({ householdId, initialData, canDelete }: ExpensesListProps) {
  const { data } = useHouseholdExpenses(householdId, initialData);
  const expenses = data?.items ?? initialData.items;
  const deleteMutation = useDeleteHouseholdExpense(householdId);

  const onDelete = (e: React.MouseEvent, householdExpenseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this expense? This cannot be undone.")) return;
    deleteMutation.mutate(householdExpenseId);
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-paper py-20 px-12 text-center border-ink">
        <div className="w-24 h-24 bg-red-soft flex items-center justify-center" style={{ margin: "0 auto 12px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={1.75}>
            <path d="M17 9V7a5 5 0 0 0-10 0v2M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-md font-semibold font-serif text-ink mb-2">
          No expenses yet
        </p>
        <p className="text-base text-ink-3 mb-8">
          Add your first expense to start tracking.
        </p>
        <Link
          href={`/household/${householdId}/expenses/new`}
          className="inline-flex items-center py-[7px] px-[16px] bg-red text-white text-base font-semibold no-underline" style={{ transition: "background 110ms" }}
        >
          Add first expense
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {expenses.map((expense) => {
        const dueDate = new Date(expense.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntilDue < 0;
        const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;

        return (
          <div key={expense.expenseId}  className="expenses-list-item relative">
            <div className="flex items-center gap-5 bg-paper overflow-hidden border-ink">
              {/* Status colour dot */}
              <div className="w-2 self-stretch shrink-0" style={{ background: isOverdue ? "var(--danger)" : isDueSoon ? "var(--warning)" : "var(--red)" }} />

              <Link
              href={`/household/${householdId}/expenses/${expense.expenseId}`}
              className={cn(styles.link, "flex items-center justify-between gap-8 p-[14px_12px_14px_8px] flex-1 no-underline")}
            >
              {/* Left: icon + info */}
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="w-[36px] h-[36px] flex items-center justify-center shrink-0" style={{ background: isOverdue ? "var(--danger-s)" : isDueSoon ? "var(--warning-s)" : "rgba(178,42,26,0.08)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={isOverdue ? "var(--danger)" : isDueSoon ? "var(--warning)" : "var(--red)"}
                    strokeWidth={1.75}>
                    <path d="M17 9V7a5 5 0 0 0-10 0v2M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-md font-semibold text-ink">{expense.title}</span>
                    {expense.recurrenceFrequency && (
                      <span className="py-[1px] px-[7px] bg-red-soft text-red text-sm font-medium">{expense.recurrenceFrequency}</span>
                    )}
                    {expense.category && (
                      <span className="py-[1px] px-[7px] bg-paper-3 text-ink-2 text-sm font-mono border-ink">{String(expense.category)}</span>
                    )}
                  </div>
                  <p className="text-base text-ink-3 mt-1">
                    Due {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    {isOverdue && (
                      <span className="text-red font-medium"> · Overdue</span>
                    )}
                    {isDueSoon && !isOverdue && (
                      <span className="text-red font-medium"> · Due soon</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: amount + delete */}
              <div className="flex items-center gap-6 shrink-0">
                <span className="font-serif font-bold text-md" style={{ color: isOverdue ? "var(--danger)" : "var(--text)" }}>
                  {expense.currency} {Number(expense.amount).toFixed(2)}
                </span>
                {canDelete && (
                  <button
                    onClick={(e) => onDelete(e, expense.expenseId)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === expense.expenseId}
                    className="py-2 px-5 bg-red-soft text-red text-sm font-medium cursor-pointer" style={{ border: "1px solid oklch(62% 0.21 22 / 0.25)", opacity: deleteMutation.isPending && deleteMutation.variables === expense.expenseId ? 0.5 : 1, transition: "opacity 110ms" }}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === expense.expenseId ? "…" : "Delete"}
                  </button>
                )}
              </div>
            </Link>
            {/* Mark paid — outside Link so click doesn't navigate */}
            <div className="pr-6 shrink-0" onClick={(e) => e.stopPropagation()}>
              <MarkPaidButton
                householdId={householdId}
                householdExpenseId={expense.expenseId}
                isPaid={expense.callerIsPaid}
                occurrenceDate={expense.currentOccurrenceDate}
              />
            </div>
          </div>
          </div>
        );
      })}
    </div>
  );
}
