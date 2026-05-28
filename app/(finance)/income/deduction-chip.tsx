"use client";

import { Btn, Icon } from "@/components/editorial";
import { useState } from "react";
import type { PayrollDeduction } from "@/types/deductions";
import { formatAmount } from "@/lib/formatting";
import { TYPE_CONFIGS } from "./deduction-config";

export function DeductionChip({
  d,
  onRemove,
  removeDisabled,
}: {
  d: PayrollDeduction;
  onRemove: (type: string, label: string) => void;
  removeDisabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIGS[d.type];

  return (
    <div className="overflow-hidden border-ink bg-paper-2">
      <div
        className="flex cursor-pointer items-center justify-between px-7 py-[11px]"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-ink">
            {d.label}
          </span>
          {d.isTaxExempt && (
            <span className="shrink-0 bg-red-soft px-3 py-0.5 text-sm font-semibold text-red">
              Pre-tax
            </span>
          )}
          {d.isEmployerSponsored && (
            <span className="shrink-0 bg-green-soft px-3 py-0.5 text-sm font-semibold text-green">
              Employer
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-base font-semibold text-ink-2">
            {d.method === "PercentOfGross" ? `${d.value}%` : `$${formatAmount(d.value)}`}
          </span>
          <span
            className={`inline-flex text-ink-3 transition-transform duration-200${expanded ? "rotate-180" : ""}`}
          >
            <Icon name="chevDown" size={12} strokeWidth={2.5} />
          </span>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-5 border-t border-ink p-[0_14px_12px]">
          <div className="flex flex-wrap gap-3 pt-5">
            <DetailPill label="Type" value={cfg?.label ?? d.type} />
            <DetailPill
              label="Amount"
              value={
                d.method === "PercentOfGross"
                  ? `${d.value}% of gross`
                  : `$${formatAmount(d.value)} fixed`
              }
            />
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

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-ink bg-paper-3 px-5 py-1.5 font-mono text-sm text-ink-2">
      <span className="text-ink-3">{label}: </span>
      {value}
    </div>
  );
}
