"use client";

import { Alert, Btn, DeleteIconButton, Icon, Input, SelectField, Textarea } from "@/components/editorial";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateExpense, usePayExpense, useUnpayExpense } from "@/hooks/use-expenses";
import { formatCurrency, formatAmount } from "@/lib/formatting";
import { EXPENSE_FREQUENCY_OPTIONS, expenseSchema } from "./_expense-form-shared";
import type { ExpenseFormData } from "./_expense-form-shared";
import { getErrorMessage } from "@/lib/error-messages";

import { EXPENSE_CATEGORY_OPTIONS, ExpenseCategory, type Expense } from "@/types/expense";
import { Frequency } from "@/types/schedule";
import { parseEnum } from "@/lib/parse-enum";

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
  Transportation:
    "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5a2 2 0 0 1-2 2h-3m-9 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0m9 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
  Entertainment:
    "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  Healthcare: "M22 12h-4l-3 9L9 3l-3 9H2",
  Insurance: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  Subscriptions: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8",
  Internet:
    "M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
  Phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
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

function ordinal(n: number): string {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function ExpenseRow({
  expense,
  isEditing,
  onEditToggle,
  onEditDone,
  onDelete,
  isDeleting,
}: ExpenseRowProps) {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    values: {
      title: expense.title,
      amount: String(expense.amount),
      currency: expense.currency,
      // parseEnum (audit §1.2) narrows the wire string to the schema's
      // enum at runtime; a stale or renamed value falls back to "Other"
      // rather than silently corrupting the form's category union.
      category: parseEnum(ExpenseCategory, expense.category, ExpenseCategory.Other),
      dueDate: expense.dueDate ? new Date(expense.dueDate).toISOString().slice(0, 10) : "",
      // Empty string is the form's "no recurrence" sentinel; only narrow
      // when a real frequency comes back from the wire.
      recurrenceFrequency:
        parseEnum(Frequency, expense.recurrenceFrequency) ?? ("" as const),
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
      { onSuccess: onEditDone },
    );
  };

  const freqLabel = expense.recurrenceFrequency
    ? expense.recurrenceFrequency.toUpperCase()
    : "ONE-TIME";
  const dayLabel = due.getDate();

  const amountLabel = formatCurrency(expense.amount, expense.currency ?? "USD");

  return (
    <div
      className="ed-module-card"
      aria-label={`${expense.title}, ${amountLabel}${expense.isPaid ? ", paid" : isOverdue ? ", overdue" : ""}`}
    >
      {/* Top row: title + amount */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-bold leading-tight text-ink">
            {expense.title}
            {expense.isPaid && <span className="sr-only"> (paid)</span>}
          </p>
          {expense.description && <p className="ed-hint mt-1">{expense.description}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`font-serif text-lg font-bold italic tabular-nums ${isOverdue ? "text-red" : expense.isPaid ? "text-ink-3" : "text-ink"}`}
            aria-label={amountLabel}
          >
            ${formatAmount(expense.amount)}
          </p>
          {isOverdue && (
            <p className="ed-label-muted text-red" role="status">
              ⚠ Overdue
            </p>
          )}
          {expense.isPaid && !isOverdue && (
            <p className="ed-label-muted" style={{ color: "var(--green)" }}>
              ✓ Paid
            </p>
          )}
        </div>
      </div>

      {/* Bottom row: frequency + category + actions */}
      <div className="ed-module-card-foot">
        <div className="flex items-center gap-4">
          <p className="ed-label-muted">
            {freqLabel} · {dayLabel}
            {ordinal(dayLabel)}
          </p>
          {expense.category && (
            <span className="ed-label-muted">{expense.category.toUpperCase()}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePaid}
            disabled={isPayPending}
            title={expense.isPaid ? "Mark as unpaid" : "Mark as paid"}
            className={`ed-icon-btn ${expense.isPaid ? "text-green" : "text-ink-3"}`}
            aria-label={
              expense.isPaid ? `Mark ${expense.title} as unpaid` : `Mark ${expense.title} as paid`
            }
            aria-pressed={expense.isPaid}
          >
            <Icon name="check" size={13} strokeWidth={expense.isPaid ? 2.5 : 1.5} />
          </button>
          <button
            onClick={onEditToggle}
            className={`ed-icon-btn ${isEditing ? "text-red" : "text-ink-3"}`}
            aria-label={`Edit ${expense.title}`}
            aria-expanded={isEditing}
          >
            <Icon name="edit" size={13} strokeWidth={2} />
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
        <div
          className="border-t border-ink bg-paper-2 px-[18px] py-[16px]"
          role="region"
          aria-label={`Edit ${expense.title}`}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {updateBill.isError && (
              <Alert variant="danger" role="alert">
                {getErrorMessage(updateBill.error)}
              </Alert>
            )}
            <div className="form-grid-2 gap-4">
              <div className="col-span-full">
                <Input label="Title" error={errors.title?.message} {...register("title")} />
              </div>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                label="Amount"
                error={errors.amount?.message}
                {...register("amount")}
              />
              <SelectField label="Currency" {...register("currency")}>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CAD">CAD — Canadian Dollar</option>
              </SelectField>
              <SelectField label="Category" {...register("category")}>
                {EXPENSE_CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectField>
              <Input type="date" label="Due date" {...register("dueDate")} />
              <SelectField label="Recurrence" {...register("recurrenceFrequency")}>
                <option value="">One-time</option>
                {EXPENSE_FREQUENCY_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </SelectField>
              <div className="col-span-full">
                <Textarea label="Notes" rows={2} {...register("description")} />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Btn type="button" variant="secondary" size="xs" onClick={onEditToggle}>
                Cancel
              </Btn>
              <Btn type="submit" variant="primary" size="xs" disabled={updateBill.isPending}>
                {updateBill.isPending ? "Saving…" : "Save changes"}
              </Btn>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
