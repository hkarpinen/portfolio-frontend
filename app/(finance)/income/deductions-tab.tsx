"use client";

import { useState } from "react";
import { useAddDeduction, useRemoveDeduction } from "@/hooks/use-income";
import type { IncomeSource } from "@/types/income";
import {
  DeductionType,
  DeductionCalculationMethod,
  type PayrollDeduction,
} from "@/types/deductions";
import { Frequency } from "@/types/schedule";
import { TYPE_CONFIGS } from "./deduction-config";
import { DeductionChip } from "./deduction-chip";
import { AddDeductionForm } from "./add-deduction-form";
import { Icon } from "@/components/editorial/icon";
import { Btn } from "@/components/editorial/button";

/**
 * Deductions tab of ManageDeductionsModal. Owns the add-deduction form
 * state, the add/remove mutations, and the empty/populated split. The
 * `<AddDeductionForm>` sub-component is the shared editorial form widget;
 * here we just wire it up to the mutation pipeline.
 */
export function DeductionsTab({ source }: { source: IncomeSource }) {
  const addDeductionMutation = useAddDeduction();
  const removeDeductionMutation = useRemoveDeduction();

  const [addOpen, setAddOpen] = useState(false);
  const [dType, setDType] = useState<DeductionType>(DeductionType.HealthInsurance);
  const [dLabel, setDLabel] = useState("");
  const [dMethod, setDMethod] = useState<DeductionCalculationMethod>(
    DeductionCalculationMethod.FixedAmount,
  );
  const [dValue, setDValue] = useState("");
  const [dFreq, setDFreq] = useState<Frequency>(Frequency.BiWeekly);
  const [dEmployer, setDEmployer] = useState(true);
  const [dPreTax, setDPreTax] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function applyTypeDefaults(type: DeductionType) {
    const cfg = TYPE_CONFIGS[type];
    if (!cfg) return;
    setDType(type);
    setDMethod(cfg.defaultMethod);
    setDFreq(cfg.defaultFreq);
    setDPreTax(cfg.defaultPreTax);
    setDEmployer(cfg.defaultEmployer);
  }

  function handleAdd() {
    const val = parseFloat(dValue);
    if (!dValue || isNaN(val) || val <= 0) return;
    const cfg = TYPE_CONFIGS[dType];
    const label = dLabel.trim() || cfg?.label || dType;
    const deduction: PayrollDeduction = {
      type: dType,
      label,
      method: dMethod,
      value: val,
      isEmployerSponsored: dEmployer,
      frequency: dFreq,
      isTaxExempt: dPreTax,
    };
    addDeductionMutation.mutate(
      { incomeId: source.incomeId, deduction },
      {
        onSuccess: () => {
          setDLabel("");
          setDValue("");
          setAddOpen(false);
          setAdvancedOpen(false);
          applyTypeDefaults(dType);
        },
      },
    );
  }

  function handleRemove(type: string, label: string) {
    removeDeductionMutation.mutate({ incomeId: source.incomeId, type, label });
  }

  const existingDeductions: PayrollDeduction[] = source.deductions ?? [];

  return (
    <div className="flex flex-col gap-5">
      {existingDeductions.length === 0 && !addOpen ? (
        <div className="border-[1.5px] border-dashed border-ink-3 px-[20px] py-[28px] text-center">
          <p className="text-base italic text-ink-3">No deductions added yet.</p>
          <p className="mt-2 text-sm text-ink-3">401(k), health insurance, HSA, and more.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {existingDeductions.map((d, i) => (
            <DeductionChip
              key={i}
              d={d}
              onRemove={handleRemove}
              removeDisabled={removeDeductionMutation.isPending}
            />
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
          dType={dType}
          setDType={applyTypeDefaults}
          dLabel={dLabel}
          setDLabel={setDLabel}
          dMethod={dMethod}
          setDMethod={setDMethod}
          dValue={dValue}
          setDValue={setDValue}
          dFreq={dFreq}
          setDFreq={setDFreq}
          dEmployer={dEmployer}
          setDEmployer={setDEmployer}
          dPreTax={dPreTax}
          setDPreTax={setDPreTax}
          advancedOpen={advancedOpen}
          setAdvancedOpen={setAdvancedOpen}
          isPending={addDeductionMutation.isPending}
          onAdd={handleAdd}
          onCancel={() => {
            setAddOpen(false);
            setAdvancedOpen(false);
          }}
        />
      )}

      {addDeductionMutation.isError && (
        <p className="text-base text-red">Failed to add deduction — please try again.</p>
      )}
    </div>
  );
}
