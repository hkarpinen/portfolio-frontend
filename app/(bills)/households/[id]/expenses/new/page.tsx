"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useCreateHouseholdExpense } from "@/hooks/use-expenses";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

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
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "12px", color: "var(--text)", fontSize: "var(--ts-body)",
  outline: "none", width: "100%", fontFamily: "var(--ff-body)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--ts-label)", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em",
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--accent)";
  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--border)";
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
        onSuccess: () => router.push(`/households/${params.id}`),
      }
    );
  };

  return (
    <div className="page-enter" style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <Link href={`/households/${params.id}`} style={{ color: "var(--text-3)", fontSize: "var(--ts-label)", textDecoration: "none" }}>
          ← Back to Household
        </Link>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text)", marginTop: "6px" }}>
          Add Expense
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "var(--ts-body-sm)", marginTop: "4px" }}>
          Add a new expense to this household
        </p>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {createExpense.isError && (
            <div style={{ background: "var(--danger-s)", border: "1px solid var(--danger)", borderRadius: "10px", padding: "10px 14px", fontSize: "var(--ts-body-sm)", color: "var(--danger)" }}>
              {createExpense.error instanceof ApiError ? createExpense.error.message : "Something went wrong. Please try again."}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Name</label>
            <input type="text" {...register("title")} placeholder="Rent, Electricity, etc." style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            {errors.title && <p style={{ color: "var(--danger)", fontSize: "var(--ts-label)" }}>{errors.title.message}</p>}
          </div>

          <div className="form-grid-2">
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Amount</label>
              <input type="number" step="0.01" {...register("amount")} placeholder="0.00" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              {errors.amount && <p style={{ color: "var(--danger)", fontSize: "var(--ts-label)" }}>{errors.amount.message}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Currency</label>
              <select {...register("currency")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Category</label>
            <select {...register("category")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
            </select>
            {errors.category && <p style={{ color: "var(--danger)", fontSize: "var(--ts-label)" }}>{errors.category.message}</p>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Due Date</label>
            <input type="date" {...register("dueDate")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            {errors.dueDate && <p style={{ color: "var(--danger)", fontSize: "var(--ts-label)" }}>{errors.dueDate.message}</p>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Description <span style={{ color: "var(--text-3)", fontWeight: "400" }}>(optional)</span></label>
            <textarea {...register("description")} rows={2} placeholder="Any additional notes" style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text)", fontSize: "var(--ts-body)", outline: "none", width: "100%", resize: "vertical", fontFamily: "var(--ff-body)" }} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input id="isRecurring" type="checkbox" {...register("isRecurring")} style={{ width: "16px", height: "16px", accentColor: "var(--accent)" }} />
            <span style={{ fontSize: "var(--ts-body-sm)", fontWeight: "500", color: "var(--text-2)" }}>Recurring expense</span>
          </label>

          {isRecurring && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Frequency</label>
              <select {...register("recurrenceFrequency")} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          )}

          <Button
            type="submit"
            disabled={createExpense.isPending}
            variant="primary"
            fullWidth
          >
            {createExpense.isPending ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </div>
    </div>
  );
}
