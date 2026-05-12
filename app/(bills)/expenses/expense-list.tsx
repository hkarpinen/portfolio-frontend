"use client";

import { useState } from "react";
import { useDeleteExpense, useExpenses, useUpdateExpense, usePayExpense, useUnpayExpense } from "@/hooks/use-expenses";
import { BILL_CATEGORIES, FREQUENCIES, expenseSchema, type ExpenseFormData } from "./_expense-form-shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import type { ExpensePage } from "@/types/finance";
import type { Expense } from "@/types/finance";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: "var(--accent)",
  Rent: "var(--accent)",
  Utilities: "var(--accent-v)",
  Phone: "var(--success)",
  Internet: "var(--accent-v)",
  Healthcare: "var(--success)",
  Subscriptions: "var(--warning)",
  Entertainment: "var(--warning)",
  Groceries: "var(--success)",
  Transportation: "var(--accent)",
  Insurance: "var(--danger)",
  Other: "var(--text-3)",
};

export const CATEGORY_ICONS: Record<string, string> = {
  Rent: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  Utilities: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  Groceries: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  Transportation: "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5a2 2 0 0 1-2 2h-3m-9 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0m9 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
  Entertainment: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  Healthcare: "M22 12h-4l-3 9L9 3l-3 9H2",
  Insurance: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  Subscriptions: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8",
  Internet: "M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
  Phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  Other: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4m0 4h.01",
};

export function ExpenseList({ initialData }: { initialData: ExpensePage }) {
  const { data } = useExpenses(initialData);
  const expenses: Expense[] = data?.items ?? [];
  const deleteExpense = useDeleteExpense();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        marginBottom: "24px",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 9V7a5 5 0 0 0-10 0v2M5 9h14l1 12H4L5 9zm5 4v4m4-4v4" />
          </svg>
        </div>
        <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--text)" }}>
          No personal expenses yet
        </p>
        <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Add your recurring expenses below.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.expenseId}
          expense={expense}
          isEditing={editingId === expense.expenseId}
          onEditToggle={() => setEditingId(editingId === expense.expenseId ? null : expense.expenseId)}
          onEditDone={() => setEditingId(null)}
          onDelete={() => deleteExpense.mutate(expense.expenseId)}
          isDeleting={deleteExpense.isPending}
        />
      ))}
    </div>
  );
}

