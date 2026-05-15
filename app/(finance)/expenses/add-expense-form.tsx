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
  iStyle,
  Field,
  onFocusField,
  onBlurField,
} from "./_expense-form-shared";

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
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "var(--shadow-sm)",
    }}>
      <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "var(--ts-body)", color: "var(--text)", marginBottom: "16px" }}>
        Add Personal Expense
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {create.isError && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)", fontSize: "var(--ts-body-sm)", color: "var(--danger)" }}>
            {create.error instanceof ApiError ? create.error.message : "Something went wrong. Please try again."}
          </div>
        )}
        {create.isSuccess && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.25)", fontSize: "var(--ts-body-sm)", color: "var(--success)" }}>
            Expense added!
          </div>
        )}

        <Field label="Title" error={errors.title?.message}>
          <input
            type="text"
            {...register("title")}
            placeholder="Netflix, Rent, Gym, etc."
            style={{ ...iStyle, borderColor: errors.title ? "var(--danger)" : "var(--border)" }}
            onFocus={onFocusField}
            onBlur={onBlurField}
          />
        </Field>

        <div className="form-grid-2">
          <Field label="Amount" error={errors.amount?.message}>
            <input
              type="number"
              step="0.01"
              {...register("amount")}
              placeholder="0.00"
              style={{ ...iStyle, borderColor: errors.amount ? "var(--danger)" : "var(--border)" }}
              onFocus={onFocusField}
              onBlur={onBlurField}
            />
          </Field>
          <Field label="Currency">
            <select {...register("currency")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </Field>
        </div>

        <div className="form-grid-2">
          <Field label="Category">
            <select {...register("category")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
              {BILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Due Date" error={errors.dueDate?.message}>
            <input
              type="date"
              {...register("dueDate")}
              style={{ ...iStyle, borderColor: errors.dueDate ? "var(--danger)" : "var(--border)" }}
              onFocus={onFocusField}
              onBlur={onBlurField}
            />
          </Field>
        </div>

        <Field label="Recurrence (optional)">
          <select {...register("recurrenceFrequency")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
            <option value="">One-time</option>
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </Field>

        <Field label="Description (optional)" error={errors.description?.message}>
          <textarea
            {...register("description")}
            placeholder="Optional notes..."
            rows={2}
            style={{
              ...iStyle,
              height: "auto",
              padding: "10px 12px",
              resize: "none",
              lineHeight: "1.5",
            } as React.CSSProperties}
            onFocus={onFocusField}
            onBlur={onBlurField}
          />
        </Field>

        <button
          type="submit"
          disabled={create.isPending}
          style={{
            height: "40px",
            borderRadius: "12px",
            border: "none",
            background: create.isPending ? "var(--surface-2)" : "var(--accent)",
            color: create.isPending ? "var(--text-3)" : "white",
            fontFamily: "var(--ff-body)",
            fontWeight: "600",
            fontSize: "var(--ts-body-sm)",
            cursor: create.isPending ? "not-allowed" : "pointer",
            transition: "background 110ms",
          }}
        >
          {create.isPending ? "Adding…" : "Add Expense"}
        </button>
      </form>
    </div>
  );
}
