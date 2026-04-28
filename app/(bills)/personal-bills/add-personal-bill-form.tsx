"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePersonalBill } from "@/hooks/use-personal-bills";
import { ApiError } from "@/lib/api-client";
import {
  BILL_CATEGORIES,
  FREQUENCIES,
  personalBillSchema,
  PersonalBillFormData,
  iStyle,
  Field,
  onFocusField,
  onBlurField,
} from "./_personal-bill-form-shared";

export function AddPersonalBillForm() {
  const create = useCreatePersonalBill();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalBillFormData>({
    resolver: zodResolver(personalBillSchema),
    defaultValues: {
      currency: "USD",
      category: "Other",
      dueDate: new Date().toISOString().slice(0, 10),
      recurrenceFrequency: "",
    },
  });

  const onSubmit = (data: PersonalBillFormData) => {
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
      { onSuccess: () => reset() }
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
      <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>
        Add Personal Bill
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {create.isError && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)", fontSize: "13px", color: "var(--danger)" }}>
            {create.error instanceof ApiError ? create.error.message : "Something went wrong. Please try again."}
          </div>
        )}
        {create.isSuccess && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.25)", fontSize: "13px", color: "var(--success)" }}>
            Bill added!
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
            fontSize: "13px",
            cursor: create.isPending ? "not-allowed" : "pointer",
            transition: "background 110ms",
          }}
        >
          {create.isPending ? "Adding…" : "Add Bill"}
        </button>
      </form>
    </div>
  );
}