function ExpenseRow({
  expense,
  isEditing,
  onEditToggle,
  onEditDone,
  onDelete,
  isDeleting,
}: {
  expense: Expense;
  isEditing: boolean;
  onEditToggle: () => void;
  onEditDone: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const iconPath = CATEGORY_ICONS[expense.category ?? "Other"] ?? CATEGORY_ICONS.Other;
  const catColor = CATEGORY_COLORS[expense.category ?? "Other"] ?? "var(--text-3)";
  const due = new Date(expense.dueDate);
  const isOverdue = due < new Date() && !expense.isPaid;
  const updateBill = useUpdateExpense();
  const payExpense = usePayExpense();
  const unpayExpense = useUnpayExpense();
  const isPayPending = payExpense.isPending || unpayExpense.isPending;

  const handleTogglePaid = () => {
    const occurrenceDate = expense.currentOccurrenceDate ?? expense.dueDate;
    if (expense.isPaid) {
      unpayExpense.mutate({ id: expense.expenseId, occurrenceDate });
    } else {
      payExpense.mutate({ id: expense.expenseId, occurrenceDate });
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    values: {
      title: expense.title,
      amount: String(expense.amount),
      currency: expense.currency,
      category: expense.category as ExpenseFormData["category"],
      dueDate: expense.dueDate ? new Date(expense.dueDate).toISOString().slice(0, 10) : "",
      recurrenceFrequency: (expense.recurrenceFrequency ?? "") as ExpenseFormData["recurrenceFrequency"],
      description: expense.description ?? "",
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    updateBill.mutate(
      {
        id: expense.expenseId,
        body: {
          title: data.title,
          amount: Number(data.amount),
          currency: data.currency,
          category: data.category,
          dueDate: data.dueDate,
          recurrenceFrequency: data.recurrenceFrequency || undefined,
          description: data.description || undefined,
        },
      },
      { onSuccess: onEditDone }
    );
  };

  const iStyle: React.CSSProperties = {
    height: "34px", background: "var(--surface-3)",
    border: "1px solid var(--border)", borderRadius: "10px",
    padding: "0 10px", fontSize: "12px", color: "var(--text)", outline: "none",
  };

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "14px", overflow: "hidden", boxShadow: "var(--shadow-sm)",
    }}>
      {/* Row */}
      <div style={{
        padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px",
      }}>
        {/* Category icon */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "var(--r-md)",
          background: `color-mix(in oklch, ${catColor} 12%, transparent)`,
          border: `1px solid color-mix(in oklch, ${catColor} 22%, transparent)`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={catColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={iconPath} />
          </svg>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>{expense.title}</span>
            <span style={{
              fontSize: "10px", fontWeight: 600, padding: "1px 6px",
              borderRadius: "var(--r-full)",
              background: "var(--surface-3)", color: "var(--text-3)",
              border: "1px solid var(--border)",
            }}>{expense.category}</span>
            {isOverdue && (
              <span style={{
                fontSize: "10px", fontWeight: 600, padding: "1px 6px",
                borderRadius: "var(--r-full)",
                background: "var(--danger-s)", color: "var(--danger)",
                border: "1px solid color-mix(in oklch, var(--danger) 25%, transparent)",
                display: "flex", alignItems: "center", gap: "4px",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
                Overdue
              </span>
            )}
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "3px" }}>
            Due {due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            {expense.recurrenceFrequency ? ` · ${expense.recurrenceFrequency.toLowerCase()}` : " · one-time"}
          </p>
        </div>

        {/* Amount + status + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "16px", color: isOverdue ? "var(--danger)" : "var(--text)" }}>
              {expense.currency} {expense.amount.toFixed(2)}
            </div>
            <button
              onClick={handleTogglePaid}
              disabled={isPayPending}
              title={expense.isPaid ? "Click to mark unpaid" : "Click to mark paid"}
              style={{
                fontSize: "10px", fontWeight: 600, padding: "1px 8px",
                borderRadius: "var(--r-full)", cursor: isPayPending ? "not-allowed" : "pointer",
                border: `1px solid color-mix(in oklch, ${expense.isPaid ? "var(--success)" : isOverdue ? "var(--danger)" : "var(--warning)"} 25%, transparent)`,
                background: expense.isPaid
                  ? "color-mix(in oklch, var(--success) 12%, transparent)"
                  : isOverdue
                    ? "var(--danger-s)"
                    : "color-mix(in oklch, var(--warning) 12%, transparent)",
                color: expense.isPaid ? "var(--success)" : isOverdue ? "var(--danger)" : "var(--warning)",
                transition: "background 110ms",
                opacity: isPayPending ? 0.6 : 1,
              }}
            >
              {isPayPending ? "…" : expense.isPaid ? "✓ Paid" : isOverdue ? "Overdue" : "Unpaid"}
            </button>
          </div>
          <button
            onClick={onEditToggle}
            style={{
              width: "30px", height: "30px", borderRadius: "8px",
              border: "1px solid var(--border)",
              background: isEditing ? "var(--accent-subtle)" : "transparent",
              color: isEditing ? "var(--accent)" : "var(--text-3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background 110ms, color 110ms",
            }}
            aria-label="Edit"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <DeleteIconButton
            onClick={onDelete}
            disabled={isDeleting}
            label={`Remove ${expense.title}`}
          />
        </div>
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <div style={{
          borderTop: "1px solid var(--border)", padding: "16px 18px",
          background: "var(--surface-2)",
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {updateBill.isError && (
              <div style={{ padding: "8px 12px", borderRadius: "8px", background: "var(--danger-s)", color: "var(--danger)", fontSize: "12px", border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
                {updateBill.error instanceof ApiError ? updateBill.error.message : "Something went wrong."}
              </div>
            )}
            <div className="form-grid-2" style={{ gap: "8px" }}>
              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-2)" }}>Title</label>
                <input {...register("title")} style={{ ...iStyle, border: errors.title ? "1px solid var(--danger)" : "1px solid var(--border)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-2)" }}>Amount</label>
                <input type="number" step="0.01" {...register("amount")} style={{ ...iStyle, border: errors.amount ? "1px solid var(--danger)" : "1px solid var(--border)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-2)" }}>Currency</label>
                <input {...register("currency")} style={iStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-2)" }}>Category</label>
                <select {...register("category")} style={iStyle}>
                  {BILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-2)" }}>Due Date</label>
                <input type="date" {...register("dueDate")} style={iStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-2)" }}>Recurrence</label>
                <select {...register("recurrenceFrequency")} style={iStyle}>
                  <option value="">None</option>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-2)" }}>Description</label>
                <textarea {...register("description")} rows={2} style={{ ...iStyle, height: "auto", padding: "8px 10px", resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button type="button" onClick={onEditToggle} style={{ padding: "6px 14px", borderRadius: "8px", background: "var(--surface-3)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: "500", color: "var(--text-2)", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={updateBill.isPending} style={{ padding: "6px 16px", borderRadius: "8px", background: updateBill.isPending ? "var(--surface-3)" : "var(--accent)", border: "none", fontSize: "12px", fontWeight: "600", color: updateBill.isPending ? "var(--text-3)" : "#fff", cursor: updateBill.isPending ? "not-allowed" : "pointer" }}>
                {updateBill.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
