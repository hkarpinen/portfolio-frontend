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
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUpdateExpense,
  usePayExpense,
  useUnpayExpense,
  useDeleteExpense,
} from "@/hooks/use-expenses";
import { formatCurrency, formatAmount } from "@/lib/formatting";
import { ordinalSuffix, pluralize, sumBy, toDateInputValue } from "@/lib/utils";
import { categoryIcon } from "@/lib/expense-category";
import { EXPENSE_FREQUENCY_OPTIONS, expenseSchema } from "./_expense-form-shared";
import type { ExpenseFormData } from "./_expense-form-shared";
import { getErrorMessage } from "@/lib/error-messages";

import { EXPENSE_CATEGORY_OPTIONS, ExpenseCategory, type Expense } from "@/types/expense";
import { Frequency } from "@/types/schedule";
import { parseEnum } from "@/lib/parse-enum";

/**
 * <ExpenseTable> — personal bills as an ed-agate table, so Personal recurring and One-time read
 * the same way as Shared household splits (one ledger of bills, not cards-then-table). Each row
 * expands in place to the inline edit form; pay/unpay and delete are row actions. The parent does
 * the recurring/one-time filtering, so this stays a pure renderer plus an `empty` slot.
 */
export function ExpenseTable({ expenses, empty }: { expenses: Expense[]; empty: ReactNode }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (expenses.length === 0) return <>{empty}</>;

  const total = sumBy(expenses, (e) => e.amount);
  const currency = expenses[0]?.currency ?? "USD";

  return (
    <div className="overflow-x-auto" role="region" aria-label="Personal bills">
      <table className="ed-agate">
        <caption className="sr-only">
          {expenses.length} {pluralize("bill", expenses.length)}, total{" "}
          {formatCurrency(total, currency)}
        </caption>
        <thead>
          <tr>
            <th scope="col">Bill</th>
            <th scope="col" className="hidden sm:table-cell">
              Cadence
            </th>
            <th scope="col" className="hidden sm:table-cell">
              Category
            </th>
            <th scope="col" className="num">
              Amount
            </th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <ExpenseTableRow
              key={expense.chargeId}
              expense={expense}
              isEditing={editingId === expense.chargeId}
              onEditToggle={() =>
                setEditingId(editingId === expense.chargeId ? null : expense.chargeId)
              }
              onEditDone={() => setEditingId(null)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpenseTableRow({
  expense,
  isEditing,
  onEditToggle,
  onEditDone,
}: {
  expense: Expense;
  isEditing: boolean;
  onEditToggle: () => void;
  onEditDone: () => void;
}) {
  const due = new Date(expense.dueDate);
  const isOverdue = due < new Date() && !expense.isPaid;
  const updateBill = useUpdateExpense();
  const payExpense = usePayExpense();
  const unpayExpense = useUnpayExpense();
  const deleteExpense = useDeleteExpense();
  const isPayPending = payExpense.isPending || unpayExpense.isPending;

  const handleTogglePaid = () => {
    const occurrenceDate = expense.currentOccurrenceDate ?? expense.dueDate;
    if (expense.isPaid) {
      unpayExpense.mutate({ id: expense.chargeId, occurrenceDate });
    } else {
      payExpense.mutate({ id: expense.chargeId, occurrenceDate });
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
      category: parseEnum(ExpenseCategory, expense.category, ExpenseCategory.Other),
      dueDate: expense.dueDate ? toDateInputValue(expense.dueDate) : "",
      recurrenceFrequency: parseEnum(Frequency, expense.recurrenceFrequency) ?? ("" as const),
      description: expense.description ?? "",
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    updateBill.mutate(
      {
        id: expense.chargeId,
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
    <>
      <tr>
        <td>
          <span className="font-serif text-base font-bold text-ink">{expense.title}</span>
          {isOverdue && (
            <span
              className="ed-label-muted ml-2 inline-flex items-center gap-1 text-red"
              role="status"
            >
              <Icon name="alert" size={12} strokeWidth={2} /> Overdue
            </span>
          )}
          {expense.isPaid && !isOverdue && (
            <span
              className="ed-label-muted ml-2 inline-flex items-center gap-1"
              style={{ color: "var(--green)" }}
              role="status"
            >
              <Icon name="check" size={12} strokeWidth={2.5} /> Paid
            </span>
          )}
          {/* Mobile: cadence + category collapse into a sub-line so the table
              fits a phone without horizontal scroll. */}
          <p className="ed-hint mt-0.5 sm:hidden">
            {freqLabel} · {dayLabel}
            {ordinalSuffix(dayLabel)}
            {expense.category ? ` · ${expense.category}` : ""}
          </p>
          {expense.description && <p className="ed-hint mt-0.5">{expense.description}</p>}
        </td>
        <td className="muted hidden sm:table-cell">
          {freqLabel} · {dayLabel}
          {ordinalSuffix(dayLabel)}
        </td>
        <td className="muted hidden sm:table-cell">
          {expense.category ? (
            <span className="inline-flex items-center gap-2">
              <Icon name={categoryIcon(expense.category)} size={14} strokeWidth={1.75} />
              {expense.category}
            </span>
          ) : (
            "—"
          )}
        </td>
        <td className="num">
          <span
            className={isOverdue ? "text-red" : expense.isPaid ? "text-ink-3" : undefined}
            aria-label={amountLabel}
          >
            <span className="ed-agate-currency">{expense.currency ?? "USD"}</span>
            {formatAmount(expense.amount)}
          </span>
        </td>
        <td className="num">
          <span className="inline-flex items-center justify-end gap-2">
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
              onClick={() => deleteExpense.mutate(expense.chargeId)}
              disabled={deleteExpense.isPending}
              label={`Remove ${expense.title}`}
            />
          </span>
        </td>
      </tr>

      {isEditing && (
        <tr>
          <td colSpan={5} className="bg-paper-2 px-9 py-8">
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
          </td>
        </tr>
      )}
    </>
  );
}
