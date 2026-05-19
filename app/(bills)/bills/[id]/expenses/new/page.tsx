"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useCreateHouseholdExpense } from "@/hooks/use-expenses";
import { ApiError } from "@/lib/api-client";
import { Btn, Alert, Input, Textarea, SelectField } from "@/components/editorial";

const CATEGORIES = [
  "Rent", "Utilities", "Groceries", "Transportation", "Entertainment",
  "Healthcare", "Insurance", "Subscriptions", "Internet", "Phone", "Other",
] as const;

const FREQUENCIES = ["Monthly", "Weekly", "BiWeekly", "Annually"] as const;

const schema = z.object({
  title: z.string().min(1, "Name is required").max(100),
  amount: z.string().min(1, "Amount is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be positive"),
  currency: z.string(),
  category: z.enum(CATEGORIES),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().max(500).optional(),
  isRecurring: z.boolean(),
  recurrenceFrequency: z.enum(FREQUENCIES).optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const createExpense = useCreateHouseholdExpense(params.id);
  const {
    register, handleSubmit, watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD", isRecurring: false },
  });

  const isRecurring = watch("isRecurring");

  const onSubmit = (data: FormData) => {
    createExpense.mutate(
      {
        title: data.title,
        amount: Number(data.amount),
        currency: data.currency,
        category: data.category,
        dueDate: new Date(data.dueDate).toISOString(),
        description: data.description,
        recurrenceFrequency: data.isRecurring ? data.recurrenceFrequency : undefined,
      },
      {
        onSuccess: () => router.push(`/bills/${params.id}`),
      }
    );
  };

  return (
    <div className="page-enter max-w-[560px] mx-auto flex flex-col gap-12" >
      <div>
        <Link href={`/bills/${params.id}`} className="text-ink-3 text-base no-underline">
          ← Back to Household
        </Link>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink mt-3">
          Add Expense
        </h1>
        <p className="text-ink-3 text-base mt-2">
          Add a new expense to this household
        </p>
      </div>

      <div className="bg-paper p-12 shadow-stamp border-ink">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {createExpense.isError && (
            <Alert variant="danger">
              {createExpense.error instanceof ApiError ? createExpense.error.message : "Something went wrong. Please try again."}
            </Alert>
          )}

          <Input
            label="Name"
            type="text"
            {...register("title")}
            placeholder="Rent, Electricity, etc."
            error={errors.title?.message}
          />

          <div className="form-grid-2">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              {...register("amount")}
              placeholder="0.00"
              error={errors.amount?.message}
            />
            <SelectField label="Currency" {...register("currency")}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </SelectField>
          </div>

          <SelectField label="Category" {...register("category")} error={errors.category?.message}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
          </SelectField>

          <Input
            label="Due Date"
            type="date"
            {...register("dueDate")}
            error={errors.dueDate?.message}
          />

          <Textarea
            label="Description (optional)"
            {...register("description")}
            rows={2}
            placeholder="Any additional notes"
          />

          <label className="flex items-center gap-5 cursor-pointer">
            <input id="isRecurring" type="checkbox" {...register("isRecurring")} className="w-8 h-8" style={{ accentColor: "var(--red)" }} />
            <span className="text-base font-medium text-ink-2">Recurring expense</span>
          </label>

          {isRecurring && (
            <SelectField label="Frequency" {...register("recurrenceFrequency")}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>)}
            </SelectField>
          )}

          <Btn
            type="submit"
            disabled={createExpense.isPending}
            variant="primary"
            fullWidth
          >
            {createExpense.isPending ? "Adding..." : "Add Expense"}
          </Btn>
        </form>
      </div>
    </div>
  );
}
