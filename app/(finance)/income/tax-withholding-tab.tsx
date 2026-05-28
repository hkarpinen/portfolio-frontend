"use client";

import { Btn, Icon, SelectField } from "@/components/editorial";
import { useState } from "react";
import { useSetTaxProfile } from "@/hooks/use-income";
import type { IncomeSource } from "@/types/income";
import { FilingStatus, type TaxWithholdingProfile } from "@/types/tax";
import { parseEnum } from "@/lib/parse-enum";
import { US_STATES, FILING_STATUS_OPTIONS } from "./deduction-config";
import { FieldGroup } from "./add-deduction-form";

/**
 * Tax-withholding tab of ManageDeductionsModal. Owns the toggle / filing-
 * status / state-code form state and the save action. The parent just
 * decides which tab is visible.
 */
export function TaxWithholdingTab({ source }: { source: IncomeSource }) {
  const setTaxProfileMutation = useSetTaxProfile();
  const [taxEnabled, setTaxEnabled] = useState(!!source.taxProfile);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(
    source.taxProfile?.filingStatus ?? FilingStatus.Single,
  );
  const [stateCode, setStateCode] = useState(source.taxProfile?.stateCode ?? "");

  function handleSave() {
    if (!taxEnabled) {
      setTaxProfileMutation.mutate({ incomeId: source.incomeId, taxProfile: null });
      return;
    }
    const taxProfile: TaxWithholdingProfile = {
      filingStatus,
      stateCode: stateCode.toUpperCase(),
      federalAllowances: 0,
      stateAllowances: 0,
    };
    setTaxProfileMutation.mutate({ incomeId: source.incomeId, taxProfile });
  }

  return (
    <div className="flex flex-col gap-8">
      <label className="flex cursor-pointer items-center justify-between border-ink bg-paper-2 px-7 py-6">
        <div>
          <span className="text-base font-semibold text-ink">Calculate tax withholding</span>
          <p className="mt-1 text-sm text-ink-3">
            Estimates federal + state income tax deducted from your pay
          </p>
        </div>
        <div className="relative ml-6 h-[22px] w-20 shrink-0">
          <input
            type="checkbox"
            checked={taxEnabled}
            onChange={(e) => setTaxEnabled(e.target.checked)}
            className="absolute inset-0 z-base m-0 h-full w-full cursor-pointer opacity-[0]"
            aria-label="Enable tax withholding"
          />
          <div
            className={`absolute inset-0 transition-[background] duration-150${taxEnabled ? "bg-ink" : "bg-paper-3"}`}
          />
          {/* left position is dynamic; --ease-spring has no Tailwind equivalent */}
          <div
            className={`absolute top-1.5 h-8 w-8 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]${taxEnabled ? "left-[21px]" : "left-1.5"}`}
            style={{ transition: "left 150ms var(--ease-spring)" }}
          />
        </div>
      </label>

      {taxEnabled && (
        <div className="form-grid-2">
          <FieldGroup label="Filing Status">
            <SelectField
              id="filing-status"
              value={filingStatus}
              onChange={(e) =>
                setFilingStatus(parseEnum(FilingStatus, e.target.value, filingStatus))
              }
            >
              {FILING_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
          </FieldGroup>

          <FieldGroup label="State">
            <SelectField
              id="state-code"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
            >
              <option value="">— None / no state income tax —</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} – {s.name}
                </option>
              ))}
            </SelectField>
          </FieldGroup>
        </div>
      )}

      <Btn
        variant={taxEnabled ? "primary" : "secondary"}
        onClick={handleSave}
        disabled={setTaxProfileMutation.isPending}
        fullWidth
      >
        {setTaxProfileMutation.isPending
          ? "Saving…"
          : taxEnabled
            ? "Save Tax Profile"
            : "Clear Tax Profile"}
      </Btn>

      {setTaxProfileMutation.isSuccess && (
        <p className="inline-flex w-full items-center justify-center gap-[5px] text-center text-base text-green">
          <Icon name="check" size={13} strokeWidth={2} /> Saved
        </p>
      )}
    </div>
  );
}
