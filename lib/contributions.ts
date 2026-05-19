import type { ContributionItem, PersonalBillItem, ContributionPeriodSummary } from "@/types/finance";

export interface AggregatedPeriod {
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

const nowKey = () => new Date().toISOString().slice(0, 7);

export function emptyBucket(label: string, periodStart: string): AggregatedPeriod {
  return { label, periodStart, totalDue: 0, totalPaid: 0, personalBillsDue: 0,
           projectedNetIncome: 0, net: 0, contributions: [], personalBills: [], isCurrent: false,
           disposableIncome: null, disposableIncomeSource: null };
}

export function mergeBucket(b: AggregatedPeriod, m: ContributionPeriodSummary, nk: string) {
  b.totalDue            += m.totalDue;
  b.totalPaid           += m.totalPaid;
  b.personalBillsDue    += m.personalBillsDue ?? 0;
  b.projectedNetIncome  += m.projectedNetIncome ?? m.projectedIncome;
  b.net                 += m.disposableIncome ?? (m.projectedNetIncome - m.totalDue - (m.personalBillsDue ?? 0));
  b.contributions.push(...m.contributions);
  b.personalBills.push(...(m.personalBills ?? []));
  if (m.periodStart.slice(0, 7) === nk) b.isCurrent = true;
  if (m.disposableIncome != null) {
    b.disposableIncome = (b.disposableIncome ?? 0) + m.disposableIncome;
    if (b.disposableIncomeSource !== "balance")
      b.disposableIncomeSource = m.disposableIncomeSource ?? "estimate";
  }
}

export function aggregateByYear(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const map = new Map<number, AggregatedPeriod>();
  const nk = nowKey();
  for (const m of months) {
    const y = new Date(m.periodStart).getUTCFullYear();
    if (!map.has(y)) map.set(y, emptyBucket(String(y), `${y}-01-01`));
    mergeBucket(map.get(y)!, m, nk);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

export function aggregateByQuarter(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
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

export function toMonthlyPeriods(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const nk = nowKey();
  return months.map((m) => ({
    label:                   m.periodLabel,
    periodStart:             m.periodStart,
    totalDue:                m.totalDue,
    totalPaid:               m.totalPaid,
    personalBillsDue:        m.personalBillsDue ?? 0,
    projectedNetIncome:      m.projectedNetIncome ?? m.projectedIncome,
    net:                     m.disposableIncome ?? (m.projectedNetIncome - m.totalDue - (m.personalBillsDue ?? 0)),
    contributions:           m.contributions,
    personalBills:           m.personalBills ?? [],
    isCurrent:               m.periodStart.slice(0, 7) === nk,
    disposableIncome:        m.disposableIncome ?? null,
    disposableIncomeSource:  m.disposableIncomeSource ?? null,
  }));
}

export function sortPeriods(periods: AggregatedPeriod[]): AggregatedPeriod[] {
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
