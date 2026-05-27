"use client";

import { useState } from "react";
import type { PayrollDeduction } from "@/types/finance";
import { formatAmount } from "@/lib/formatting";
import { TYPE_CONFIGS } from "./deduction-config";
import { Icon } from "@/components/editorial/icon";
import { Btn } from "@/components/editorial/button";

export function DeductionChip({ d, onRemove, removeDisabled }: {
  d: PayrollDeduction;
  onRemove: (type: string, label: string) => void;
  removeDisabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIGS[d.type as string];

  return (
    <div className="bg-paper-2 overflow-hidden border-ink">
      <div
        className="flex items-center justify-between py-[11px] px-[14px] cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-[7px] min-w-0">
          <span className="text-base font-semibold text-ink whitespace-nowrap overflow-hidden text-ellipsis">
            {d.label}
          </span>
          {d.isTaxExempt && (
            <span className="shrink-0 text-sm font-semibold py-[1px] px-[6px] bg-red-soft text-red">Pre-tax</span>
          )}
          {d.isEmployerSponsored && (
            <span className="shrink-0 text-sm font-semibold py-[1px] px-[6px] bg-green-soft text-green">Employer</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-base font-semibold text-ink-2">
            {d.method === "PercentOfGross" ? `${d.value}%` : `$${formatAmount(d.value)}`}
          </span>
          <span className={`inline-flex text-ink-3 transition-transform duration-200${expanded ? " rotate-180" : ""}`}>
            <Icon name="chevDown" size={12} strokeWidth={2.5} />
          </span>
        </div>
      </div>

      {expanded && (
        <div className="p-[0_14px_12px] flex flex-col gap-5 border-t border-ink">
          <div className="flex flex-wrap gap-3 pt-5">
            <DetailPill label="Type" value={cfg?.label ?? d.type} />
            <DetailPill label="Amount" value={d.method === "PercentOfGross" ? `${d.value}% of gross` : `$${formatAmount(d.value)} fixed`} />
            <DetailPill label="Frequency" value={d.frequency ?? "Monthly"} />
            {cfg?.hint ? <DetailPill label="Tax treatment" value={cfg.hint} /> : null}
          </div>
          <Btn
            variant="danger"
            size="sm"
            onClick={() => onRemove(d.type, d.label)}
            disabled={removeDisabled}
            iconLeft={<Icon name="trash" size={13} strokeWidth={2} />}
          >
            Remove Deduction
          </Btn>
        </div>
      )}
    </div>
  );
}

export function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-[3px] px-[10px] bg-paper-3 text-sm font-mono text-ink-2 border-ink">
      <span className="text-ink-3">{label}: </span>{value}
    </div>
  );
}
