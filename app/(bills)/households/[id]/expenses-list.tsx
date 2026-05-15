"use client";

import Link from "next/link";
import { useHouseholdExpenses, useDeleteHouseholdExpense } from "@/hooks/use-expenses";
import { MarkPaidButton } from "./mark-paid-button";
import styles from "./expenses-list.module.css";
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
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "40px 24px", textAlign: "center",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "var(--accent-subtle)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.75}>
            <path d="M17 9V7a5 5 0 0 0-10 0v2M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p style={{ fontSize: "var(--ts-body)", fontWeight: "600", fontFamily: "var(--ff-display)", color: "var(--text)", marginBottom: "4px" }}>
          No expenses yet
        </p>
        <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", marginBottom: "16px" }}>
          Add your first expense to start tracking.
        </p>
        <Link
          href={`/households/${householdId}/expenses/new`}
          style={{
            display: "inline-flex", alignItems: "center",
            padding: "7px 16px", borderRadius: "10px",
            background: "var(--accent)", color: "#fff",
            fontSize: "var(--ts-body-sm)", fontWeight: "600", textDecoration: "none",
            transition: "background 110ms",
          }}
        >
          Add first expense
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {expenses.map((expense) => {
        const dueDate = new Date(expense.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntilDue < 0;
        const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;

        return (
          <div key={expense.expenseId} style={{ position: "relative" }} className="expenses-list-item">
            <div style={{ display: "flex", alignItems: "center", gap: "10px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "12px", overflow: "hidden",
            }}>
              {/* Status colour dot */}
              <div style={{
                width: "4px", alignSelf: "stretch", flexShrink: 0,
                background: isOverdue ? "var(--danger)" : isDueSoon ? "var(--warning)" : "var(--accent)",
              }} />

              <Link
              href={`/households/${householdId}/expenses/${expense.expenseId}`}
              className={styles.link}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "16px", padding: "14px 12px 14px 8px",
                flex: 1, textDecoration: "none",
              }}
            >
              {/* Left: icon + info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: isOverdue ? "var(--danger-s)" : isDueSoon ? "var(--warning-s)" : "var(--accent-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={isOverdue ? "var(--danger)" : isDueSoon ? "var(--warning)" : "var(--accent)"}
                    strokeWidth={1.75}>
                    <path d="M17 9V7a5 5 0 0 0-10 0v2M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "var(--ts-body)", fontWeight: "600", color: "var(--text)" }}>{expense.title}</span>
                    {expense.recurrenceFrequency && (
                      <span style={{
                        padding: "1px 7px", borderRadius: "9999px",
                        background: "var(--accent-subtle)", color: "var(--accent)",
                        fontSize: "var(--ts-meta)", fontWeight: "500",
                      }}>{expense.recurrenceFrequency}</span>
                    )}
                    {expense.category && (
                      <span style={{
                        padding: "1px 7px", borderRadius: "9999px",
                        background: "var(--surface-3)", color: "var(--text-2)",
                        border: "1px solid var(--border)",
                        fontSize: "var(--ts-meta)", fontWeight: "500",
                      }}>{String(expense.category)}</span>
                    )}
                  </div>
                  <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", marginTop: "2px" }}>
                    Due {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    {isOverdue && (
                      <span style={{ color: "var(--danger)", fontWeight: "500" }}> · Overdue</span>
                    )}
                    {isDueSoon && !isOverdue && (
                      <span style={{ color: "var(--warning)", fontWeight: "500" }}> · Due soon</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: amount + delete */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <span style={{
                  fontFamily: "var(--ff-display)", fontWeight: "700",
                  fontSize: "var(--ts-body)", color: isOverdue ? "var(--danger)" : "var(--text)",
                }}>
                  {expense.currency} {Number(expense.amount).toFixed(2)}
                </span>
                {canDelete && (
                  <button
                    onClick={(e) => onDelete(e, expense.expenseId)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === expense.expenseId}
                    style={{
                      padding: "4px 10px", borderRadius: "8px",
                      background: "var(--danger-s)", color: "var(--danger)",
                      border: "1px solid oklch(62% 0.21 22 / 0.25)",
                      fontSize: "var(--ts-meta)", fontWeight: "500", cursor: "pointer",
                      opacity: deleteMutation.isPending && deleteMutation.variables === expense.expenseId ? 0.5 : 1,
                      transition: "opacity 110ms",
                    }}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === expense.expenseId ? "…" : "Delete"}
                  </button>
                )}
              </div>
            </Link>
            {/* Mark paid — outside Link so click doesn't navigate */}
            <div style={{ paddingRight: "12px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
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
