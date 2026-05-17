"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { ContributionItem, PersonalBillItem, ContributionPeriodSummary } from "@/types/finance";
import { usePayExpense, useUnpayExpense } from "@/hooks/use-expenses";
import { usePayContributionSplit, useUnpayContributionSplit } from "@/hooks/use-expenses";

type GranularityTab = "monthly" | "quarterly" | "yearly";

// ─── Mobile detection ────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return mobile;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AggregatedPeriod {
  label: string;
  periodStart: string;
  totalDue: number;
  totalPaid: number;
  personalBillsDue: number;
  projectedNetIncome: number;
  net: number;
  contributions: ContributionItem[];
  personalBills: PersonalBillItem[];
  isCurrent: boolean;
  disposableIncome: number | null;
  disposableIncomeSource: "balance" | "estimate" | null;
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

const nowKey = () => new Date().toISOString().slice(0, 7);

function emptyBucket(label: string, periodStart: string): AggregatedPeriod {
  return { label, periodStart, totalDue: 0, totalPaid: 0, personalBillsDue: 0,
           projectedNetIncome: 0, net: 0, contributions: [], personalBills: [], isCurrent: false,
           disposableIncome: null, disposableIncomeSource: null };
}

function mergeBucket(b: AggregatedPeriod, m: ContributionPeriodSummary, nk: string) {
  b.totalDue         += m.totalDue;
  b.totalPaid        += m.totalPaid;
  b.personalBillsDue    += m.personalBillsDue ?? 0;
  b.projectedNetIncome  += m.projectedNetIncome ?? m.projectedIncome;
  b.net                 += m.disposableIncome ?? (m.projectedNetIncome - m.totalDue - (m.personalBillsDue ?? 0));
  b.contributions.push(...m.contributions);
  b.personalBills.push(...(m.personalBills ?? []));
  if (m.periodStart.slice(0, 7) === nk) b.isCurrent = true;
  // For aggregated view: if any constituent month has real balance data, prefer "balance".
  if (m.disposableIncome != null) {
    b.disposableIncome = (b.disposableIncome ?? 0) + m.disposableIncome;
    if (b.disposableIncomeSource !== "balance")
      b.disposableIncomeSource = m.disposableIncomeSource ?? "estimate";
  }
}

function aggregateByYear(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const map = new Map<number, AggregatedPeriod>();
  const nk = nowKey();
  for (const m of months) {
    const y = new Date(m.periodStart).getUTCFullYear();
    if (!map.has(y)) map.set(y, emptyBucket(String(y), `${y}-01-01`));
    mergeBucket(map.get(y)!, m, nk);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

function aggregateByQuarter(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const map = new Map<string, AggregatedPeriod>();
  const nk = nowKey();
  for (const m of months) {
    const d = new Date(m.periodStart);
    const y = d.getUTCFullYear();
    const q = Math.floor(d.getUTCMonth() / 3) + 1;
    const key = `${y}-Q${q}`;
    if (!map.has(key)) map.set(key, emptyBucket(`Q${q} ${y}`, `${y}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`));
    mergeBucket(map.get(key)!, m, nk);
  }
  return [...map.values()];
}

function toMonthlyPeriods(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const nk = nowKey();
  return months.map((m) => ({
    label:           m.periodLabel,
    periodStart:     m.periodStart,
    totalDue:        m.totalDue,
    totalPaid:       m.totalPaid,
    personalBillsDue: m.personalBillsDue ?? 0,
    projectedNetIncome: m.projectedNetIncome ?? m.projectedIncome,
    net:               m.disposableIncome ?? (m.projectedNetIncome - m.totalDue - (m.personalBillsDue ?? 0)),
    contributions:   m.contributions,
    personalBills:   m.personalBills ?? [],
    isCurrent:       m.periodStart.slice(0, 7) === nk,
    disposableIncome: m.disposableIncome ?? null,
    disposableIncomeSource: m.disposableIncomeSource ?? null,
  }));
}

function sortPeriods(periods: AggregatedPeriod[]): AggregatedPeriod[] {
  const nowMs = Date.now();
  return [...periods].sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    const aMs = new Date(a.periodStart).getTime();
    const bMs = new Date(b.periodStart).getTime();
    const aFuture = aMs > nowMs;
    const bFuture = bMs > nowMs;
    if (aFuture && bFuture) return aMs - bMs;
    if (!aFuture && !bFuture) return bMs - aMs;
    return aFuture ? -1 : 1;
  });
}

