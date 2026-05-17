"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateIncomeSource } from "@/hooks/use-income";
import { ApiError } from "@/lib/api-client";
import { FREQUENCIES, FREQUENCY_LABELS, incomeSchema, IncomeFormData, iStyle, Field, onFocusField, onBlurField } from "./_income-form-shared";
import { Btn } from "@/components/editorial";
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
  const router = useRouter();
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
          router.push("/income");
        },
      }
    );
  };

  return (
    <div className="bg-paper p-10 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
      <h2 className="font-serif font-bold text-md text-ink mb-8">
        Add Income Source
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[14px]">
        {createIncome.isError && (
          <div className="py-[10px] px-[14px] bg-[rgba(178,42,26,0.10)] text-base text-red" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
            {createIncome.error instanceof ApiError ? createIncome.error.message : "Something went wrong. Please try again."}
          </div>
        )}
        {createIncome.isSuccess && (
          <div className="py-[10px] px-[14px] bg-[rgba(61,107,43,0.10)] text-base text-green" style={{ border: "1px solid oklch(68% 0.18 152 / 0.25)" }}>
            Income source added!
          </div>
        )}

        <Field label="Source" error={errors.source?.message}>
          <input type="text" {...register("source")} placeholder="Salary, Freelance, etc." style={{ ...iStyle, borderColor: errors.source ? "var(--danger)" : "var(--ink-3)" }} onFocus={onFocusField} onBlur={onBlurField} />
        </Field>

        <div className="form-grid-2">
          <Field label="Amount" error={errors.amount?.message}>
            <input type="number" step="0.01" {...register("amount")} placeholder="0.00" style={{ ...iStyle, borderColor: errors.amount ? "var(--danger)" : "var(--ink-3)" }} onFocus={onFocusField} onBlur={onBlurField} />
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
            <input type="date" {...register("startDate")} style={{ ...iStyle, borderColor: errors.startDate ? "var(--danger)" : "var(--ink-3)" }} onFocus={onFocusField} onBlur={onBlurField} />
          </Field>
          <Field label="Last paycheck date" error={errors.lastPaycheckDate?.message}>
            <input type="date" {...register("lastPaycheckDate")} style={{ ...iStyle, borderColor: errors.lastPaycheckDate ? "var(--danger)" : "var(--ink-3)" }} onFocus={onFocusField} onBlur={onBlurField} />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em]">
              Payroll Deductions {deductions.length > 0 ? `(${deductions.length})` : "(optional)"}
            </span>
            <button
              type="button"
              onClick={() => setShowDeductionForm((v) => !v)}
              className="bg-transparent cursor-pointer text-base font-semibold p-0" style={{ border: "none", color: showDeductionForm ? "var(--text-3)" : "var(--red)" }}
            >
              {showDeductionForm ? "− Hide" : "+ Add deduction"}
            </button>
          </div>

          {/* Pending deduction chips */}
          {deductions.length > 0 && (
            <div className="flex flex-col gap-2 mb-5">
              {deductions.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-5 bg-paper-2" style={{ border: "1.5px solid var(--ink)" }}>
                  <div>
                    <span className="text-base font-semibold text-ink">{d.label}</span>
                    <span className="text-sm text-ink-3 ml-4">
                      {d.method === "PercentOfGross" ? `${d.value}%` : `$${d.value.toFixed(2)}`}
                      {" · "}{d.frequency.toLowerCase()}
                      {d.isEmployerSponsored ? " · employer" : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingDeduction(i)}
                    className="bg-transparent cursor-pointer text-red py-1 px-2 text-md leading-none" style={{ border: "none" }}
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
            <div className="bg-paper-2 p-[14px] flex flex-col gap-5" style={{ border: "1.5px solid var(--ink)" }}>
              <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Field label="Type">
                  <select value={dType} onChange={(e) => setDType(e.target.value as DeductionType)} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
                    {DEDUCTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Label (optional)">
                  <input type="text" value={dLabel} onChange={(e) => setDLabel(e.target.value)} placeholder="e.g. Blue Cross PPO" style={iStyle} onFocus={onFocusField} onBlur={onBlurField} />
                </Field>
              </div>

              <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
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

              <label className="flex items-center gap-4 cursor-pointer text-base text-ink-2">
                <input type="checkbox" checked={dEmployer} onChange={(e) => setDEmployer(e.target.checked)} className="cursor-pointer" />
                Employer-sponsored benefit
              </label>

              <button
                type="button"
                onClick={addPendingDeduction}
                disabled={!dValue}
                className="py-[7px] px-[16px] bg-transparent text-red text-base font-semibold cursor-pointer self-start" style={{ border: "1.5px solid var(--red)", opacity: !dValue ? 0.5 : 1 }}
              >
                + Add to list
              </button>
            </div>
          )}
        </div>

        <Btn
          type="submit"
          disabled={createIncome.isPending}
          variant="primary"
          fullWidth
        >
          {createIncome.isPending ? "Adding…" : `Add Income Source${deductions.length > 0 ? ` with ${deductions.length} deduction${deductions.length > 1 ? "s" : ""}` : ""}`}
        </Btn>
      </form>
    </div>
  );
}
