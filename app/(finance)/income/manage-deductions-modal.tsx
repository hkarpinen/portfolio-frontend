"use client";

import { useState } from "react";
import { useSetTaxProfile, useAddDeduction, useRemoveDeduction } from "@/hooks/use-income";
import type {
  IncomeSource, TaxWithholdingProfile, PayrollDeduction,
  DeductionType, DeductionCalculationMethod, FilingStatus,
} from "@/types/finance";

// ── US States ────────────────────────────────────────────────────────────────
const US_STATES = [
  { code: "AL", name: "Alabama" },        { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },        { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },     { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },    { code: "DC", name: "Washington D.C." },
  { code: "DE", name: "Delaware" },       { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },        { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },          { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },        { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },         { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },      { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },       { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },       { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },    { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },        { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },         { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },     { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },       { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },   { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },       { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },   { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },      { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },           { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },       { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// ── Deduction type smart defaults ─────────────────────────────────────────────
interface TypeConfig {
  label: string;
  defaultMethod: DeductionCalculationMethod;
  defaultFreq: string;
  defaultPreTax: boolean;
  defaultEmployer: boolean;
  hint: string;
}

const TYPE_CONFIGS: Record<string, TypeConfig> = {
  HealthInsurance: { label: "Health Insurance",   defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: true,  hint: "\u00a7125 cafeteria plan \u00b7 pre-tax" },
  DentalInsurance: { label: "Dental Insurance",   defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: true,  hint: "\u00a7125 cafeteria plan \u00b7 pre-tax" },
  VisionInsurance: { label: "Vision Insurance",   defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: true,  hint: "\u00a7125 cafeteria plan \u00b7 pre-tax" },
  LifeInsurance:   { label: "Life Insurance",     defaultMethod: "FixedAmount",    defaultFreq: "Monthly",  defaultPreTax: false, defaultEmployer: true,  hint: "After-tax" },
  Retirement401k:  { label: "401(k) Traditional", defaultMethod: "PercentOfGross", defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: false, hint: "\u00a7401(a) \u00b7 reduces W-2 Box 1" },
  Roth401k:        { label: "401(k) Roth",        defaultMethod: "PercentOfGross", defaultFreq: "BiWeekly", defaultPreTax: false, defaultEmployer: false, hint: "After-tax \u2014 does not reduce taxable wages" },
  HSA:             { label: "HSA",                defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: false, hint: "\u00a7106/125 \u00b7 pre-tax" },
  FSA:             { label: "FSA",                defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: false, hint: "\u00a7125 \u00b7 pre-tax" },
  Other:           { label: "Other",              defaultMethod: "FixedAmount",    defaultFreq: "Monthly",  defaultPreTax: false, defaultEmployer: false, hint: "" },
};

const VOLUNTARY_TYPES = Object.keys(TYPE_CONFIGS) as DeductionType[];

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "Single",                  label: "Single" },
  { value: "MarriedFilingJointly",    label: "Married Filing Jointly" },
  { value: "MarriedFilingSeparately", label: "Married Filing Separately" },
  { value: "HeadOfHousehold",         label: "Head of Household" },
];

