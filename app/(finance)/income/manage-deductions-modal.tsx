"use client";

import { useState } from "react";
import type { IncomeSource } from "@/types/income";
import { Icon } from "@/components/editorial/icon";
import { TaxWithholdingTab } from "./tax-withholding-tab";
import { DeductionsTab } from "./deductions-tab";

interface ManageDeductionsModalProps {
  source: IncomeSource;
  onClose: () => void;
}

type Tab = "tax" | "deductions";

/**
 * Modal shell for the per-income-source tax + deductions editor.
 *
 * Two tabs, each fully self-contained in its own file:
 *   - <TaxWithholdingTab>  — federal/state filing profile
 *   - <DeductionsTab>      — voluntary deductions list + add form
 *
 * This file only owns: overlay click-out, header, tab selector chrome.
 * No income-domain state lives here.
 */
export function ManageDeductionsModal({ source, onClose }: ManageDeductionsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("tax");
  const deductionCount = source.deductions?.length ?? 0;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet">
        <div className="flex justify-center p-[10px_0_0]">
          <div className="h-2 w-[36px] bg-[var(--border-2)]" />
        </div>

        <div className="flex items-center justify-between p-[10px_20px_14px]">
          <div>
            <h2 className="m-0 font-serif text-md font-bold text-ink">Manage Deductions</h2>
            <p className="mt-1 text-base text-ink-3">{source.source}</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent p-3 leading-[0] text-ink-3"
            aria-label="Close"
          >
            <Icon name="x" size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="border-b border-ink p-[0_20px_16px]">
          <div className="seg-control">
            <button
              className={`seg-btn ${activeTab === "tax" ? "seg-btn-active" : "seg-btn-inactive"}`}
              onClick={() => setActiveTab("tax")}
            >
              Tax Withholding
            </button>
            <button
              className={`seg-btn ${activeTab === "deductions" ? "seg-btn-active" : "seg-btn-inactive"}`}
              onClick={() => setActiveTab("deductions")}
            >
              Deductions{deductionCount > 0 ? ` · ${deductionCount}` : ""}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-[20px_20px_28px]">
          {activeTab === "tax" ? (
            <TaxWithholdingTab source={source} />
          ) : (
            <DeductionsTab source={source} />
          )}
        </div>
      </div>
    </div>
  );
}
