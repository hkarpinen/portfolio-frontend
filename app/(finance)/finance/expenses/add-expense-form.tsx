"use client";

import { Alert, Btn, Input, SelectField, Textarea } from "@/components/editorial";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateExpense } from "@/hooks/use-expenses";
import { getErrorMessage } from "@/lib/error-messages";
import type { ExpenseFormData } from "./_expense-form-shared";
import { EXPENSE_FREQUENCY_OPTIONS, expenseSchema } from "./_expense-form-shared";
import { ExpenseCategory, EXPENSE_CATEGORY_OPTIONS } from "@/types/expense";

export function AddExpenseForm() {
  const router = useRouter();
  const create = useCreateExpense();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      currency: "USD",
      category: ExpenseCategory.Other,
      dueDate: new Date().toISOString().slice(0, 10),
      recurrenceFrequency: "",
    },
  });

  const currency = watch("currency");

  const onSubmit = (data: ExpenseFormData) => {
    create.mutate(
      {
        title: data.title,
        amount: Number(data.amount),
        currency: data.currency,
        category: data.category,
        dueDate: new Date(data.dueDate).toISOString(),
        recurrenceFrequency: data.recurrenceFrequency || undefined,
        recurrenceStartDate: data.recurrenceFrequency
          ? new Date(data.dueDate).toISOString()
          : undefined,
        description: data.description || undefined,
      },
      {
        onSuccess: () => {
          reset();
          router.push("/finance/overview");
        },
      },
    );
  };

  // Map currency to its symbol for aria descriptions
  const currencySymbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CAD: "CA$" };
  const currencySymbol = currencySymbols[currency] ?? currency;

  return (
    <div className="border-ink bg-paper p-10 shadow-stamp">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-7"
        aria-label="Add expense"
        noValidate
      >
        {create.isError && (
          <Alert variant="danger" role="alert">
            {getErrorMessage(create.error)}
          </Alert>
        )}
        {create.isSuccess && (
          <Alert variant="success" role="status">
            Expense saved — redirecting…
          </Alert>
        )}

        <Input
          type="text"
          label="Title"
          placeholder="Netflix, Rent, Gym…"
          error={errors.title?.message}
          autoFocus
          autoComplete="off"
          {...register("title")}
        />

        <div className="form-grid-2">
          <div>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              label={`Amount (${currencySymbol})`}
              placeholder="0.00"
              error={errors.amount?.message}
              aria-describedby="amount-currency-hint"
              {...register("amount")}
            />
            <p id="amount-currency-hint" className="sr-only">
              Enter the amount in {currency}. Use decimals for cents, e.g. 12.99.
            </p>
          </div>
          <SelectField label="Currency" aria-describedby="currency-hint" {...register("currency")}>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="CAD">CAD — Canadian Dollar</option>
          </SelectField>
          <p id="currency-hint" className="sr-only">
            All amounts are stored and displayed in the selected currency.
          </p>
        </div>

        <div className="form-grid-2">
          <SelectField label="Category" {...register("category")}>
            {EXPENSE_CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
          <Input
            type="date"
            label="Due date"
            error={errors.dueDate?.message}
            aria-describedby="due-date-hint"
            {...register("dueDate")}
          />
          <p id="due-date-hint" className="sr-only">
            For recurring expenses this is the day-of-month it recurs. For one-time expenses it is
            the payment date.
          </p>
        </div>

        <SelectField
          label="Recurrence"
          aria-describedby="recurrence-hint"
          {...register("recurrenceFrequency")}
        >
          <option value="">One-time (no recurrence)</option>
          {EXPENSE_FREQUENCY_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </option>
          ))}
        </SelectField>
        <p id="recurrence-hint" className="sr-only">
          Choose a frequency to make this a recurring expense. Leave as one-time if it only happens
          once.
        </p>

        <Textarea
          label="Notes"
          aria-label="Notes (optional)"
          placeholder="Optional — provider, account number, reminders…"
          rows={2}
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="mt-2 flex gap-4">
          <Btn
            type="button"
            variant="secondary"
            onClick={() => router.push("/finance/overview")}
            className="flex-1"
          >
            Cancel
          </Btn>
          <Btn type="submit" disabled={create.isPending} variant="primary" className="flex-1">
            {create.isPending ? "Saving…" : "Add Expense"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