const DEDUCTION_FREQUENCIES = [
  { value: "Weekly",       label: "Weekly" },
  { value: "BiWeekly",     label: "Bi-Weekly" },
  { value: "Monthly",      label: "Monthly" },
  { value: "Quarterly",    label: "Quarterly" },
  { value: "SemiAnnually", label: "Semi-Annually" },
  { value: "Annually",     label: "Annually" },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const fieldStyle: React.CSSProperties = {
  height: "40px", width: "100%",
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink)",
  
  padding: "0 12px",
  fontSize: "var(--ts-body-sm)",
  color: "var(--text)",
  outline: "none",
  fontFamily: "var(--ff-body)",
};

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--ink)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--ink-3)";
  e.currentTarget.style.boxShadow = "none";
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <span className="text-sm font-semibold text-ink-3 tracking-[0.02em]">{label}</span>
      {children}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ManageDeductionsModalProps {
  source: IncomeSource;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ManageDeductionsModal({ source, onClose }: ManageDeductionsModalProps) {
  const setTaxProfileMutation = useSetTaxProfile();
  const addDeductionMutation  = useAddDeduction();
  const removeDeductionMutation = useRemoveDeduction();

  const [activeTab, setActiveTab] = useState<"tax" | "deductions">("tax");

  // ── Tax profile state ─────────────────────────────────────────────────────
  const [taxEnabled, setTaxEnabled]               = useState(!!source.taxProfile);
  const [filingStatus, setFilingStatus]           = useState<FilingStatus>(source.taxProfile?.filingStatus ?? "Single");
  const [stateCode, setStateCode]                 = useState(source.taxProfile?.stateCode ?? "");

  // ── Add-deduction form state ──────────────────────────────────────────────
  const [addOpen, setAddOpen]         = useState(false);
  const [dType, setDType]             = useState<DeductionType>("HealthInsurance");
  const [dLabel, setDLabel]           = useState("");
  const [dMethod, setDMethod]         = useState<DeductionCalculationMethod>("FixedAmount");
  const [dValue, setDValue]           = useState("");
  const [dFreq, setDFreq]             = useState("BiWeekly");
  const [dEmployer, setDEmployer]     = useState(true);
  const [dPreTax, setDPreTax]         = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function applyTypeDefaults(type: DeductionType) {
    const cfg = TYPE_CONFIGS[type as string];
    if (!cfg) return;
    setDType(type);
    setDMethod(cfg.defaultMethod);
    setDFreq(cfg.defaultFreq);
    setDPreTax(cfg.defaultPreTax);
    setDEmployer(cfg.defaultEmployer);
  }

  const existingDeductions: PayrollDeduction[] = source.deductions ?? [];
  const deductionCount = existingDeductions.length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSaveTaxProfile() {
    if (!taxEnabled) {
      setTaxProfileMutation.mutate({ incomeId: source.incomeId, taxProfile: null });
      return;
    }
    const taxProfile: TaxWithholdingProfile = {
      filingStatus, stateCode: stateCode.toUpperCase(),
      federalAllowances: 0, stateAllowances: 0,
    };
    setTaxProfileMutation.mutate({ incomeId: source.incomeId, taxProfile });
  }

  function handleAddDeduction() {
    const val = parseFloat(dValue);
    if (!dValue || isNaN(val) || val <= 0) return;
    const cfg = TYPE_CONFIGS[dType as string];
    const label = dLabel.trim() || cfg?.label || dType;
    const deduction: PayrollDeduction = {
      type: dType, label,
      method: dMethod, value: val,
      isEmployerSponsored: dEmployer,
      frequency: dFreq,
      isTaxExempt: dPreTax,
    };
    addDeductionMutation.mutate({ incomeId: source.incomeId, deduction }, {
      onSuccess: () => {
        setDLabel(""); setDValue(""); setAddOpen(false); setAdvancedOpen(false);
        applyTypeDefaults(dType);
      },
    });
  }

  function handleRemove(type: string, label: string) {
    removeDeductionMutation.mutate({ incomeId: source.incomeId, type, label });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-sheet">

        {/* ── Drag handle (mobile) ── */}
        <div className="flex justify-center p-[10px_0_0]">
          <div className="w-[36px] h-2" style={{ background: "var(--border-2)" }} />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-[10px_20px_14px]">
          <div>
            <h2 className="font-serif font-bold text-md text-ink m-0">
              Manage Deductions
            </h2>
            <p className="text-base text-ink-3 mt-1">{source.source}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent cursor-pointer text-ink-3 p-3 leading-[0]" style={{ border: "none" }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Segmented tabs ── */}
        <div className="p-[0_20px_16px]" style={{ borderBottom: "1.5px solid var(--ink)" }}>
          <div className="seg-control">
            <button className={`seg-btn ${activeTab === "tax" ? "seg-btn-active" : "seg-btn-inactive"}`} onClick={() => setActiveTab("tax")}>
              Tax Withholding
            </button>
            <button className={`seg-btn ${activeTab === "deductions" ? "seg-btn-active" : "seg-btn-inactive"}`} onClick={() => setActiveTab("deductions")}>
              Deductions{deductionCount > 0 ? ` \u00b7 ${deductionCount}` : ""}
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="overflow-y-auto p-[20px_20px_28px] flex-1">

          {/* ═══════ TAX WITHHOLDING TAB ═══════ */}
          {activeTab === "tax" && (
            <div className="flex flex-col gap-8">

              {/* Enable toggle row */}
              <label className="flex items-center justify-between py-[12px] px-[14px] bg-paper-2 cursor-pointer" style={{ border: "1.5px solid var(--ink)" }}>
                <div>
                  <span className="text-base font-semibold text-ink">
                    Calculate tax withholding
                  </span>
                  <p className="text-sm text-ink-3 mt-1">
                    Estimates federal + state income tax deducted from your pay
                  </p>
                </div>
                {/* Toggle switch */}
                <div className="relative w-20 h-[22px] shrink-0 ml-6">
                  <input
                    type="checkbox" checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="absolute inset-0 opacity-[0] cursor-pointer w-full h-full z-[1] m-0"
                    aria-label="Enable tax withholding"
                  />
                  <div className="absolute inset-0" style={{ background: taxEnabled ? "var(--ink)" : "var(--paper-3)", transition: "background 150ms" }} />
                  <div className="absolute top-[3px] w-8 h-8 rounded-full bg-white" style={{ left: taxEnabled ? "21px" : "3px", transition: "left 150ms var(--ease-spring)", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
                </div>
              </label>

              {taxEnabled && (
                <>
                  <div className="form-grid-2">
                    <FieldGroup label="Filing Status">
                      <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as FilingStatus)} className="cursor-pointer" style={{ ...fieldStyle }} onFocus={onFocus} onBlur={onBlur}>
                        {FILING_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FieldGroup>

                    <FieldGroup label="State">
                      <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} className="cursor-pointer" style={{ ...fieldStyle }} onFocus={onFocus} onBlur={onBlur}>
                        <option value="">\u2014 None / no state income tax \u2014</option>
                        {US_STATES.map((s) => (
                          <option key={s.code} value={s.code}>{s.code} \u2013 {s.name}</option>
                        ))}
                      </select>
                    </FieldGroup>
                  </div>


                </>
              )}

              <button
                onClick={handleSaveTaxProfile}
                disabled={setTaxProfileMutation.isPending}
                className="p-[11px] text-base font-semibold" style={{ border: "none", background: taxEnabled ? "var(--ink)" : "var(--paper-3)", color: taxEnabled ? "#fff" : "var(--text-3)", cursor: setTaxProfileMutation.isPending ? "not-allowed" : "pointer", opacity: setTaxProfileMutation.isPending ? 0.7 : 1, transition: "background 150ms, color 150ms" }}
              >
                {setTaxProfileMutation.isPending ? "Saving\u2026" : taxEnabled ? "Save Tax Profile" : "Clear Tax Profile"}
              </button>

              {setTaxProfileMutation.isSuccess && (
                <p className="text-base text-green text-center">\u2713 Saved</p>
              )}
            </div>
          )}

          {/* ═══════ DEDUCTIONS TAB ═══════ */}
          {activeTab === "deductions" && (
            <div className="flex flex-col gap-5">

              {existingDeductions.length === 0 && !addOpen ? (
                <div className="py-[28px] px-[20px] text-center" style={{ border: "1.5px dashed var(--ink-3)" }}>
                  <p className="text-base text-ink-3 italic">No deductions added yet.</p>
                  <p className="text-sm text-ink-3 mt-2">401(k), health insurance, HSA, and more.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {existingDeductions.map((d, i) => (
                    <DeductionChip key={i} d={d} onRemove={handleRemove} removeDisabled={removeDeductionMutation.isPending} />
                  ))}
                </div>
              )}

              {!addOpen ? (
                <button
                  onClick={() => setAddOpen(true)}
                  className="flex items-center justify-center gap-3 p-[11px] bg-[rgba(178,42,26,0.10)] text-red text-base font-semibold cursor-pointer" style={{ border: "1px dashed var(--accent-border)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Deduction
                </button>
              ) : (
                <AddDeductionForm
                  dType={dType}              setDType={applyTypeDefaults}
                  dLabel={dLabel}            setDLabel={setDLabel}
                  dMethod={dMethod}          setDMethod={setDMethod}
                  dValue={dValue}            setDValue={setDValue}
                  dFreq={dFreq}              setDFreq={setDFreq}
                  dEmployer={dEmployer}      setDEmployer={setDEmployer}
                  dPreTax={dPreTax}          setDPreTax={setDPreTax}
                  advancedOpen={advancedOpen} setAdvancedOpen={setAdvancedOpen}
                  isPending={addDeductionMutation.isPending}
                  onAdd={handleAddDeduction}
                  onCancel={() => { setAddOpen(false); setAdvancedOpen(false); }}
                />
              )}

              {addDeductionMutation.isError && (
                <p className="text-base text-red">Failed to add deduction \u2014 please try again.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Deduction chip ─────────────────────────────────────────────────────────────
function DeductionChip({ d, onRemove, removeDisabled }: {
  d: PayrollDeduction;
  onRemove: (type: string, label: string) => void;
  removeDisabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIGS[d.type as string];

  return (
    <div className="bg-paper-2 overflow-hidden" style={{ border: "1.5px solid var(--ink)" }}>
      <div
        className="flex items-center justify-between py-[11px] px-[14px] cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-[7px] min-w-0">
          <span className="text-base font-semibold text-ink whitespace-nowrap overflow-hidden text-ellipsis">
            {d.label}
          </span>
          {d.isTaxExempt && (
            <span className="shrink-0 text-sm font-semibold py-[1px] px-[6px] bg-[rgba(178,42,26,0.10)] text-red">Pre-tax</span>
          )}
          {d.isEmployerSponsored && (
            <span className="shrink-0 text-sm font-semibold py-[1px] px-[6px] bg-[rgba(61,107,43,0.10)] text-green">Employer</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-base font-semibold text-ink-2">
            {d.method === "PercentOfGross" ? `${d.value}%` : `$${d.value.toFixed(2)}`}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="p-[0_14px_12px] flex flex-col gap-5" style={{ borderTop: "1.5px solid var(--ink)" }}>
          <div className="flex flex-wrap gap-3 pt-5">
            <DetailPill label="Type" value={cfg?.label ?? d.type} />
            <DetailPill label="Amount" value={d.method === "PercentOfGross" ? `${d.value}% of gross` : `$${d.value.toFixed(2)} fixed`} />
            <DetailPill label="Frequency" value={d.frequency ?? "Monthly"} />
            {cfg?.hint ? <DetailPill label="Tax treatment" value={cfg.hint} /> : null}
          </div>
          <button
            onClick={() => onRemove(d.type, d.label)}
            disabled={removeDisabled}
            className="flex items-center gap-3 py-[7px] px-[12px] bg-[rgba(178,42,26,0.10)] text-red text-base font-semibold self-start" style={{ border: "1px solid var(--danger-border)", cursor: removeDisabled ? "not-allowed" : "pointer", opacity: removeDisabled ? 0.5 : 1 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Remove Deduction
          </button>
        </div>
      )}
    </div>
  );
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-[3px] px-[10px] bg-paper-3 text-sm font-mono text-ink-2" style={{ border: "1.5px solid var(--ink)" }}>
      <span className="text-ink-3">{label}: </span>{value}
    </div>
  );
}

// ── Add deduction form ─────────────────────────────────────────────────────────
interface AddDeductionFormProps {
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

function AddDeductionForm({
  dType, setDType, dLabel, setDLabel, dMethod, setDMethod,
  dValue, setDValue, dFreq, setDFreq, dEmployer, setDEmployer,
  dPreTax, setDPreTax, advancedOpen, setAdvancedOpen,
  isPending, onAdd, onCancel,
}: AddDeductionFormProps) {
  const cfg = TYPE_CONFIGS[dType as string];
  const val = parseFloat(dValue);
  const canAdd = dValue && !isNaN(val) && val > 0;

  return (
    <div className="bg-paper-2 p-8 flex flex-col gap-[14px]" style={{ border: "1px solid var(--accent-border)" }}>

      {/* Type (full-width, prominent) */}
      <FieldGroup label="Type">
        <select value={dType} onChange={(e) => setDType(e.target.value as DeductionType)} className="cursor-pointer" style={{ ...fieldStyle }} onFocus={onFocus} onBlur={onBlur}>
          {VOLUNTARY_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_CONFIGS[t as string]?.label ?? t}</option>
          ))}
        </select>
        {cfg?.hint ? <span className="text-sm text-red mt-[1px]">{cfg.hint}</span> : null}
      </FieldGroup>

      {/* Label (optional) */}
      <FieldGroup label="Label (optional)">
        <input type="text" value={dLabel} onChange={(e) => setDLabel(e.target.value)}
          placeholder={`e.g. ${cfg?.label ?? "Custom deduction"}`}
          style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
        />
      </FieldGroup>

      {/* Amount / Frequency / Method — 3-up auto-fit grid (stacks on narrow screens) */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
        <FieldGroup label={dMethod === "PercentOfGross" ? "Percentage" : "Amount ($)"}>
          <input type="number" min={0} step="0.01" value={dValue} onChange={(e) => setDValue(e.target.value)}
            placeholder={dMethod === "PercentOfGross" ? "e.g. 6" : "e.g. 214.00"}
            style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
          />
        </FieldGroup>
        <FieldGroup label="Frequency">
          <select value={dFreq} onChange={(e) => setDFreq(e.target.value)} className="cursor-pointer" style={{ ...fieldStyle }} onFocus={onFocus} onBlur={onBlur}>
            {DEDUCTION_FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Method">
          <select value={dMethod} onChange={(e) => setDMethod(e.target.value as DeductionCalculationMethod)} className="cursor-pointer" style={{ ...fieldStyle }} onFocus={onFocus} onBlur={onBlur}>
            <option value="FixedAmount">Fixed ($)</option>
            <option value="PercentOfGross">% of Gross</option>
          </select>
        </FieldGroup>
      </div>

      {/* Advanced (employer / pre-tax) — collapsed by default */}
      <div className="overflow-hidden" style={{ border: "1.5px solid var(--ink)" }}>
        <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between py-[9px] px-[12px] bg-transparent cursor-pointer" style={{ border: "none" }}
        >
          <span className="text-base font-semibold text-ink-3">Advanced</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 180ms" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {advancedOpen && (
          <div className="p-[0_12px_12px] flex flex-col gap-5" style={{ borderTop: "1.5px solid var(--ink)" }}>
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
        <button type="button" onClick={onCancel}
          className="flex-1 p-[11px] bg-transparent text-ink-2 text-base font-semibold cursor-pointer" style={{ border: "1.5px solid var(--ink)" }}
        >
          Cancel
        </button>
        <button type="button" onClick={onAdd} disabled={isPending || !canAdd}
          className="p-[11px] text-base font-semibold" style={{ flex: 2, border: "none", background: canAdd && !isPending ? "var(--ink)" : "var(--paper-3)", color: canAdd && !isPending ? "#fff" : "var(--text-3)", cursor: isPending || !canAdd ? "not-allowed" : "pointer", transition: "background 150ms, color 150ms" }}
        >
          {isPending ? "Adding\u2026" : "Add Deduction"}
        </button>
      </div>
    </div>
  );
}

// ── Checkbox row ───────────────────────────────────────────────────────────────
function CheckRow({ label, hint, checked, onChange }: {
  label: string; hint: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-5 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-1 cursor-pointer w-[15px] h-[15px] shrink-0" style={{ accentColor: "var(--red)" }}
      />
      <div>
        <span className="text-base font-semibold text-ink-2 block">{label}</span>
        <span className="text-sm text-ink-3">{hint}</span>
      </div>
    </label>
  );
}
