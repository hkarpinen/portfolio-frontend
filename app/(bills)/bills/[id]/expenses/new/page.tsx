"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useCreateHouseholdExpense } from "@/hooks/use-expenses";
import { ApiError } from "@/lib/api-client";
import { Btn } from "@/components/editorial";

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

const inputStyle: React.CSSProperties = {
  height: "38px", padding: "0 12px",
  background: "var(--paper-2)", border: "1.5px solid var(--ink)",
  color: "var(--text)", fontSize: "var(--ts-body)",
  outline: "none", width: "100%", fontFamily: "var(--ff-body)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--ts-label)", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em",
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--ink)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--ink-3)";
  e.currentTarget.style.boxShadow = "none";
}

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

      <div className="bg-paper p-12 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {createExpense.isError && (
            <div className="bg-[rgba(178,42,26,0.10)] py-[10px] px-[14px] text-base text-red" style={{ border: "1px solid var(--danger)" }}>
              {createExpense.error instanceof ApiError ? createExpense.error.message : "Something went wrong. Please try again."}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label style={labelStyle}>Name</label>
            <input type="text" {...register("title")} placeholder="Rent, Electricity, etc." style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            {errors.title && <p className="text-red text-base">{errors.title.message}</p>}
          </div>

          <div className="form-grid-2">
            <div className="flex flex-col gap-3">
              <label style={labelStyle}>Amount</label>
              <input type="number" step="0.01" {...register("amount")} placeholder="0.00" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              {errors.amount && <p className="text-red text-base">{errors.amount.message}</p>}
            </div>
            <div className="flex flex-col gap-3">
              <label style={labelStyle}>Currency</label>
              <select {...register("currency")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label style={labelStyle}>Category</label>
            <select {...register("category")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
            </select>
            {errors.category && <p className="text-red text-base">{errors.category.message}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <label style={labelStyle}>Due Date</label>
            <input type="date" {...register("dueDate")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            {errors.dueDate && <p className="text-red text-base">{errors.dueDate.message}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <label style={labelStyle}>Description <span className="text-ink-3 font-normal">(optional)</span></label>
            <textarea {...register("description")} rows={2} placeholder="Any additional notes" className="py-5 px-6 bg-paper-2 text-ink text-md outline-none w-full font-body" style={{ border: "1.5px solid var(--ink)", resize: "vertical" }} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <label className="flex items-center gap-5 cursor-pointer">
            <input id="isRecurring" type="checkbox" {...register("isRecurring")} className="w-8 h-8" style={{ accentColor: "var(--red)" }} />
            <span className="text-base font-medium text-ink-2">Recurring expense</span>
          </label>

          {isRecurring && (
            <div className="flex flex-col gap-3">
              <label style={labelStyle}>Frequency</label>
              <select {...register("recurrenceFrequency")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
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
