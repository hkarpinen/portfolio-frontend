"use client";

import { useState } from "react";
import { useSetTaxProfile, useAddDeduction, useRemoveDeduction } from "@/hooks/use-income";
import type {
  IncomeSource, TaxWithholdingProfile, PayrollDeduction,
  DeductionType, DeductionCalculationMethod, FilingStatus,
} from "@/types/finance";
import {
  TYPE_CONFIGS, US_STATES, FILING_STATUS_OPTIONS,
} from "./deduction-config";
import { DeductionChip } from "./deduction-chip";
import { AddDeductionForm, FieldGroup } from "./add-deduction-form";
import { SelectField } from "@/components/editorial";
import { Icon } from "@/components/editorial/icon";
import { Btn } from "@/components/editorial/button";

interface ManageDeductionsModalProps {
  source: IncomeSource;
  onClose: () => void;
}

export function ManageDeductionsModal({ source, onClose }: ManageDeductionsModalProps) {
  const setTaxProfileMutation = useSetTaxProfile();
  const addDeductionMutation  = useAddDeduction();
  const removeDeductionMutation = useRemoveDeduction();

  const [activeTab, setActiveTab] = useState<"tax" | "deductions">("tax");

  const [taxEnabled, setTaxEnabled]     = useState(!!source.taxProfile);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(source.taxProfile?.filingStatus ?? "Single");
  const [stateCode, setStateCode]       = useState(source.taxProfile?.stateCode ?? "");

  const [addOpen, setAddOpen]           = useState(false);
  const [dType, setDType]               = useState<DeductionType>("HealthInsurance");
  const [dLabel, setDLabel]             = useState("");
  const [dMethod, setDMethod]           = useState<DeductionCalculationMethod>("FixedAmount");
  const [dValue, setDValue]             = useState("");
  const [dFreq, setDFreq]               = useState("BiWeekly");
  const [dEmployer, setDEmployer]       = useState(true);
  const [dPreTax, setDPreTax]           = useState(true);
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

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-sheet">

        <div className="flex justify-center p-[10px_0_0]">
          <div className="w-[36px] h-2 bg-[var(--border-2)]" />
        </div>

        <div className="flex items-center justify-between p-[10px_20px_14px]">
          <div>
            <h2 className="font-serif font-bold text-md text-ink m-0">Manage Deductions</h2>
            <p className="text-base text-ink-3 mt-1">{source.source}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent cursor-pointer text-ink-3 p-3 leading-[0] border-none"
            aria-label="Close"
          >
            <Icon name="x" size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-[0_20px_16px] border-b border-ink">
          <div className="seg-control">
            <button className={`seg-btn ${activeTab === "tax" ? "seg-btn-active" : "seg-btn-inactive"}`} onClick={() => setActiveTab("tax")}>
              Tax Withholding
            </button>
            <button className={`seg-btn ${activeTab === "deductions" ? "seg-btn-active" : "seg-btn-inactive"}`} onClick={() => setActiveTab("deductions")}>
              Deductions{deductionCount > 0 ? ` · ${deductionCount}` : ""}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-[20px_20px_28px] flex-1">

          {activeTab === "tax" && (
            <div className="flex flex-col gap-8">
              <label className="flex items-center justify-between py-[12px] px-[14px] bg-paper-2 cursor-pointer border-ink">
                <div>
                  <span className="text-base font-semibold text-ink">Calculate tax withholding</span>
                  <p className="text-sm text-ink-3 mt-1">
                    Estimates federal + state income tax deducted from your pay
                  </p>
                </div>
                <div className="relative w-20 h-[22px] shrink-0 ml-6">
                  <input
                    type="checkbox" checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="absolute inset-0 opacity-[0] cursor-pointer w-full h-full z-[1] m-0"
                    aria-label="Enable tax withholding"
                  />
                  <div className={`absolute inset-0 transition-[background] duration-150${taxEnabled ? " bg-ink" : " bg-paper-3"}`} />
                  {/* left position is dynamic; --ease-spring has no Tailwind equivalent */}
                  <div className={`absolute top-[3px] w-8 h-8 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]${taxEnabled ? " left-[21px]" : " left-[3px]"}`} style={{ transition: "left 150ms var(--ease-spring)" }} />
                </div>
              </label>

              {taxEnabled && (
                <div className="form-grid-2">
                  <FieldGroup label="Filing Status">
                    <SelectField id="filing-status" value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}>
                      {FILING_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </SelectField>
                  </FieldGroup>

                  <FieldGroup label="State">
                    <SelectField id="state-code" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
                      <option value="">— None / no state income tax —</option>
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>{s.code} – {s.name}</option>
                      ))}
                    </SelectField>
                  </FieldGroup>
                </div>
              )}

              <Btn
                variant={taxEnabled ? "primary" : "secondary"}
                onClick={handleSaveTaxProfile}
                disabled={setTaxProfileMutation.isPending}
                fullWidth
              >
                {setTaxProfileMutation.isPending ? "Saving…" : taxEnabled ? "Save Tax Profile" : "Clear Tax Profile"}
              </Btn>

              {setTaxProfileMutation.isSuccess && (
                <p className="text-base text-green text-center inline-flex items-center justify-center gap-[5px] w-full">
                  <Icon name="check" size={13} strokeWidth={2} /> Saved
                </p>
              )}
            </div>
          )}

          {activeTab === "deductions" && (
            <div className="flex flex-col gap-5">
              {existingDeductions.length === 0 && !addOpen ? (
                <div className="py-[28px] px-[20px] text-center border-[1.5px] border-dashed border-[var(--ink-3)]">
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
                <Btn
                  variant="outline"
                  onClick={() => setAddOpen(true)}
                  fullWidth
                  iconLeft={<Icon name="plus" size={14} strokeWidth={2.5} />}
                >
                  Add Deduction
                </Btn>
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
                <p className="text-base text-red">Failed to add deduction — please try again.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
