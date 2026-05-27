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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-[14px]"
        aria-label="Add income source"
        noValidate
      >
        {createIncome.isError && (
          <Alert variant="danger" role="alert">
            {createIncome.error instanceof ApiError ? createIncome.error.message : "Something went wrong. Please try again."}
          </Alert>
        )}
        {createIncome.isSuccess && (
          <Alert variant="success" role="status">Income source saved — redirecting…</Alert>
        )}

        <Input
          type="text"
          label="Source name"
          placeholder="e.g. Acme Corp, Freelance Design…"
          error={errors.source?.message}
          autoFocus
          autoComplete="organization"
          {...register("source")}
        />

        <div className="form-grid-2">
          <div>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              label="Amount"
              placeholder="0.00"
              error={errors.amount?.message}
              aria-describedby="income-amount-hint"
              {...register("amount")}
            />
            <p id="income-amount-hint" className="sr-only">
              Enter the gross amount as it appears on your offer letter or contract. Select how it is quoted below.
            </p>
          </div>
          <SelectField label="Currency" {...register("currency")}>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="CAD">CAD — Canadian Dollar</option>
          </SelectField>
        </div>

        <div className="form-grid-2">
          <SelectField
            label="Amount quoted as"
            error={errors.quotedAs?.message}
            aria-describedby="quoted-as-hint"
            {...register("quotedAs")}
          >
            {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
          </SelectField>
          <SelectField
            label="Paid every"
            error={errors.paidEvery?.message}
            aria-describedby="paid-every-hint"
            {...register("paidEvery")}
          >
            {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
          </SelectField>
          <p id="quoted-as-hint" className="sr-only">How the amount is expressed — e.g. annually for a salary, weekly for hourly.</p>
          <p id="paid-every-hint" className="sr-only">How often you actually receive a paycheck — e.g. bi-weekly for most salaried jobs.</p>
        </div>

        <div className="form-grid-2">
          <Input
            type="date"
            label="Income start date"
            error={errors.startDate?.message}
            aria-describedby="start-date-hint"
            {...register("startDate")}
          />
          <Input
            type="date"
            label="Last paycheck date"
            error={errors.lastPaycheckDate?.message}
            aria-describedby="last-paycheck-hint"
            {...register("lastPaycheckDate")}
          />
          <p id="start-date-hint" className="sr-only">When you started receiving this income.</p>
          <p id="last-paycheck-hint" className="sr-only">Used to calculate the next expected paycheck date.</p>
        </div>

        {/* Payroll deductions section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em]">
              Payroll Deductions{" "}
              {deductions.length > 0
                ? <span aria-live="polite" aria-atomic="true">({deductions.length} added)</span>
                : <span className="font-normal normal-case tracking-normal text-ink-4 text-sm">— optional</span>
              }
            </span>
            <button
              type="button"
              onClick={() => setShowDeductionForm((v) => !v)}
              aria-expanded={showDeductionForm}
              aria-controls="deduction-form-panel"
              className={`bg-transparent cursor-pointer text-base font-semibold p-0 border-none${showDeductionForm ? " text-ink-3" : " text-red"}`}
            >
              {showDeductionForm ? "Hide" : "+ Add deduction"}
            </button>
          </div>

          {/* Pending deduction chips */}
          {deductions.length > 0 && (
            <ul className="flex flex-col gap-2 mb-5 list-none p-0 m-0" aria-label="Deductions to be added">
              {deductions.map((d, i) => (
                <li key={i} className="flex items-center justify-between py-3 px-5 bg-paper-2 border-ink">
                  <div>
                    <span className="text-base font-semibold text-ink">{d.label}</span>
                    <span className="text-sm text-ink-3 ml-4">
                      {d.method === "PercentOfGross" ? `${d.value}% of gross` : `$${d.value.toFixed(2)}`}
                      {" · "}{d.frequency.toLowerCase()}
                      {d.isEmployerSponsored ? " · employer-sponsored" : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingDeduction(i)}
                    className="bg-transparent cursor-pointer text-red py-1 px-2 text-md leading-none border-none"
                    aria-label={`Remove deduction: ${d.label}`}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Inline add-deduction mini-form */}
          <div
            id="deduction-form-panel"
            role="region"
            aria-label="Add payroll deduction"
            hidden={!showDeductionForm}
          >
            {showDeductionForm && (
              <div className="bg-paper-2 p-[14px] flex flex-col gap-5 border-ink">
                <div className="grid gap-5 grid-cols-2">
                  <SelectField label="Type" value={dType} onChange={(e) => setDType(e.target.value as DeductionType)}>
                    {DEDUCTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </SelectField>
                  <Input
                    type="text"
                    label="Label"
                    aria-label="Deduction label (optional — defaults to type name)"
                    value={dLabel}
                    onChange={(e) => setDLabel(e.target.value)}
                    placeholder="e.g. Blue Cross PPO"
                  />
                </div>

                <div className="grid gap-5 grid-cols-3">
                  <SelectField label="Method" value={dMethod} onChange={(e) => setDMethod(e.target.value as DeductionCalculationMethod)}>
                    <option value="FixedAmount">Fixed amount ($)</option>
                    <option value="PercentOfGross">Percent of gross (%)</option>
                  </SelectField>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    label={dMethod === "PercentOfGross" ? "Percentage" : "Amount ($)"}
                    value={dValue}
                    onChange={(e) => setDValue(e.target.value)}
                    placeholder={dMethod === "PercentOfGross" ? "e.g. 6" : "e.g. 250.00"}
                    aria-describedby="deduction-value-hint"
                  />
                  <SelectField label="Frequency" value={dFrequency} onChange={(e) => setDFrequency(e.target.value)}>
                    {DEDUCTION_FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </SelectField>
                </div>
                <p id="deduction-value-hint" className="sr-only">
                  {dMethod === "PercentOfGross"
                    ? "Enter a percentage, e.g. 6 for 6% of gross pay."
                    : "Enter the fixed dollar amount deducted per pay period."}
                </p>

                <label className="flex items-center gap-4 cursor-pointer text-base text-ink-2">
                  <input
                    type="checkbox"
                    checked={dEmployer}
                    onChange={(e) => setDEmployer(e.target.checked)}
                    className="cursor-pointer"
                    aria-describedby="employer-sponsored-hint"
                  />
                  Employer-sponsored benefit
                  <span id="employer-sponsored-hint" className="sr-only">Check this if your employer pays part of this benefit.</span>
                </label>

                <button
                  type="button"
                  onClick={addPendingDeduction}
                  disabled={!dValue}
                  className="py-[7px] px-[16px] bg-transparent text-red text-base font-semibold cursor-pointer self-start [border:1.5px_solid_var(--red)] disabled:opacity-50"
                  aria-disabled={!dValue}
                >
                  + Add to list
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <Btn
            type="button"
            variant="secondary"
            onClick={() => router.push("/income")}
            className="flex-1"
          >
            Cancel
          </Btn>
          <Btn
            type="submit"
            disabled={createIncome.isPending}
            variant="primary"
            className="flex-1"
          >
            {createIncome.isPending
              ? "Saving…"
              : deductions.length > 0
                ? `Add source with ${deductions.length} deduction${deductions.length > 1 ? "s" : ""}`
                : "Add Income Source"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
