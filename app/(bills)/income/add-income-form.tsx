"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateIncomeSource } from "@/hooks/use-income";
import { ApiError } from "@/lib/api-client";
import { FREQUENCIES, FREQUENCY_LABELS, incomeSchema, IncomeFormData, iStyle, Field, onFocusField, onBlurField } from "./_income-form-shared";
import { Button } from "@/components/ui/button";
import type { DeductionType, DeductionCalculationMethod, PayrollDeduction } from "@/types/finance";

const DEDUCTION_TYPES: { value: DeductionType; label: string }[] = [
  { value: "HealthInsurance", label: "Health Insurance" },
  { value: "DentalInsurance", label: "Dental Insurance" },
  { value: "VisionInsurance", label: "Vision Insurance" },
  { value: "LifeInsurance", label: "Life Insurance" },
  { value: "Retirement401k", label: "401(k) Traditional" },
  { value: "Roth401k", label: "401(k) Roth" },
  { value: "HSA", label: "HSA" },
  { value: "FSA", label: "FSA" },
  { value: "Other", label: "Other" },
];

const DEDUCTION_FREQUENCIES = [
  { value: "Weekly", label: "Weekly" },
  { value: "BiWeekly", label: "Bi-Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "SemiAnnually", label: "Semi-Annually" },
  { value: "Annually", label: "Annually" },
];

export function AddIncomeForm() {
  const createIncome = useCreateIncomeSource();
  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      currency: "USD",
      quotedAs: "Annually",
      paidEvery: "BiWeekly",
      startDate: new Date().toISOString().slice(0, 10),
      lastPaycheckDate: new Date().toISOString().slice(0, 10),
    },
  });

  // ── Pending deductions (added before submit) ──────────────────────────────
  const [deductions, setDeductions] = useState<PayrollDeduction[]>([]);
  const [showDeductionForm, setShowDeductionForm] = useState(false);
  const [dType, setDType] = useState<DeductionType>("HealthInsurance");
  const [dLabel, setDLabel] = useState("");
  const [dMethod, setDMethod] = useState<DeductionCalculationMethod>("FixedAmount");
  const [dValue, setDValue] = useState("");
  const [dFrequency, setDFrequency] = useState("Monthly");
  const [dEmployer, setDEmployer] = useState(false);

  function addPendingDeduction() {
    const val = parseFloat(dValue);
    if (!dValue || isNaN(val) || val <= 0) return;
    const label = dLabel.trim() || (DEDUCTION_TYPES.find((t) => t.value === dType)?.label ?? dType);
    setDeductions((prev) => [...prev, {
      type: dType, label, method: dMethod,
      value: val, isEmployerSponsored: dEmployer, frequency: dFrequency,
      isTaxExempt: false
    }]);
    setDLabel(""); setDValue(""); setDEmployer(false);
  }

  function removePendingDeduction(i: number) {
    setDeductions((prev) => prev.filter((_, idx) => idx !== i));
  }

  const onSubmit = (data: IncomeFormData) => {
    createIncome.mutate(
      {
        source: data.source,
        amount: Number(data.amount),
        currency: data.currency,
        quotedAs: data.quotedAs,
        paidEvery: data.paidEvery,
        startDate: new Date(data.startDate).toISOString(),
        lastPaycheckDate: new Date(data.lastPaycheckDate).toISOString(),
        initialDeductions: deductions.length > 0 ? deductions : undefined,
      },
      {
        onSuccess: () => {
          reset();
          setDeductions([]);
          setShowDeductionForm(false);
        },
      }
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

        <div className="form-grid-2">
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

        <div className="form-grid-2">
          <Field label="Amount quoted as" error={errors.quotedAs?.message}>
            <select {...register("quotedAs")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
            </select>
          </Field>
          <Field label="Paid every" error={errors.paidEvery?.message}>
            <select {...register("paidEvery")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
            </select>
          </Field>
        </div>

        <div className="form-grid-2">
          <Field label="Income start date" error={errors.startDate?.message}>
            <input type="date" {...register("startDate")} style={{ ...iStyle, borderColor: errors.startDate ? "var(--danger)" : "var(--border)" }} onFocus={onFocusField} onBlur={onBlurField} />
          </Field>
          <Field label="Last paycheck date" error={errors.lastPaycheckDate?.message}>
            <input type="date" {...register("lastPaycheckDate")} style={{ ...iStyle, borderColor: errors.lastPaycheckDate ? "var(--danger)" : "var(--border)" }} onFocus={onFocusField} onBlur={onBlurField} />
          </Field>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Payroll Deductions {deductions.length > 0 ? `(${deductions.length})` : "(optional)"}
            </span>
            <button
              type="button"
              onClick={() => setShowDeductionForm((v) => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "12px", fontWeight: "600",
                color: showDeductionForm ? "var(--text-3)" : "var(--accent)",
                padding: 0,
              }}
            >
              {showDeductionForm ? "− Hide" : "+ Add deduction"}
            </button>
          </div>

          {/* Pending deduction chips */}
          {deductions.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" }}>
              {deductions.map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "6px 10px", borderRadius: "10px",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                }}>
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>{d.label}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "8px" }}>
                      {d.method === "PercentOfGross" ? `${d.value}%` : `$${d.value.toFixed(2)}`}
                      {" · "}{d.frequency.toLowerCase()}
                      {d.isEmployerSponsored ? " · employer" : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingDeduction(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: "2px 4px", fontSize: "16px", lineHeight: 1 }}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Inline add-deduction mini-form */}
          {showDeductionForm && (
            <div style={{
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "12px", padding: "14px",
              display: "flex", flexDirection: "column", gap: "10px",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="Type">
                  <select value={dType} onChange={(e) => setDType(e.target.value as DeductionType)} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
                    {DEDUCTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Label (optional)">
                  <input type="text" value={dLabel} onChange={(e) => setDLabel(e.target.value)} placeholder="e.g. Blue Cross PPO" style={iStyle} onFocus={onFocusField} onBlur={onBlurField} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <Field label="Method">
                  <select value={dMethod} onChange={(e) => setDMethod(e.target.value as DeductionCalculationMethod)} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
                    <option value="FixedAmount">Fixed ($)</option>
                    <option value="PercentOfGross">% of Gross</option>
                  </select>
                </Field>
                <Field label={dMethod === "PercentOfGross" ? "Percentage" : "Amount ($)"}>
                  <input type="number" min={0} step="0.01" value={dValue} onChange={(e) => setDValue(e.target.value)} placeholder={dMethod === "PercentOfGross" ? "e.g. 6" : "e.g. 250"} style={iStyle} onFocus={onFocusField} onBlur={onBlurField} />
                </Field>
                <Field label="Frequency">
                  <select value={dFrequency} onChange={(e) => setDFrequency(e.target.value)} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
                    {DEDUCTION_FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </Field>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", color: "var(--text-2)" }}>
                <input type="checkbox" checked={dEmployer} onChange={(e) => setDEmployer(e.target.checked)} style={{ cursor: "pointer" }} />
                Employer-sponsored benefit
              </label>

              <button
                type="button"
                onClick={addPendingDeduction}
                disabled={!dValue}
                style={{
                  padding: "7px 16px", borderRadius: "9999px",
                  border: "1px solid var(--accent)",
                  background: "transparent",
                  color: "var(--accent)",
                  fontSize: "12px", fontWeight: "600", cursor: "pointer",
                  opacity: !dValue ? 0.5 : 1,
                  alignSelf: "flex-start",
                }}
              >
                + Add to list
              </button>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={createIncome.isPending}
          variant="primary"
          fullWidth
        >
          {createIncome.isPending ? "Adding…" : `Add Income Source${deductions.length > 0 ? ` with ${deductions.length} deduction${deductions.length > 1 ? "s" : ""}` : ""}`}
        </Button>
      </form>
    </div>
  );
}
