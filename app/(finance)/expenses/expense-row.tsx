"use client";

import {
  Alert,
  Btn,
  DeleteIconButton,
  Icon,
  Input,
  SelectField,
  Textarea,
} from "@/components/editorial";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateExpense, usePayExpense, useUnpayExpense } from "@/hooks/use-expenses";
import { formatCurrency, formatAmount } from "@/lib/formatting";
import { ordinalSuffix, toDateInputValue } from "@/lib/utils";
import { EXPENSE_FREQUENCY_OPTIONS, expenseSchema } from "./_expense-form-shared";
import type { ExpenseFormData } from "./_expense-form-shared";
import { getErrorMessage } from "@/lib/error-messages";

import { EXPENSE_CATEGORY_OPTIONS, ExpenseCategory, type Expense } from "@/types/expense";
import { Frequency } from "@/types/schedule";
import { parseEnum } from "@/lib/parse-enum";

interface ExpenseRowProps {
  expense: Expense;
  isEditing: boolean;
  onEditToggle: () => void;
  onEditDone: () => void;
  onDelete: () => void;
  isDeleting: boolean;
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
      dueDate: expense.dueDate ? toDateInputValue(expense.dueDate) : "",
      // Empty string is the form's "no recurrence" sentinel; only narrow
      // when a real frequency comes back from the wire.
      recurrenceFrequency: parseEnum(Frequency, expense.recurrenceFrequency) ?? ("" as const),
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
            {ordinalSuffix(dayLabel)}
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
          className="border-t border-ink bg-paper-2 px-9 py-8"
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
