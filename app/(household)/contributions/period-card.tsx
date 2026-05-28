"use client";

import { Icon } from "@/components/editorial";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-media";
import type { AggregatedPeriod } from "@/lib/contributions";
import { ItemTableRow, StackedItemRow, tdMeta } from "./item-table-row";
import { usePeriodItems } from "./period-items";

import { formatAmount } from "@/lib/formatting";

type GranularityTab = "monthly" | "quarterly" | "yearly";

export { GranularityButton } from "./granularity-button";

export function PeriodCard({
  p,
  cardRef,
  granularity,
}: {
  p: AggregatedPeriod;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  granularity: GranularityTab;
}) {
  const [expanded, setExpanded] = useState(p.isCurrent);
  const isMobile = useIsMobile();
  const isMonthly = granularity === "monthly";

  const obligations = p.totalDue + p.personalBillsDue;
  const netOver = p.net < 0;
  const hasItems = p.contributions.length > 0 || p.personalBills.length > 0;
  const items = usePeriodItems(p, isMonthly);

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement> | undefined}
      className={`bg-paper overflow-hidden${p.isCurrent ? "[border:1px_solid_var(--red)]" : "border border-ink-3"}`}
      style={{
        boxShadow: p.isCurrent ? "var(--shadow-md)" : "var(--shadow-sm)",
      }} /* boxShadow uses CSS token — no Tailwind equivalent */
    >
      <PeriodCardHeader
        p={p}
        hasItems={hasItems}
        expanded={expanded}
        netOver={netOver}
        obligations={obligations}
        onToggle={() => hasItems && setExpanded((v) => !v)}
      />

      {expanded && hasItems && (
        <div className="border-ink-t">
          {isMobile ? (
            <div>
              {items.map((item, i) => (
                <StackedItemRow key={item.key} item={item} isLast={i === items.length - 1} />
              ))}
            </div>
          ) : (
            <PeriodCardTable items={items} isMonthly={isMonthly} />
          )}
        </div>
      )}
    </div>
  );
}

function PeriodCardHeader({
  p,
  hasItems,
  expanded,
  netOver,
  obligations,
  onToggle,
}: {
  p: AggregatedPeriod;
  hasItems: boolean;
  expanded: boolean;
  netOver: boolean;
  obligations: number;
  onToggle: () => void;
}) {
  return (
    <div
      role="button"
      onClick={onToggle}
      className={`flex flex-col gap-3 p-[13px_16px_13px_20px]${p.isCurrent ? "bg-[rgba(178,42,26,0.04)]" : ""}${hasItems ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <h3 className="m-0 whitespace-nowrap font-serif text-md font-bold text-ink">{p.label}</h3>
          {p.isCurrent && (
            <span className="shrink-0 bg-red-soft px-[7px] py-[1px] text-sm font-semibold text-red">
              Current
            </span>
          )}
        </div>
        {hasItems && (
          <span
            className={`inline-flex shrink-0 text-ink-3 transition-transform duration-200${expanded ? "rotate-180" : ""}`}
          >
            <Icon name="chevDown" size={14} strokeWidth={2.5} />
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-[6px] text-base text-ink-3">
        <span>
          Due <strong className="text-ink">${formatAmount(obligations)}</strong>
        </span>
        <span>
          Net income <strong className="text-ink">${formatAmount(p.projectedNetIncome)}</strong>
        </span>
        <span
          className={`whitespace-nowrap font-serif text-base font-bold ${netOver ? "text-red" : "text-green"}`}
        >
          {netOver ? "−" : "+"}${formatAmount(Math.abs(p.net))}
        </span>
        {p.disposableIncome != null && (
          <span className="inline-flex items-center gap-2">
            {p.disposableIncomeSource === "balance" ? "Available now" : "Disposable"}{" "}
            <strong
              className={`font-serif font-bold ${p.disposableIncome < 0 ? "text-red" : "text-ink"}`}
            >
              {p.disposableIncome < 0 ? "−" : "+"}${Math.abs(p.disposableIncome).toFixed(0)}
            </strong>
          </span>
        )}
      </div>
    </div>
  );
}

function PeriodCardTable({
  items,
  isMonthly,
}: {
  items: ReturnType<typeof usePeriodItems>;
  isMonthly: boolean;
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-paper-2">
          <th
            className="border-ink-b w-[44px] pl-10 pr-4 text-right text-sm font-bold uppercase tracking-[0.08em] text-ink-3"
            style={{ ...tdMeta }}
          >
            {isMonthly ? "Day" : ""}
          </th>
          <th
            className="border-ink-b text-sm font-bold uppercase tracking-[0.08em] text-ink-3"
            style={{ ...tdMeta }}
          >
            Name
          </th>
          <th
            className="border-ink-b text-sm font-bold uppercase tracking-[0.08em] text-ink-3"
            style={{ ...tdMeta }}
          >
            Type
          </th>
          <th
            className="border-ink-b pr-6 text-right text-sm font-bold uppercase tracking-[0.08em] text-ink-3"
            style={{ ...tdMeta }}
          >
            Amount
          </th>
          {isMonthly && (
            <th
              className="border-ink-b w-[110px] pr-8 text-right text-sm font-bold uppercase tracking-[0.08em] text-ink-3"
              style={{ ...tdMeta }}
            >
              Paid
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <ItemTableRow key={item.key} item={item} isLast={i === items.length - 1} />
        ))}
      </tbody>
    </table>
  );
}
