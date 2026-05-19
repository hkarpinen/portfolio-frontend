"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateExpense, usePayExpense, useUnpayExpense } from "@/hooks/use-expenses";
import { BILL_CATEGORIES, FREQUENCIES, expenseSchema, type ExpenseFormData } from "./_expense-form-shared";
import { ApiError } from "@/lib/api-client";
import { Alert, Btn, Input, SelectField, Textarea, Icon } from "@/components/editorial";
import { DeleteIconButton } from "@/components/editorial/delete-icon-button";
import type { Expense } from "@/types/finance";

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: "var(--red)",
  Rent: "var(--red)",
  Utilities: "var(--accent-v)",
  Phone: "var(--success)",
  Internet: "var(--accent-v)",
  Healthcare: "var(--success)",
  Subscriptions: "var(--warning)",
  Entertainment: "var(--warning)",
  Groceries: "var(--success)",
  Transportation: "var(--red)",
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


interface ExpenseRowProps {
  expense: Expense;
  isEditing: boolean;
  onEditToggle: () => void;
  onEditDone: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ExpenseRow({ expense, isEditing, onEditToggle, onEditDone, onDelete, isDeleting }: ExpenseRowProps) {
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

  return (
    <div className="bg-paper overflow-hidden shadow-stamp border-ink">
      <div className="py-[14px] px-[18px] flex items-center gap-[14px]">
        {/* Category icon */}
        <div
          className="w-20 h-20 flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in oklch, ${catColor} 12%, transparent)`, border: `1px solid color-mix(in oklch, ${catColor} 22%, transparent)` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={catColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={iconPath} />
          </svg>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-serif font-semibold text-md text-ink">{expense.title}</span>
            <span className="text-sm font-semibold py-[1px] px-[6px] bg-paper-3 text-ink-3 border-ink">{expense.category}</span>
            {isOverdue && (
              <span className="text-sm font-semibold py-[1px] px-[6px] bg-red-soft text-red flex items-center gap-2" style={{ border: "1px solid color-mix(in oklch, var(--danger) 25%, transparent)" }}>
                <span className="w-[5] h-[5] rounded-full bg-red inline-block" />
                Overdue
              </span>
            )}
          </div>
          <p className="text-sm text-ink-3 mt-[3px]">
            Due {due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            {expense.recurrenceFrequency ? ` · ${expense.recurrenceFrequency.toLowerCase()}` : " · one-time"}
          </p>
        </div>

        {/* Amount + status + actions */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <div className="font-serif font-bold text-md" style={{ color: isOverdue ? "var(--danger)" : "var(--text)" }}>
              <span className="text-sm font-mono text-ink-3 mr-[5px]">{expense.currency}</span>{expense.amount.toFixed(2)}
            </div>
            <button
              onClick={handleTogglePaid}
              disabled={isPayPending}
              title={expense.isPaid ? "Click to mark unpaid" : "Click to mark paid"}
              className="text-sm font-semibold py-[1px] px-[8px] inline-flex items-center gap-[5px]"
              style={{
                cursor: isPayPending ? "not-allowed" : "pointer",
                border: `1px solid color-mix(in oklch, ${expense.isPaid ? "var(--success)" : isOverdue ? "var(--danger)" : "var(--warning)"} 25%, transparent)`,
                background: expense.isPaid
                  ? "color-mix(in oklch, var(--success) 12%, transparent)"
                  : isOverdue ? "var(--danger-s)" : "color-mix(in oklch, var(--warning) 12%, transparent)",
                color: expense.isPaid ? "var(--success)" : isOverdue ? "var(--danger)" : "var(--warning)",
                transition: "background 110ms",
                opacity: isPayPending ? 0.6 : 1,
              }}
            >
              {isPayPending ? "…" : expense.isPaid ? <><Icon name="check" size={11} strokeWidth={2} /> Paid</> : isOverdue ? "Overdue" : "Unpaid"}
            </button>
          </div>
          <button
            onClick={onEditToggle}
            className="w-[30px] h-[30px] flex items-center justify-center cursor-pointer border-ink"
            style={{background: isEditing ? "rgba(178,42,26,0.08)" : "transparent", color: isEditing ? "var(--red)" : "var(--text-3)", transition: "background 110ms, color 110ms" }}
            aria-label="Edit"
          >
            <Icon name="edit" size={13} strokeWidth={2} />
          </button>
          <DeleteIconButton onClick={onDelete} disabled={isDeleting} label={`Remove ${expense.title}`} />
        </div>
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <div className="py-[16px] px-[18px] bg-paper-2" style={{ borderTop: "1.5px solid var(--ink)" }}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {updateBill.isError && (
              <Alert variant="danger">
                {updateBill.error instanceof ApiError ? updateBill.error.message : "Something went wrong."}
              </Alert>
            )}
            <div className="form-grid-2 gap-4">
              <div style={{ gridColumn: "1 / -1" }}>
                <Input label="Title" error={errors.title?.message} {...register("title")} />
              </div>
              <Input type="number" step="0.01" label="Amount" error={errors.amount?.message} {...register("amount")} />
              <Input label="Currency" {...register("currency")} />
              <SelectField label="Category" {...register("category")}>
                {BILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </SelectField>
              <Input type="date" label="Due Date" {...register("dueDate")} />
              <SelectField label="Recurrence" {...register("recurrenceFrequency")}>
                <option value="">None</option>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </SelectField>
              <div style={{ gridColumn: "1 / -1" }}>
                <Textarea label="Description" rows={2} {...register("description")} />
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <Btn type="button" variant="secondary" size="xs" onClick={onEditToggle}>Cancel</Btn>
              <Btn type="submit" variant="primary" size="xs" disabled={updateBill.isPending}>
                {updateBill.isPending ? "Saving…" : "Save"}
              </Btn>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
