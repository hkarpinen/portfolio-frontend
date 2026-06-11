"use client";

import { Btn, Icon, Input, SelectField } from "@/components/editorial";
import { DeductionCalculationMethod, DeductionType } from "@/types/deductions";
import { Frequency } from "@/types/schedule";
import { TYPE_CONFIGS, VOLUNTARY_DEDUCTION_TYPES, DEDUCTION_FREQUENCIES } from "./deduction-config";

import { parseEnum } from "@/lib/parse-enum";

export function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <span className="text-sm font-semibold tracking-[0.02em] text-ink-3">{label}</span>
      {children}
    </div>
  );
}

function CheckRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-[15px] w-[15px] shrink-0 cursor-pointer accent-[var(--red)]"
      />
      <div>
        <span className="block text-base font-semibold text-ink-2">{label}</span>
        <span className="text-sm text-ink-3">{hint}</span>
      </div>
    </label>
  );
}

// ── Add deduction form ─────────────────────────────────────────────────────────
interface AddDeductionFormProps {
  dType: DeductionType;
  setDType: (t: DeductionType) => void;
  dLabel: string;
  setDLabel: (v: string) => void;
  dMethod: DeductionCalculationMethod;
  setDMethod: (v: DeductionCalculationMethod) => void;
  dValue: string;
  setDValue: (v: string) => void;
  dFreq: Frequency;
  setDFreq: (v: Frequency) => void;
  dEmployer: boolean;
  setDEmployer: (v: boolean) => void;
  dPreTax: boolean;
  setDPreTax: (v: boolean) => void;
  advancedOpen: boolean;
  setAdvancedOpen: (v: boolean) => void;
  isPending: boolean;
  onAdd: () => void;
  onCancel: () => void;
}

export function AddDeductionForm({
  dType,
  setDType,
  dLabel,
  setDLabel,
  dMethod,
  setDMethod,
  dValue,
  setDValue,
  dFreq,
  setDFreq,
  dEmployer,
  setDEmployer,
  dPreTax,
  setDPreTax,
  advancedOpen,
  setAdvancedOpen,
  isPending,
  onAdd,
  onCancel,
}: AddDeductionFormProps) {
  const cfg = TYPE_CONFIGS[dType];
  const val = parseFloat(dValue);
  const canAdd = dValue && !isNaN(val) && val > 0;

  return (
    <div className="flex flex-col gap-7 border border-accent-border bg-paper-2 p-8">
      {/* Type */}
      <FieldGroup label="Type">
        <SelectField
          id="deduction-type"
          value={dType}
          onChange={(e) => setDType(parseEnum(DeductionType, e.target.value, dType))}
        >
          {VOLUNTARY_DEDUCTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_CONFIGS[t]?.label ?? t}
            </option>
          ))}
        </SelectField>
        {cfg?.hint ? <span className="mt-0.5 text-sm text-red">{cfg.hint}</span> : null}
      </FieldGroup>

      {/* Label (optional) */}
      <FieldGroup label="Label (optional)">
        <Input
          id="deduction-label"
          type="text"
          value={dLabel}
          onChange={(e) => setDLabel(e.target.value)}
          placeholder={`e.g. ${cfg?.label ?? "Custom deduction"}`}
        />
      </FieldGroup>

      {/* Amount / Frequency / Method */}
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
        <FieldGroup
          label={
            dMethod === DeductionCalculationMethod.PercentOfGross ? "Percentage" : "Amount ($)"
          }
        >
          <Input
            id="deduction-value"
            type="number"
            min={0}
            step="0.01"
            value={dValue}
            onChange={(e) => setDValue(e.target.value)}
            placeholder={
              dMethod === DeductionCalculationMethod.PercentOfGross ? "e.g. 6" : "e.g. 214.00"
            }
          />
        </FieldGroup>
        <FieldGroup label="Frequency">
          <SelectField
            id="deduction-freq"
            value={dFreq}
            onChange={(e) => setDFreq(parseEnum(Frequency, e.target.value, dFreq))}
          >
            {DEDUCTION_FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </SelectField>
        </FieldGroup>
        <FieldGroup label="Method">
          <SelectField
            id="deduction-method"
            value={dMethod}
            onChange={(e) =>
              setDMethod(parseEnum(DeductionCalculationMethod, e.target.value, dMethod))
            }
          >
            <option value={DeductionCalculationMethod.FixedAmount}>Fixed ($)</option>
            <option value={DeductionCalculationMethod.PercentOfGross}>% of Gross</option>
          </SelectField>
        </FieldGroup>
      </div>

      {/* Advanced */}
      <div className="overflow-hidden border-ink">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-6 py-[9px]"
        >
          <span className="text-base font-semibold text-ink-3">Advanced</span>
          <span
            style={{ color: "var(--text-3)" }}
            className={`transition-transform duration-[180ms] ${advancedOpen ? "rotate-180" : ""}`}
          >
            <Icon name="chevDown" size={12} strokeWidth={2.5} />
          </span>
        </button>
        {advancedOpen && (
          <div className="flex flex-col gap-5 border-t border-ink p-[0_12px_12px]">
            <p className="pt-5 text-sm leading-[1.5] text-ink-3">
              Auto-set from type. Override only if your plan is non-standard.
            </p>
            <CheckRow
              label="Pre-tax deduction"
              hint="Reduces federal + state taxable wages (W-2 Box 1)"
              checked={dPreTax}
              onChange={setDPreTax}
            />
            <CheckRow
              label="Employer-sponsored"
              hint="Part of an employer benefit plan"
              checked={dEmployer}
              onChange={setDEmployer}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Btn type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Btn>
        <Btn
          type="button"
          variant="primary"
          onClick={onAdd}
          disabled={isPending || !canAdd}
          className="flex-[2]"
        >
          {isPending ? "Adding…" : "Add Deduction"}
        </Btn>
      </div>
    </div>
  );
}