// ─── Pay toggle ───────────────────────────────────────────────────────────────

function PayToggle({ paid, pending, onToggle }: {
  paid: boolean;
  pending: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onToggle}
      className="py-[2px] px-[9px] text-sm font-semibold shrink-0" style={{ cursor: pending ? "default" : "pointer", background: paid ? "var(--success-s)" : "var(--paper-3)", border: `1px solid ${paid ? "var(--success)" : "var(--ink-3)"}`, color: paid ? "var(--success)" : "var(--text-3)", transition: "all 110ms", opacity: pending ? 0.5 : 1 }}
    >
      {paid ? "Paid" : "Mark paid"}
    </button>
  );
}

// ─── Table rows ───────────────────────────────────────────────────────────────

const tdBase: React.CSSProperties = {
  padding: "9px 10px",
  fontSize: "var(--ts-body-sm)",
  color: "var(--text)",
  borderBottom: "1.5px solid var(--ink)",
  verticalAlign: "middle",
};

const tdMeta: React.CSSProperties = {
  ...tdBase,
  fontSize: "var(--ts-label)",
  color: "var(--text-3)",
  whiteSpace: "nowrap",
};

interface TableItem {
  key: string;
  dayLabel: string;
  name: React.ReactNode;
  type: "Shared" | "Personal";
  amount: string;
  currency: string;
  paid?: boolean;
  count?: number;           // aggregated only
  payToggle?: React.ReactNode;
}

function ItemTableRow({ item, isLast }: { item: TableItem; isLast: boolean }) {
  const lastStyle = isLast ? { borderBottom: "none" } : {};
  return (
    <tr>
      <td className="pl-10 pr-4 w-[44px] text-right" style={{ ...tdMeta, ...lastStyle }}>{item.dayLabel}</td>
      <td className="font-semibold" style={{ ...tdBase, ...lastStyle }}>{item.name}</td>
      <td style={{ ...tdMeta, ...lastStyle }}>
        <span className="inline-block py-[1px] px-[7px] text-sm font-mono" style={{ background: item.type === "Shared" ? "rgba(178,42,26,0.08)" : "var(--paper-3)", color: item.type === "Shared" ? "var(--red)" : "var(--text-3)", border: `1px solid ${item.type === "Shared" ? "rgba(178,42,26,0.3)" : "var(--ink-3)"}` }}>
          {item.type}
        </span>
      </td>
      <td className="font-serif font-bold text-right whitespace-nowrap pr-6" style={{ ...tdBase, ...lastStyle }}>
        {item.count !== undefined && item.count > 1
          ? <><span className="text-sm font-mono font-normal text-ink-3 mr-[5px]">{item.currency}</span>{item.amount} <span className="text-sm font-medium text-ink-3">×{item.count}</span></>
          : <><span className="text-sm font-mono font-normal text-ink-3 mr-[5px]">{item.currency}</span>{item.amount}</>
        }
      </td>
      {item.payToggle !== undefined && (
        <td className="text-right pr-8 w-[110px] whitespace-nowrap" style={{ ...tdBase, ...lastStyle }}>
          {item.payToggle}
        </td>
      )}
    </tr>
  );
}

