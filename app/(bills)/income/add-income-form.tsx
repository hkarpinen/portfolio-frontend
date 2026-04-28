"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateIncomeSource } from "@/hooks/use-income";
import { ApiError } from "@/lib/api-client";
import { FREQUENCIES, incomeSchema, IncomeFormData, iStyle, Field, onFocusField, onBlurField } from "./_income-form-shared";
import { Button } from "@/components/ui/button";

export function AddIncomeForm() {
  const createIncome = useCreateIncomeSource();
  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      currency: "USD",
      frequency: "Monthly",
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = (data: IncomeFormData) => {
    createIncome.mutate(
      {
        source: data.source,
        amount: Number(data.amount),
        currency: data.currency,
        frequency: data.frequency,
        startDate: new Date(data.startDate).toISOString(),
      },
      { onSuccess: () => reset() }
    );
  };

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)",
    }}>
      <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>
        Add Income Source
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {createIncome.isError && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)", fontSize: "13px", color: "var(--danger)" }}>
            {createIncome.error instanceof ApiError ? createIncome.error.message : "Something went wrong. Please try again."}
          </div>
        )}
        {createIncome.isSuccess && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.25)", fontSize: "13px", color: "var(--success)" }}>
            Income source added!
          </div>
        )}

        <Field label="Source" error={errors.source?.message}>
          <input type="text" {...register("source")} placeholder="Salary, Freelance, etc." style={{ ...iStyle, borderColor: errors.source ? "var(--danger)" : "var(--border)" }} onFocus={onFocusField} onBlur={onBlurField} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Field label="Amount" error={errors.amount?.message}>
            <input type="number" step="0.01" {...register("amount")} placeholder="0.00" style={{ ...iStyle, borderColor: errors.amount ? "var(--danger)" : "var(--border)" }} onFocus={onFocusField} onBlur={onBlurField} />
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Field label="Frequency">
            <select {...register("frequency")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>)}
            </select>
          </Field>
          <Field label="Start Date" error={errors.startDate?.message}>
            <input type="date" {...register("startDate")} style={{ ...iStyle, borderColor: errors.startDate ? "var(--danger)" : "var(--border)" }} onFocus={onFocusField} onBlur={onBlurField} />
          </Field>
        </div>

        <Button
          type="submit"
          disabled={createIncome.isPending}
          variant="primary"
          fullWidth
        >
          {createIncome.isPending ? "Adding…" : "Add Income Source"}
        </Button>
      </form>
    </div>
  );
}
