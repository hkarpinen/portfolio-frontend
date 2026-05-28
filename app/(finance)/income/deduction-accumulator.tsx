"use client";

import { useState } from "react";
import {
  DeductionType,
  DeductionCalculationMethod,
  type PayrollDeduction,
} from "@/types/deductions";
import { Frequency, FREQUENCY_LABELS } from "@/types/schedule";
import { TYPE_CONFIGS, VOLUNTARY_DEDUCTION_TYPES } from "./deduction-config";
import { INCOME_FREQUENCY_OPTIONS } from "./_income-form-shared";
import { parseEnum } from "@/lib/parse-enum";
import { formatAmount } from "@/lib/formatting";
import { Btn, Input, SelectField } from "@/components/editorial";

/**
 * Accumulates a list of payroll deductions inside the Add Income form.
 *
 * Owns the entire deduction sub-state internally — type/label/method/
 * value/frequency/employer — so the parent form only sees the resulting
 * `PayrollDeduction[]` via `value` / `onChange`. Mirrors a controlled
 * input pattern.
 */
export function DeductionAccumulator({
  value,
  onChange,
}: {
  value: PayrollDeduction[];
  onChange: (next: PayrollDeduction[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [dType, setDType] = useState<DeductionType>(DeductionType.HealthInsurance);
  const [dLabel, setDLabel] = useState("");
  const [dMethod, setDMethod] = useState<DeductionCalculationMethod>(
    DeductionCalculationMethod.FixedAmount,
  );
  const [dValue, setDValue] = useState("");
  const [dFrequency, setDFrequency] = useState<Frequency>(Frequency.Monthly);
  const [dEmployer, setDEmployer] = useState(false);

  function add() {
    const val = parseFloat(dValue);
    if (!dValue || isNaN(val) || val <= 0) return;
    const label = dLabel.trim() || (TYPE_CONFIGS[dType]?.label ?? dType);
    onChange([
      ...value,
      {
        type: dType,
        label,
        method: dMethod,
        value: val,
        isEmployerSponsored: dEmployer,
        frequency: dFrequency,
        isTaxExempt: false,
      },
    ]);
    setDLabel("");
    setDValue("");
    setDEmployer(false);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-[0.08em] text-ink-3">
          Payroll Deductions{" "}
          {value.length > 0 ? (
            <span aria-live="polite" aria-atomic="true">
              ({value.length} added)
            </span>
          ) : (
            <span className="text-sm font-normal normal-case tracking-normal text-ink-4">
              — optional
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-controls="deduction-form-panel"
          className={`cursor-pointer bg-transparent p-0 text-base font-semibold border-none${showForm ? "text-ink-3" : "text-red"}`}
        >
          {showForm ? "Hide" : "+ Add deduction"}
        </button>
      </div>

      {value.length > 0 && (
        <ul
          className="m-0 mb-5 flex list-none flex-col gap-2 p-0"
          aria-label="Deductions to be added"
        >
          {value.map((d, i) => (
            <li
              key={i}
              className="flex items-center justify-between border-ink bg-paper-2 px-5 py-3"
            >
              <div>
                <span className="text-base font-semibold text-ink">{d.label}</span>
                <span className="ml-4 text-sm text-ink-3">
                  {d.method === DeductionCalculationMethod.PercentOfGross
                    ? `${d.value}% of gross`
                    : `$${formatAmount(d.value)}`}
                  {" · "}
                  {d.frequency.toLowerCase()}
                  {d.isEmployerSponsored ? " · employer-sponsored" : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="cursor-pointer border-none bg-transparent px-2 py-1 text-md leading-none text-red"
                aria-label={`Remove deduction: ${d.label}`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        id="deduction-form-panel"
        role="region"
        aria-label="Add payroll deduction"
        hidden={!showForm}
      >
        {showForm && (
          <div className="flex flex-col gap-5 border-ink bg-paper-2 p-[14px]">
            <div className="grid grid-cols-2 gap-5">
              <SelectField
                label="Type"
                value={dType}
                onChange={(e) => setDType(parseEnum(DeductionType, e.target.value, dType))}
              >
                {VOLUNTARY_DEDUCTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_CONFIGS[t]?.label ?? t}
                  </option>
                ))}
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

            <div className="grid grid-cols-3 gap-5">
              <SelectField
                label="Method"
                value={dMethod}
                onChange={(e) =>
                  setDMethod(parseEnum(DeductionCalculationMethod, e.target.value, dMethod))
                }
              >
                <option value={DeductionCalculationMethod.FixedAmount}>Fixed amount ($)</option>
                <option value={DeductionCalculationMethod.PercentOfGross}>
                  Percent of gross (%)
                </option>
              </SelectField>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                label={
                  dMethod === DeductionCalculationMethod.PercentOfGross
                    ? "Percentage"
                    : "Amount ($)"
                }
                value={dValue}
                onChange={(e) => setDValue(e.target.value)}
                placeholder={
                  dMethod === DeductionCalculationMethod.PercentOfGross ? "e.g. 6" : "e.g. 250.00"
                }
                aria-describedby="deduction-value-hint"
              />
              <SelectField
                label="Frequency"
                value={dFrequency}
                onChange={(e) =>
                  setDFrequency(parseEnum(Frequency, e.target.value, dFrequency))
                }
              >
                {INCOME_FREQUENCY_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {FREQUENCY_LABELS[f]}
                  </option>
                ))}
              </SelectField>
            </div>
            <p id="deduction-value-hint" className="sr-only">
              {dMethod === DeductionCalculationMethod.PercentOfGross
                ? "Enter a percentage, e.g. 6 for 6% of gross pay."
                : "Enter the fixed dollar amount deducted per pay period."}
            </p>

            <label className="flex cursor-pointer items-center gap-4 text-base text-ink-2">
              <input
                type="checkbox"
                checked={dEmployer}
                onChange={(e) => setDEmployer(e.target.checked)}
                className="cursor-pointer"
                aria-describedby="employer-sponsored-hint"
              />
              Employer-sponsored benefit
              <span id="employer-sponsored-hint" className="sr-only">
                Check this if your employer pays part of this benefit.
              </span>
            </label>

            <Btn
              type="button"
              variant="outline"
              size="sm"
              onClick={add}
              disabled={!dValue}
              className="self-start"
            >
              + Add to list
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