function StackedItemRow({ item, isLast }: { item: TableItem; isLast: boolean }) {
  return (
    <div className="flex items-start justify-between gap-5 py-[11px] px-[16px]" style={{ borderBottom: isLast ? "none" : "1.5px solid var(--ink)" }}>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base text-ink overflow-hidden text-ellipsis whitespace-nowrap">
          {item.name}
        </div>
        <div className="flex items-center gap-3 mt-[3px] flex-wrap">
          {item.dayLabel !== "—" && (
            <span className="text-sm text-ink-3">Day {item.dayLabel}</span>
          )}
          <span className="inline-block py-0 px-3 text-sm font-mono" style={{ background: item.type === "Shared" ? "rgba(178,42,26,0.08)" : "var(--paper-3)", color: item.type === "Shared" ? "var(--red)" : "var(--text-3)", border: `1px solid ${item.type === "Shared" ? "rgba(178,42,26,0.3)" : "var(--ink-3)"}` }}>
            {item.type}
          </span>
          {item.count !== undefined && item.count > 1 && (
            <span className="text-sm text-ink-3">×{item.count}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-[5px] shrink-0">
        <span className="font-serif font-bold text-base text-ink whitespace-nowrap">
          <span className="text-sm font-mono font-normal text-ink-3 mr-[5px]">{item.currency}</span>{item.amount}
        </span>
        {item.payToggle}
      </div>
    </div>
  );
}

// ─── Period section ───────────────────────────────────────────────────────────

function PeriodCard({ p, cardRef, granularity }: {
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

  const isMonthly  = granularity === "monthly";
  const obligations = p.totalDue + p.personalBillsDue;
  const netOver     = p.net < 0;
  const hasItems    = p.contributions.length > 0 || p.personalBills.length > 0;

  // Build unified sorted item list
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
          <Link
            href={`/bills/${c.groupId ?? c.householdId}/expenses/${c.billId}`}
            className="text-ink no-underline"
            onClick={(e) => e.stopPropagation()}
          >
            {c.billTitle}
            <span className="font-normal text-base text-ink-3 ml-3">
              {c.householdName}
            </span>
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
    // Sort by day
    items.sort((a, b) => Number(a.dayLabel) - Number(b.dayLabel));
  } else {
    // Aggregated: collapse by id
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
          <Link
            href={`/bills/${c.groupId ?? c.householdId}/expenses/${c.billId}`}
            className="text-ink no-underline"
          >
            {c.billTitle}
            <span className="font-normal text-base text-ink-3 ml-3">
              {c.householdName}
            </span>
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
      className="bg-paper overflow-hidden" style={{ border: `1px solid ${p.isCurrent ? "var(--red)" : "var(--ink-3)"}`, boxShadow: p.isCurrent ? "var(--shadow-md)" : "var(--shadow-sm)" }}
    >
      {/* Clickable header */}
      <div
        role="button"
        onClick={() => hasItems && setExpanded((v) => !v)}
        className="flex flex-col gap-3 p-[13px_16px_13px_20px]" style={{ cursor: hasItems ? "pointer" : "default", background: p.isCurrent ? "rgba(178,42,26,0.04)" : "transparent" }}
      >
        {/* Row 1: label + chevron */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <h3 className="font-serif font-bold text-md text-ink m-0 whitespace-nowrap">
              {p.label}
            </h3>
            {p.isCurrent && (
              <span className="bg-[rgba(178,42,26,0.10)] text-red py-[1px] px-[7px] text-sm font-semibold shrink-0">
                Current
              </span>
            )}
          </div>
          {hasItems && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
        {/* Row 2: stats — wraps naturally on narrow screens */}
        <div className="flex items-center flex-wrap gap-x-5 gap-y-[6px] text-base text-ink-3">
          <span>Due <strong className="text-ink">${obligations.toFixed(2)}</strong></span>
          <span>Net income <strong className="text-ink">${p.projectedNetIncome.toFixed(2)}</strong></span>
          <span className="font-serif font-bold text-base whitespace-nowrap" style={{ color: netOver ? "var(--danger)" : "var(--success)" }}>
            {netOver ? "−" : "+"}${Math.abs(p.net).toFixed(2)}
          </span>
          {p.disposableIncome != null && (
            <span className="inline-flex items-center gap-2">
              {p.disposableIncomeSource === "balance" ? "Available now" : "Disposable"}
              {" "}
              <strong className="font-serif font-bold" style={{ color: p.disposableIncome < 0 ? "var(--danger)" : "var(--ink)" }}>
                {p.disposableIncome < 0 ? "−" : "+"}${Math.abs(p.disposableIncome).toFixed(0)}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Expandable body */}
      {expanded && hasItems && (
        <div style={{ borderTop: "1.5px solid var(--ink)" }}>
          {isMobile ? (
            // Stacked list for mobile
            <div>
              {items.map((item, i) => (
                <StackedItemRow key={item.key} item={item} isLast={i === items.length - 1} />
              ))}
            </div>
          ) : (
            // Table for desktop
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="bg-paper-2">
                  <th className="pl-10 pr-4 font-bold text-sm uppercase tracking-[0.08em] text-ink-3 w-[44px] text-right" style={{ ...tdMeta, borderBottom: "1.5px solid var(--ink)" }}>
                    {isMonthly ? "Day" : ""}
                  </th>
                  <th className="font-bold text-sm uppercase tracking-[0.08em] text-ink-3" style={{ ...tdMeta, borderBottom: "1.5px solid var(--ink)" }}>
                    Name
                  </th>
                  <th className="font-bold text-sm uppercase tracking-[0.08em] text-ink-3" style={{ ...tdMeta, borderBottom: "1.5px solid var(--ink)" }}>
                    Type
                  </th>
                  <th className="font-bold text-sm uppercase tracking-[0.08em] text-ink-3 text-right pr-6" style={{ ...tdMeta, borderBottom: "1.5px solid var(--ink)" }}>
                    Amount
                  </th>
                  {isMonthly && (
                    <th className="font-bold text-sm uppercase tracking-[0.08em] text-ink-3 text-right pr-8 w-[110px]" style={{ ...tdMeta, borderBottom: "1.5px solid var(--ink)" }}>
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
          )}
        </div>
      )}
    </div>
  );
}
// ─── Granularity button ───────────────────────────────────────────────────────

function GranularityButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-[6px] px-[14px] text-base cursor-pointer" style={{ fontWeight: active ? 700 : 500, transition: "all 110ms", border: active ? "1.5px solid var(--red)" : "1.5px solid var(--ink)", background: active ? "rgba(178,42,26,0.08)" : "var(--paper-2)", color: active ? "var(--red)" : "var(--text-3)" }}
    >
      {label}
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function BudgetView({ months: initialMonths }: { months: ContributionPeriodSummary[] }) {
  const [granularity, setGranularity] = useState<GranularityTab>("monthly");
  const months = initialMonths;
  const currentRef = useRef<HTMLDivElement>(null);

  const rawPeriods =
    granularity === "yearly"      ? aggregateByYear(months)
    : granularity === "quarterly" ? aggregateByQuarter(months)
    : toMonthlyPeriods(months);

  const periods = sortPeriods(rawPeriods);
  const current = periods.find((p) => p.isCurrent);

  // Scroll current card into view whenever granularity changes
  useEffect(() => {
    const el = currentRef.current;
    if (!el) return;
    const id = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity]);

  const obligations = (current?.totalDue ?? 0) + (current?.personalBillsDue ?? 0);
  const income      = current?.projectedNetIncome ?? 0;
  const net         = current?.net ?? 0;
  const netOver     = net < 0;

  return (
    <div className="flex flex-col gap-12">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {([ "monthly", "quarterly", "yearly"] as GranularityTab[]).map((g) => (
          <GranularityButton
            key={g}
            label={g.charAt(0).toUpperCase() + g.slice(1)}
            active={granularity === g}
            onClick={() => setGranularity(g)}
          />
        ))}
      </div>

      {/* Cards — keyed on granularity so PeriodCard state resets on tab switch */}
      <div key={granularity} className="flex flex-col gap-[14px]">
        {periods.map((p) => (
          <PeriodCard key={p.label} p={p} cardRef={p.isCurrent ? currentRef : undefined} granularity={granularity} />
        ))}
      </div>
    </div>
  );
}
