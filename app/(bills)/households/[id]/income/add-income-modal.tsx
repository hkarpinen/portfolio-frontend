"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateIncomeSource } from "@/hooks/use-income";
import { ApiError } from "@/lib/api-client";
import { FREQUENCIES, incomeSchema, IncomeFormData, iStyle, Field, onFocusField, onBlurField } from "@/app/(bills)/income/_income-form-shared";
import { Button } from "@/components/ui/button";

export function AddHouseholdIncomeModal({
  householdId,
  currency,
  onClose,
}: {
  householdId: string;
  currency: string;
  onClose: () => void;
}) {
  const createIncome = useCreateIncomeSource();
  const {
    register, handleSubmit,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      currency,
      frequency: "Monthly",
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  function onSubmit(data: IncomeFormData) {
    createIncome.mutate(
      {
        source: data.source,
        amount: Number(data.amount),
        currency: data.currency,
        frequency: data.frequency,
        startDate: data.startDate,
        householdId,
      },
      { onSuccess: () => onClose() }
    );
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "oklch(0% 0 0 / 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, padding: "16px",
      }}
    >
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "20px", boxShadow: "var(--shadow-lg)",
        width: "100%", maxWidth: "440px",
        animation: "scaleIn 200ms cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)", margin: 0 }}>
            Add Income Source
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "4px", borderRadius: "8px", display: "flex", alignItems: "center" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {createIncome.isError && (
            <div style={{ background: "var(--danger-s)", border: "1px solid var(--danger)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--danger)" }}>
              {createIncome.error instanceof ApiError ? createIncome.error.message : "Failed to add income source."}
            </div>
          )}
          <Field label="Source" error={errors.source?.message}>
            <input {...register("source")} style={iStyle} placeholder="e.g. Salary, Freelance" onFocus={onFocusField} onBlur={onBlurField} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Amount" error={errors.amount?.message}>
              <input {...register("amount")} type="number" step="0.01" style={iStyle} placeholder="0.00" onFocus={onFocusField} onBlur={onBlurField} />
            </Field>
            <Field label="Currency" error={errors.currency?.message}>
              <input {...register("currency")} style={iStyle} placeholder="USD" onFocus={onFocusField} onBlur={onBlurField} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Frequency" error={errors.frequency?.message}>
              <select {...register("frequency")} style={{ ...iStyle, appearance: "none", cursor: "pointer" }} onFocus={onFocusField} onBlur={onBlurField}>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Start Date" error={errors.startDate?.message}>
              <input {...register("startDate")} type="date" style={iStyle} onFocus={onFocusField} onBlur={onBlurField} />
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-2)", padding: "8px 16px", borderRadius: "12px",
              fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--ff-body)",
            }}
          >
            Cancel
          </button>
          <Button
            type="submit"
            form=""
            onClick={handleSubmit(onSubmit)}
            disabled={createIncome.isPending}
            variant="primary"
          >
            {createIncome.isPending ? "Adding…" : "Add Income"}
          </Button>
        </div>
      </div>
    </div>
  );
}
