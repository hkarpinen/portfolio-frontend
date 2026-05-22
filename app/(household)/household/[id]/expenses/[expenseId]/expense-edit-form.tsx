"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/lib/api-client";
import { Alert, Input, Textarea, SelectField, Btn } from "@/components/editorial";
import { useUpdateHouseholdExpense } from "@/hooks/use-expenses";
import type { HouseholdExpenseDetailResponse } from "@/types/finance";

const editBillSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().min(1).refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
  currency: z.string().min(1),
  category: z.string().min(1),
  dueDate: z.string().min(1),
  recurrenceFrequency: z.string().optional(),
  description: z.string().optional(),
});

type EditBillData = z.infer<typeof editBillSchema>;

const CATEGORIES = ["Rent","Utilities","Groceries","Transportation","Entertainment","Healthcare","Insurance","Subscriptions","Internet","Phone","Other"];
const FREQUENCIES = ["Daily","Weekly","Biweekly","Monthly","Quarterly","Yearly"];

interface ExpenseEditFormProps {
  expense: HouseholdExpenseDetailResponse["expense"];
  householdId: string;
  expenseId: string;
  onClose: () => void;
}

export function ExpenseEditForm({ expense, householdId, expenseId, onClose }: ExpenseEditFormProps) {
  const updateExpenseMutation = useUpdateHouseholdExpense(householdId, expenseId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditBillData>({
    resolver: zodResolver(editBillSchema),
    values: {
      title: expense.title,
      amount: String(expense.amount),
      currency: expense.currency,
      category: String(expense.category),
      dueDate: expense.dueDate ? new Date(expense.dueDate).toISOString().slice(0, 10) : "",
      recurrenceFrequency: expense.recurrenceFrequency ?? "",
      description: expense.description ?? "",
    },
  });

  const onSubmit = (data: EditBillData) => {
    updateExpenseMutation.mutate(
      {
        title: data.title,
        amount: Number(data.amount),
        currency: data.currency,
        category: data.category,
        dueDate: data.dueDate,
        recurrenceFrequency: data.recurrenceFrequency || undefined,
        description: data.description || undefined,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="bg-paper p-12 border-ink">
      <h2 className="font-serif font-bold text-md text-ink mb-8">Edit Expense</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {updateExpenseMutation.isError && (
          <Alert variant="danger">
            {updateExpenseMutation.error instanceof ApiError ? updateExpenseMutation.error.message : "Something went wrong."}
          </Alert>
        )}
        <div className="form-grid-2">
          <div style={{ gridColumn: "1 / -1" }}>
            <Input label="Title" {...register("title")} error={errors.title?.message} />
          </div>
          <Input label="Amount" type="number" step="0.01" {...register("amount")} error={errors.amount?.message} />
          <Input label="Currency" {...register("currency")} placeholder="USD" />
          <SelectField label="Category" {...register("category")}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>
          <Input label="Due Date" type="date" {...register("dueDate")} />
          <SelectField label="Recurrence" {...register("recurrenceFrequency")}>
            <option value="">None</option>
            {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </SelectField>
          <div style={{ gridColumn: "1 / -1" }}>
            <Textarea label="Description" {...register("description")} rows={2} />
          </div>
        </div>
        <Btn
          type="submit"
          disabled={updateExpenseMutation.isPending}
          variant="primary"
          className="self-end"
        >
          {updateExpenseMutation.isPending ? "Saving…" : "Save Changes"}
        </Btn>
      </form>
    </div>
  );
}
