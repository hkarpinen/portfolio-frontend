"use client";

import type { DeductionCalculationMethod, DeductionType } from "@/types/finance";
import { TYPE_CONFIGS, VOLUNTARY_TYPES, DEDUCTION_FREQUENCIES } from "./deduction-config";
import { Btn, Input, SelectField } from "@/components/editorial";

export function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <span className="text-sm font-semibold text-ink-3 tracking-[0.02em]">{label}</span>
      {children}
    </div>
  );
}

export function CheckRow({ label, hint, checked, onChange }: {
  label: string; hint: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-5 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-1 cursor-pointer w-[15px] h-[15px] shrink-0 accent-[var(--red)]"
      />
      <div>
        <span className="text-base font-semibold text-ink-2 block">{label}</span>
        <span className="text-sm text-ink-3">{hint}</span>
      </div>
    </label>
  );
}

// ── Add deduction form ─────────────────────────────────────────────────────────
export interface AddDeductionFormProps {
  dType: DeductionType;                setDType: (t: DeductionType) => void;
  dLabel: string;                      setDLabel: (v: string) => void;
  dMethod: DeductionCalculationMethod; setDMethod: (v: DeductionCalculationMethod) => void;
  dValue: string;                      setDValue: (v: string) => void;
  dFreq: string;                       setDFreq: (v: string) => void;
  dEmployer: boolean;                  setDEmployer: (v: boolean) => void;
  dPreTax: boolean;                    setDPreTax: (v: boolean) => void;
  advancedOpen: boolean;               setAdvancedOpen: (v: boolean) => void;
  isPending: boolean;
  onAdd: () => void;
  onCancel: () => void;
}

export function AddDeductionForm({
  dType, setDType, dLabel, setDLabel, dMethod, setDMethod,
  dValue, setDValue, dFreq, setDFreq, dEmployer, setDEmployer,
  dPreTax, setDPreTax, advancedOpen, setAdvancedOpen,
  isPending, onAdd, onCancel,
}: AddDeductionFormProps) {
  const cfg = TYPE_CONFIGS[dType as string];
  const val = parseFloat(dValue);
  const canAdd = dValue && !isNaN(val) && val > 0;

  return (
    <div className="bg-paper-2 p-8 flex flex-col gap-[14px] border border-accent-border">

      {/* Type */}
      <FieldGroup label="Type">
        <SelectField id="deduction-type" value={dType} onChange={(e) => setDType(e.target.value as DeductionType)}>
          {VOLUNTARY_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_CONFIGS[t as string]?.label ?? t}</option>
          ))}
        </SelectField>
        {cfg?.hint ? <span className="text-sm text-red mt-[1px]">{cfg.hint}</span> : null}
      </FieldGroup>

      {/* Label (optional) */}
      <FieldGroup label="Label (optional)">
        <Input id="deduction-label" type="text" value={dLabel} onChange={(e) => setDLabel(e.target.value)}
          placeholder={`e.g. ${cfg?.label ?? "Custom deduction"}`}
        />
      </FieldGroup>

      {/* Amount / Frequency / Method */}
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
        <FieldGroup label={dMethod === "PercentOfGross" ? "Percentage" : "Amount ($)"}>
          <Input id="deduction-value" type="number" min={0} step="0.01" value={dValue} onChange={(e) => setDValue(e.target.value)}
            placeholder={dMethod === "PercentOfGross" ? "e.g. 6" : "e.g. 214.00"}
          />
        </FieldGroup>
        <FieldGroup label="Frequency">
          <SelectField id="deduction-freq" value={dFreq} onChange={(e) => setDFreq(e.target.value)}>
            {DEDUCTION_FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </SelectField>
        </FieldGroup>
        <FieldGroup label="Method">
          <SelectField id="deduction-method" value={dMethod} onChange={(e) => setDMethod(e.target.value as DeductionCalculationMethod)}>
            <option value="FixedAmount">Fixed ($)</option>
            <option value="PercentOfGross">% of Gross</option>
          </SelectField>
        </FieldGroup>
      </div>

      {/* Advanced */}
      <div className="overflow-hidden border-ink">
        <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between py-[9px] px-[12px] bg-transparent cursor-pointer border-none"
        >
          <span className="text-base font-semibold text-ink-3">Advanced</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-[180ms]${advancedOpen ? " rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {advancedOpen && (
          <div className="p-[0_12px_12px] flex flex-col gap-5 border-t border-ink">
            <p className="text-sm text-ink-3 pt-5 leading-[1.5]">
              Auto-set from type. Override only if your plan is non-standard.
            </p>
            <CheckRow label="Pre-tax deduction" hint="Reduces federal + state taxable wages (W-2 Box 1)" checked={dPreTax} onChange={setDPreTax} />
            <CheckRow label="Employer-sponsored" hint="Part of an employer benefit plan" checked={dEmployer} onChange={setDEmployer} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Btn type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Btn>
        <Btn type="button" variant="primary" onClick={onAdd} disabled={isPending || !canAdd} className="flex-[2]">
          {isPending ? "Adding…" : "Add Deduction"}
        </Btn>
      </div>
    </div>
  );
}
