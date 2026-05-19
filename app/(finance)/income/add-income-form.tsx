"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateIncomeSource } from "@/hooks/use-income";
import { ApiError } from "@/lib/api-client";
import { FREQUENCIES, FREQUENCY_LABELS, incomeSchema, IncomeFormData } from "./_income-form-shared";
import { Btn, Alert, Input, SelectField } from "@/components/editorial";
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
    <div className="bg-paper p-10 shadow-stamp border-ink">
      <h2 className="font-serif font-bold text-md text-ink mb-8">
        Add Income Source
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[14px]">
        {createIncome.isError && (
          <Alert variant="danger">
            {createIncome.error instanceof ApiError ? createIncome.error.message : "Something went wrong. Please try again."}
          </Alert>
        )}
        {createIncome.isSuccess && (
          <Alert variant="success">Income source added!</Alert>
        )}

        <Input
          type="text"
          label="Source"
          placeholder="Salary, Freelance, etc."
          error={errors.source?.message}
          {...register("source")}
        />

        <div className="form-grid-2">
          <Input
            type="number"
            step="0.01"
            label="Amount"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <SelectField label="Currency" {...register("currency")}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </SelectField>
        </div>

        <div className="form-grid-2">
          <SelectField label="Amount quoted as" error={errors.quotedAs?.message} {...register("quotedAs")}>
            {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
          </SelectField>
          <SelectField label="Paid every" error={errors.paidEvery?.message} {...register("paidEvery")}>
            {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
          </SelectField>
        </div>

        <div className="form-grid-2">
          <Input
            type="date"
            label="Income start date"
            error={errors.startDate?.message}
            {...register("startDate")}
          />
          <Input
            type="date"
            label="Last paycheck date"
            error={errors.lastPaycheckDate?.message}
            {...register("lastPaycheckDate")}
          />
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
                <div key={i} className="flex items-center justify-between py-3 px-5 bg-paper-2 border-ink">
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
            <div className="bg-paper-2 p-[14px] flex flex-col gap-5 border-ink">
              <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <SelectField label="Type" value={dType} onChange={(e) => setDType(e.target.value as DeductionType)}>
                  {DEDUCTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </SelectField>
                <Input
                  type="text"
                  label="Label (optional)"
                  value={dLabel}
                  onChange={(e) => setDLabel(e.target.value)}
                  placeholder="e.g. Blue Cross PPO"
                />
              </div>

              <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <SelectField label="Method" value={dMethod} onChange={(e) => setDMethod(e.target.value as DeductionCalculationMethod)}>
                  <option value="FixedAmount">Fixed ($)</option>
                  <option value="PercentOfGross">% of Gross</option>
                </SelectField>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  label={dMethod === "PercentOfGross" ? "Percentage" : "Amount ($)"}
                  value={dValue}
                  onChange={(e) => setDValue(e.target.value)}
                  placeholder={dMethod === "PercentOfGross" ? "e.g. 6" : "e.g. 250"}
                />
                <SelectField label="Frequency" value={dFrequency} onChange={(e) => setDFrequency(e.target.value)}>
                  {DEDUCTION_FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </SelectField>
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
