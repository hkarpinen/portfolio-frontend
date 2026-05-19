"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateExpense } from "@/hooks/use-expenses";
import { ApiError } from "@/lib/api-client";
import {
  BILL_CATEGORIES,
  FREQUENCIES,
  expenseSchema,
  ExpenseFormData,
} from "./_expense-form-shared";
import { Alert, Btn, Input, SelectField, Textarea } from "@/components/editorial";

export function AddExpenseForm() {
  const router = useRouter();
  const create = useCreateExpense();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      currency: "USD",
      category: "Other",
      dueDate: new Date().toISOString().slice(0, 10),
      recurrenceFrequency: "",
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    create.mutate(
      {
        title: data.title,
        amount: Number(data.amount),
        currency: data.currency,
        category: data.category,
        dueDate: new Date(data.dueDate).toISOString(),
        recurrenceFrequency: data.recurrenceFrequency || undefined,
        recurrenceStartDate: data.recurrenceFrequency ? new Date(data.dueDate).toISOString() : undefined,
        description: data.description || undefined,
      },
      { onSuccess: () => { reset(); router.push("/expenses"); } }
    );
  };

  return (
    <div className="bg-paper p-10 shadow-stamp border-ink">
      <h2 className="font-serif font-bold text-md text-ink mb-8">
        Add Personal Expense
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[14px]">
        {create.isError && (
          <Alert variant="danger">
            {create.error instanceof ApiError ? create.error.message : "Something went wrong. Please try again."}
          </Alert>
        )}
        {create.isSuccess && (
          <Alert variant="success">Expense added!</Alert>
        )}

        <Input
          type="text"
          label="Title"
          placeholder="Netflix, Rent, Gym, etc."
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="form-grid-2">
          <Input
            type="number"
            step="0.01"
            label="Amount"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <SelectField label="Currency" {...register("currency")}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </SelectField>
        </div>

        <div className="form-grid-2">
          <SelectField label="Category" {...register("category")}>
            {BILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </SelectField>
          <Input
            type="date"
            label="Due Date"
            error={errors.dueDate?.message}
            {...register("dueDate")}
          />
        </div>

        <SelectField label="Recurrence (optional)" {...register("recurrenceFrequency")}>
          <option value="">One-time</option>
          {FREQUENCIES.map((f) => (
            <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>
          ))}
        </SelectField>

        <Textarea
          label="Description (optional)"
          placeholder="Optional notes..."
          rows={2}
          error={errors.description?.message}
          {...register("description")}
        />

        <Btn type="submit" disabled={create.isPending} variant="primary" fullWidth>
          {create.isPending ? "Adding…" : "Add Expense"}
        </Btn>
      </form>
    </div>
  );
}
