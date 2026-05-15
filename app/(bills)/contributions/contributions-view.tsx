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
      style={{
        padding: "2px 9px", borderRadius: "9999px", fontSize: "var(--ts-meta)", fontWeight: 600,
        cursor: pending ? "default" : "pointer", flexShrink: 0,
        background: paid ? "var(--success-s)" : "var(--surface-3)",
        border: `1px solid ${paid ? "var(--success)" : "var(--border)"}`,
        color: paid ? "var(--success)" : "var(--text-3)",
        transition: "all 110ms",
        opacity: pending ? 0.5 : 1,
      }}
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
  borderBottom: "1px solid var(--border)",
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
      <td style={{ ...tdMeta, ...lastStyle, paddingLeft: "20px", paddingRight: "8px", width: "44px", textAlign: "right" }}>{item.dayLabel}</td>
      <td style={{ ...tdBase, ...lastStyle, fontWeight: 600 }}>{item.name}</td>
      <td style={{ ...tdMeta, ...lastStyle }}>
        <span style={{
          display: "inline-block", padding: "1px 7px", borderRadius: "9999px", fontSize: "var(--ts-meta)", fontWeight: 600,
          background: item.type === "Shared" ? "var(--accent-subtle)" : "var(--surface-3)",
          color: item.type === "Shared" ? "var(--accent)" : "var(--text-3)",
          border: `1px solid ${item.type === "Shared" ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "var(--border)"}`,
        }}>
          {item.type}
        </span>
      </td>
      <td style={{ ...tdBase, ...lastStyle, fontFamily: "var(--ff-display)", fontWeight: 700,
                   textAlign: "right", whiteSpace: "nowrap", paddingRight: "12px" }}>
        {item.count !== undefined && item.count > 1
          ? <>{item.currency} {item.amount} <span style={{ fontSize: "var(--ts-meta)", fontWeight: 500, color: "var(--text-3)" }}>×{item.count}</span></>
          : <>{item.currency} {item.amount}</>
        }
      </td>
      {item.payToggle !== undefined && (
        <td style={{ ...tdBase, ...lastStyle, textAlign: "right", paddingRight: "16px", width: "110px", whiteSpace: "nowrap" }}>
          {item.payToggle}
        </td>
      )}
    </tr>
  );
}

