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
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "0 12px",
  fontSize: "13px",
  color: "var(--text)",
  outline: "none",
  fontFamily: "var(--ff-body)",
};

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--accent)";
  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--border)";
  e.currentTarget.style.boxShadow = "none";
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-3)", letterSpacing: "0.02em" }}>{label}</span>
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
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "var(--border-2)" }} />
        </div>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px 14px",
        }}>
          <div>
            <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "16px", color: "var(--text)", margin: 0 }}>
              Manage Deductions
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>{source.source}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "6px", borderRadius: "8px", lineHeight: 0 }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Segmented tabs ── */}
        <div style={{ padding: "0 20px 16px", borderBottom: "1px solid var(--border)" }}>
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
        <div style={{ overflowY: "auto", padding: "20px 20px 28px", flex: 1 }}>

          {/* ═══════ TAX WITHHOLDING TAB ═══════ */}
          {activeTab === "tax" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Enable toggle row */}
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", borderRadius: "12px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                cursor: "pointer",
              }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>
                    Calculate tax withholding
                  </span>
                  <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>
                    Estimates federal + state income tax deducted from your pay
                  </p>
                </div>
                {/* Toggle switch */}
                <div style={{ position: "relative", width: "40px", height: "22px", flexShrink: 0, marginLeft: "12px" }}>
                  <input
                    type="checkbox" checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", zIndex: 1, margin: 0 }}
                    aria-label="Enable tax withholding"
                  />
                  <div style={{ position: "absolute", inset: 0, borderRadius: "11px", background: taxEnabled ? "var(--accent)" : "var(--surface-3)", transition: "background 150ms" }} />
                  <div style={{ position: "absolute", top: "3px", left: taxEnabled ? "21px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 150ms var(--ease-spring)", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
                </div>
              </label>

              {taxEnabled && (
                <>
                  <div className="form-grid-2">
                    <FieldGroup label="Filing Status">
                      <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as FilingStatus)} style={{ ...fieldStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                        {FILING_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FieldGroup>

                    <FieldGroup label="State">
                      <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
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
                style={{
                  padding: "11px", borderRadius: "12px", border: "none",
                  background: taxEnabled ? "var(--accent)" : "var(--surface-3)",
                  color: taxEnabled ? "#fff" : "var(--text-3)",
                  fontSize: "13px", fontWeight: "600",
                  cursor: setTaxProfileMutation.isPending ? "not-allowed" : "pointer",
                  opacity: setTaxProfileMutation.isPending ? 0.7 : 1,
                  transition: "background 150ms, color 150ms",
                }}
              >
                {setTaxProfileMutation.isPending ? "Saving\u2026" : taxEnabled ? "Save Tax Profile" : "Clear Tax Profile"}
              </button>

              {setTaxProfileMutation.isSuccess && (
                <p style={{ fontSize: "12px", color: "var(--success)", textAlign: "center" }}>\u2713 Saved</p>
              )}
            </div>
          )}

          {/* ═══════ DEDUCTIONS TAB ═══════ */}
          {activeTab === "deductions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              {existingDeductions.length === 0 && !addOpen ? (
                <div style={{ padding: "28px 20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "14px" }}>
                  <p style={{ fontSize: "13px", color: "var(--text-3)", fontStyle: "italic" }}>No deductions added yet.</p>
                  <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>401(k), health insurance, HSA, and more.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {existingDeductions.map((d, i) => (
                    <DeductionChip key={i} d={d} onRemove={handleRemove} removeDisabled={removeDeductionMutation.isPending} />
                  ))}
                </div>
              )}

              {!addOpen ? (
                <button
                  onClick={() => setAddOpen(true)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    padding: "11px", borderRadius: "12px",
                    border: "1px dashed var(--accent-border)",
                    background: "var(--accent-subtle)", color: "var(--accent)",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer",
                  }}
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
                <p style={{ fontSize: "12px", color: "var(--danger)" }}>Failed to add deduction \u2014 please try again.</p>
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
    <div style={{ borderRadius: "12px", background: "var(--surface-2)", border: "1px solid var(--border)", overflow: "hidden" }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", cursor: "pointer" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {d.label}
          </span>
          {d.isTaxExempt && (
            <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: "600", padding: "1px 6px", borderRadius: "9999px", background: "var(--accent-subtle)", color: "var(--accent)" }}>Pre-tax</span>
          )}
          {d.isEmployerSponsored && (
            <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: "600", padding: "1px 6px", borderRadius: "9999px", background: "var(--success-s)", color: "var(--success)" }}>Employer</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-2)" }}>
            {d.method === "PercentOfGross" ? `${d.value}%` : `$${d.value.toFixed(2)}`}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingTop: "10px" }}>
            <DetailPill label="Type" value={cfg?.label ?? d.type} />
            <DetailPill label="Amount" value={d.method === "PercentOfGross" ? `${d.value}% of gross` : `$${d.value.toFixed(2)} fixed`} />
            <DetailPill label="Frequency" value={d.frequency ?? "Monthly"} />
            {cfg?.hint ? <DetailPill label="Tax treatment" value={cfg.hint} /> : null}
          </div>
          <button
            onClick={() => onRemove(d.type, d.label)}
            disabled={removeDisabled}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 12px", borderRadius: "8px",
              border: "1px solid var(--danger-border)", background: "var(--danger-s)", color: "var(--danger)",
              fontSize: "12px", fontWeight: "600",
              cursor: removeDisabled ? "not-allowed" : "pointer",
              alignSelf: "flex-start", opacity: removeDisabled ? 0.5 : 1,
            }}
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
    <div style={{ padding: "3px 10px", borderRadius: "9999px", background: "var(--surface-3)", border: "1px solid var(--border)", fontSize: "11px", color: "var(--text-2)" }}>
      <span style={{ color: "var(--text-3)" }}>{label}: </span>{value}
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
    <div style={{
      background: "var(--surface-2)", border: "1px solid var(--accent-border)",
      borderRadius: "14px", padding: "16px",
      display: "flex", flexDirection: "column", gap: "14px",
    }}>

      {/* Type (full-width, prominent) */}
      <FieldGroup label="Type">
        <select value={dType} onChange={(e) => setDType(e.target.value as DeductionType)} style={{ ...fieldStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
          {VOLUNTARY_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_CONFIGS[t as string]?.label ?? t}</option>
          ))}
        </select>
        {cfg?.hint ? <span style={{ fontSize: "11px", color: "var(--accent)", marginTop: "1px" }}>{cfg.hint}</span> : null}
      </FieldGroup>

      {/* Label (optional) */}
      <FieldGroup label="Label (optional)">
        <input type="text" value={dLabel} onChange={(e) => setDLabel(e.target.value)}
          placeholder={`e.g. ${cfg?.label ?? "Custom deduction"}`}
          style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
        />
      </FieldGroup>

      {/* Amount / Frequency / Method — 3-up auto-fit grid (stacks on narrow screens) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
        <FieldGroup label={dMethod === "PercentOfGross" ? "Percentage" : "Amount ($)"}>
          <input type="number" min={0} step="0.01" value={dValue} onChange={(e) => setDValue(e.target.value)}
            placeholder={dMethod === "PercentOfGross" ? "e.g. 6" : "e.g. 214.00"}
            style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
          />
        </FieldGroup>
        <FieldGroup label="Frequency">
          <select value={dFreq} onChange={(e) => setDFreq(e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
            {DEDUCTION_FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Method">
          <select value={dMethod} onChange={(e) => setDMethod(e.target.value as DeductionCalculationMethod)} style={{ ...fieldStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
            <option value="FixedAmount">Fixed ($)</option>
            <option value="PercentOfGross">% of Gross</option>
          </select>
        </FieldGroup>
      </div>

      {/* Advanced (employer / pre-tax) — collapsed by default */}
      <div style={{ borderRadius: "10px", border: "1px solid var(--border)", overflow: "hidden" }}>
        <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "none", border: "none", cursor: "pointer" }}
        >
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-3)" }}>Advanced</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 180ms" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {advancedOpen && (
          <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: "11px", color: "var(--text-3)", paddingTop: "10px", lineHeight: 1.5 }}>
              Auto-set from type. Override only if your plan is non-standard.
            </p>
            <CheckRow label="Pre-tax deduction" hint="Reduces federal + state taxable wages (W-2 Box 1)" checked={dPreTax} onChange={setDPreTax} />
            <CheckRow label="Employer-sponsored" hint="Part of an employer benefit plan" checked={dEmployer} onChange={setDEmployer} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" onClick={onCancel}
          style={{ flex: 1, padding: "11px", borderRadius: "12px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
        >
          Cancel
        </button>
        <button type="button" onClick={onAdd} disabled={isPending || !canAdd}
          style={{
            flex: 2, padding: "11px", borderRadius: "12px", border: "none",
            background: canAdd && !isPending ? "var(--accent)" : "var(--surface-3)",
            color: canAdd && !isPending ? "#fff" : "var(--text-3)",
            fontSize: "13px", fontWeight: "600",
            cursor: isPending || !canAdd ? "not-allowed" : "pointer",
            transition: "background 150ms, color 150ms",
          }}
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
    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: "2px", cursor: "pointer", accentColor: "var(--accent)", width: "15px", height: "15px", flexShrink: 0 }}
      />
      <div>
        <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-2)", display: "block" }}>{label}</span>
        <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{hint}</span>
      </div>
    </label>
  );
}
