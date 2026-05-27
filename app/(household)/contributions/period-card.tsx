"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContributionItem, PersonalBillItem } from "@/types/finance";
import { usePayExpense, useUnpayExpense, usePayContributionSplit, useUnpayContributionSplit } from "@/hooks/use-expenses";
import { useIsMobile } from "@/hooks/use-media";
import type { AggregatedPeriod } from "@/lib/contributions";
import { PayToggle } from "./pay-toggle";
import { ItemTableRow, StackedItemRow, TableItem, tdMeta } from "./item-table-row";
import { Icon } from "@/components/editorial/icon";

type GranularityTab = "monthly" | "quarterly" | "yearly";

export function PeriodCard({ p, cardRef, granularity }: {
  p: AggregatedPeriod;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  granularity: GranularityTab;
}) {
  const [expanded, setExpanded] = useState(p.isCurrent);
  const isMobile = useIsMobile();

  const payExp     = usePayExpense();
  const unpayExp   = useUnpayExpense();
  const paySplit   = usePayContributionSplit();
  const unpaySplit = useUnpayContributionSplit();

  const isMonthly   = granularity === "monthly";
  const obligations = p.totalDue + p.personalBillsDue;
  const netOver     = p.net < 0;
  const hasItems    = p.contributions.length > 0 || p.personalBills.length > 0;

  const items: TableItem[] = [];

  if (isMonthly) {
    for (const c of p.contributions) {
      const due = new Date(c.dueDate);
      const pending =
        (paySplit.isPending   && paySplit.variables?.billId   === c.billId) ||
        (unpaySplit.isPending && unpaySplit.variables?.billId === c.billId);
      items.push({
        key: `s-${c.splitId}-${c.dueDate}`,
        dayLabel: String(due.getUTCDate()),
        name: (
          <Link href={`/household/${c.groupId ?? c.householdId}/expenses/${c.billId}`} className="text-ink no-underline" onClick={(e) => e.stopPropagation()}>
            {c.billTitle}
            <span className="font-normal text-base text-ink-3 ml-3">{c.householdName}</span>
          </Link>
        ),
        type: "Shared",
        amount: c.amount.toFixed(2),
        currency: c.currency,
        paid: c.isClaimed,
        payToggle: (
          <PayToggle
            paid={c.isClaimed}
            pending={pending}
            onToggle={(e) => {
              e.stopPropagation();
              if (c.isClaimed) unpaySplit.mutate({ householdId: c.groupId ?? c.householdId, billId: c.billId, occurrenceDate: c.dueDate });
              else             paySplit.mutate({   householdId: c.groupId ?? c.householdId, billId: c.billId, occurrenceDate: c.dueDate });
            }}
          />
        ),
      });
    }
    for (const pb of p.personalBills) {
      const due = new Date(pb.dueDate);
      const pending =
        (payExp.isPending   && payExp.variables?.id   === pb.expenseId) ||
        (unpayExp.isPending && unpayExp.variables?.id === pb.expenseId);
      items.push({
        key: `e-${pb.expenseId}-${pb.dueDate}`,
        dayLabel: String(due.getUTCDate()),
        name: pb.title,
        type: "Personal",
        amount: pb.amount.toFixed(2),
        currency: pb.currency,
        paid: pb.isPaid,
        payToggle: (
          <PayToggle
            paid={!!pb.isPaid}
            pending={pending}
            onToggle={(e) => {
              e.stopPropagation();
              if (pb.isPaid) unpayExp.mutate({ id: pb.expenseId, occurrenceDate: pb.dueDate });
              else           payExp.mutate({   id: pb.expenseId, occurrenceDate: pb.dueDate });
            }}
          />
        ),
      });
    }
    items.sort((a, b) => Number(a.dayLabel) - Number(b.dayLabel));
  } else {
    const splitMap = new Map<string, ContributionItem & { count: number }>();
    for (const c of p.contributions) {
      const ex = splitMap.get(c.splitId);
      if (ex) { ex.amount += c.amount; ex.count++; }
      else splitMap.set(c.splitId, { ...c, count: 1 });
    }
    for (const c of splitMap.values()) {
      items.push({
        key: `s-${c.splitId}`,
        dayLabel: "—",
        name: (
          <Link href={`/household/${c.groupId ?? c.householdId}/expenses/${c.billId}`} className="text-ink no-underline">
            {c.billTitle}
            <span className="font-normal text-base text-ink-3 ml-3">{c.householdName}</span>
          </Link>
        ),
        type: "Shared",
        amount: c.amount.toFixed(2),
        currency: c.currency,
        count: c.count,
      });
    }
    const expMap = new Map<string, PersonalBillItem & { count: number }>();
    for (const pb of p.personalBills) {
      const ex = expMap.get(pb.expenseId);
      if (ex) { ex.amount += pb.amount; ex.count++; }
      else expMap.set(pb.expenseId, { ...pb, count: 1 });
    }
    for (const pb of expMap.values()) {
      items.push({
        key: `e-${pb.expenseId}`,
        dayLabel: "—",
        name: pb.title,
        type: "Personal",
        amount: pb.amount.toFixed(2),
        currency: pb.currency,
        count: pb.count,
      });
    }
  }

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement> | undefined}
      className={`bg-paper overflow-hidden${p.isCurrent ? " [border:1px_solid_var(--red)]" : " border border-ink-3"}`}
      style={{ boxShadow: p.isCurrent ? "var(--shadow-md)" : "var(--shadow-sm)" }} /* boxShadow uses CSS token — no Tailwind equivalent */
    >
      <div
        role="button"
        onClick={() => hasItems && setExpanded((v) => !v)}
        className={`flex flex-col gap-3 p-[13px_16px_13px_20px]${p.isCurrent ? " bg-[rgba(178,42,26,0.04)]" : ""}${hasItems ? " cursor-pointer" : " cursor-default"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <h3 className="font-serif font-bold text-md text-ink m-0 whitespace-nowrap">{p.label}</h3>
            {p.isCurrent && (
              <span className="bg-red-soft text-red py-[1px] px-[7px] text-sm font-semibold shrink-0">Current</span>
            )}
          </div>
          {hasItems && (
            <span className={`shrink-0 inline-flex text-ink-3 transition-transform duration-200${expanded ? " rotate-180" : ""}`}>
              <Icon name="chevDown" size={14} strokeWidth={2.5} />
            </span>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-x-5 gap-y-[6px] text-base text-ink-3">
          <span>Due <strong className="text-ink">${obligations.toFixed(2)}</strong></span>
          <span>Net income <strong className="text-ink">${p.projectedNetIncome.toFixed(2)}</strong></span>
          <span className={`font-serif font-bold text-base whitespace-nowrap ${netOver ? "text-red" : "text-green"}`}>
            {netOver ? "−" : "+"}${Math.abs(p.net).toFixed(2)}
          </span>
          {p.disposableIncome != null && (
            <span className="inline-flex items-center gap-2">
              {p.disposableIncomeSource === "balance" ? "Available now" : "Disposable"}
              {" "}
              <strong className={`font-serif font-bold ${p.disposableIncome < 0 ? "text-red" : "text-ink"}`}>
                {p.disposableIncome < 0 ? "−" : "+"}${Math.abs(p.disposableIncome).toFixed(0)}
              </strong>
            </span>
          )}
        </div>
      </div>

      {expanded && hasItems && (
        <div className="border-ink-t">
          {isMobile ? (
            <div>
              {items.map((item, i) => (
                <StackedItemRow key={item.key} item={item} isLast={i === items.length - 1} />
              ))}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-paper-2">
                  <th className="pl-10 pr-4 font-bold text-sm uppercase tracking-[0.08em] text-ink-3 w-[44px] text-right border-ink-b" style={{ ...tdMeta }}>
                    {isMonthly ? "Day" : ""}
                  </th>
                  <th className="font-bold text-sm uppercase tracking-[0.08em] text-ink-3 border-ink-b" style={{ ...tdMeta }}>Name</th>
                  <th className="font-bold text-sm uppercase tracking-[0.08em] text-ink-3 border-ink-b" style={{ ...tdMeta }}>Type</th>
                  <th className="font-bold text-sm uppercase tracking-[0.08em] text-ink-3 text-right pr-6 border-ink-b" style={{ ...tdMeta }}>Amount</th>
                  {isMonthly && (
                    <th className="font-bold text-sm uppercase tracking-[0.08em] text-ink-3 text-right pr-8 w-[110px] border-ink-b" style={{ ...tdMeta }}>Paid</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <ItemTableRow key={item.key} item={item} isLast={i === items.length - 1} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function GranularityButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`py-[6px] px-[14px] text-base cursor-pointer transition-all duration-[110ms] ${active ? "font-bold text-red bg-red-soft [border:1.5px_solid_var(--red)]" : "font-medium text-ink-3 bg-paper-2 border-ink"}`}
    >
      {label}
    </button>
  );
}