function StackedItemRow({ item, isLast }: { item: TableItem; isLast: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      gap: "10px", padding: "11px 16px",
      borderBottom: isLast ? "none" : "1px solid var(--border)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "var(--ts-body-sm)", color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", flexWrap: "wrap" }}>
          {item.dayLabel !== "—" && (
            <span style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)" }}>Day {item.dayLabel}</span>
          )}
          <span style={{
            display: "inline-block", padding: "0px 6px", borderRadius: "9999px", fontSize: "var(--ts-meta)", fontWeight: 600,
            background: item.type === "Shared" ? "var(--accent-subtle)" : "var(--surface-3)",
            color: item.type === "Shared" ? "var(--accent)" : "var(--text-3)",
            border: `1px solid ${item.type === "Shared" ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "var(--border)"}`,
          }}>
            {item.type}
          </span>
          {item.count !== undefined && item.count > 1 && (
            <span style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)" }}>×{item.count}</span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-body-sm)", color: "var(--text)", whiteSpace: "nowrap" }}>
          {item.currency} {item.amount}
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
            href={`/households/${c.groupId ?? c.householdId}/expenses/${c.billId}`}
            style={{ color: "var(--text)", textDecoration: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {c.billTitle}
            <span style={{ fontWeight: 400, fontSize: "var(--ts-label)", color: "var(--text-3)", marginLeft: "6px" }}>
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
            href={`/households/${c.groupId ?? c.householdId}/expenses/${c.billId}`}
            style={{ color: "var(--text)", textDecoration: "none" }}
          >
            {c.billTitle}
            <span style={{ fontWeight: 400, fontSize: "var(--ts-label)", color: "var(--text-3)", marginLeft: "6px" }}>
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
      style={{
        background: "var(--surface)",
        border: `1px solid ${p.isCurrent ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: p.isCurrent ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
    >
      {/* Clickable header */}
      <div
        role="button"
        onClick={() => hasItems && setExpanded((v) => !v)}
        style={{
          display: "flex", flexDirection: "column", gap: "6px",
          padding: "13px 16px 13px 20px",
          cursor: hasItems ? "pointer" : "default",
          background: p.isCurrent ? "color-mix(in srgb, var(--accent) 4%, transparent)" : "transparent",
        }}
      >
        {/* Row 1: label + chevron */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-body)",
                         color: "var(--text)", margin: 0, whiteSpace: "nowrap" }}>
              {p.label}
            </h3>
            {p.isCurrent && (
              <span style={{ background: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "9999px",
                             padding: "1px 7px", fontSize: "var(--ts-meta)", fontWeight: 600, flexShrink: 0 }}>
                Current
              </span>
            )}
          </div>
          {hasItems && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms", flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
        {/* Row 2: stats — wraps naturally on narrow screens */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px 16px", fontSize: "var(--ts-label)", color: "var(--text-3)" }}>
          <span>Due <strong style={{ color: "var(--text)" }}>${obligations.toFixed(2)}</strong></span>
          <span>Net income <strong style={{ color: "var(--text)" }}>${p.projectedNetIncome.toFixed(2)}</strong></span>
          <span style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-body-sm)",
                         color: netOver ? "var(--danger)" : "var(--success)", whiteSpace: "nowrap" }}>
            {netOver ? "−" : "+"}${Math.abs(p.net).toFixed(2)}
          </span>
          {p.disposableIncome != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              {p.disposableIncomeSource === "balance" ? "Available now" : "Disposable"}
              {" "}
              <strong style={{ fontFamily: "var(--ff-display)", fontWeight: 700,
                               color: p.disposableIncome < 0 ? "var(--danger)" : "var(--accent)" }}>
                {p.disposableIncome < 0 ? "−" : "+"}${Math.abs(p.disposableIncome).toFixed(0)}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Expandable body */}
      {expanded && hasItems && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {isMobile ? (
            // Stacked list for mobile
            <div>
              {items.map((item, i) => (
                <StackedItemRow key={item.key} item={item} isLast={i === items.length - 1} />
              ))}
            </div>
          ) : (
            // Table for desktop
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  <th style={{ ...tdMeta, paddingLeft: "20px", paddingRight: "8px", fontWeight: 700, fontSize: "var(--ts-meta)",
                               textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)",
                               width: "44px", textAlign: "right", borderBottom: "1px solid var(--border)" }}>
                    {isMonthly ? "Day" : ""}
                  </th>
                  <th style={{ ...tdMeta, fontWeight: 700, fontSize: "var(--ts-meta)", textTransform: "uppercase",
                               letterSpacing: "0.08em", color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}>
                    Name
                  </th>
                  <th style={{ ...tdMeta, fontWeight: 700, fontSize: "var(--ts-meta)", textTransform: "uppercase",
                               letterSpacing: "0.08em", color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}>
                    Type
                  </th>
                  <th style={{ ...tdMeta, fontWeight: 700, fontSize: "var(--ts-meta)", textTransform: "uppercase",
                               letterSpacing: "0.08em", color: "var(--text-3)", textAlign: "right",
                               paddingRight: "12px", borderBottom: "1px solid var(--border)" }}>
                    Amount
                  </th>
                  {isMonthly && (
                    <th style={{ ...tdMeta, fontWeight: 700, fontSize: "var(--ts-meta)", textTransform: "uppercase",
                                 letterSpacing: "0.08em", color: "var(--text-3)", textAlign: "right",
                                 paddingRight: "16px", width: "110px", borderBottom: "1px solid var(--border)" }}>
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
      style={{
        padding: "6px 14px", borderRadius: "9999px", fontSize: "var(--ts-label)", fontWeight: active ? 700 : 500,
        cursor: "pointer", transition: "all 110ms",
        border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
        background: active ? "var(--accent-subtle)" : "var(--surface-2)",
        color: active ? "var(--accent)" : "var(--text-3)",
      }}
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
      <div key={granularity} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {periods.map((p) => (
          <PeriodCard key={p.label} p={p} cardRef={p.isCurrent ? currentRef : undefined} granularity={granularity} />
        ))}
      </div>
    </div>
  );
}
