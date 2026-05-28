import type {
  ContributionItem,
  ContributionPeriod,
  HouseholdMonthlyContributions,
} from "@/types/contributions";
import type { PersonalBillItem } from "@/types/expense";

// ── Period-level domain helpers ───────────────────────────────────────────────
// Single home for the "which contribution period is the user currently looking
// at, and what derived figures fall out of it" projections. Every callsite
// used to roll their own `new Date().toISOString().slice(0, 7)` lookup; that
// pattern now lives here so a future change (UTC vs local-time, fiscal-month
// offset, etc.) flips in one place.

/** YYYY-MM key for `now`, used to match against `ContributionPeriod.periodStart`. */
export const periodMonthKey = (now: Date = new Date()): string => now.toISOString().slice(0, 7);

/**
 * Pick the period that contains `now` (defaults to today). Pass an explicit
 * `now` from SSR so the server render and the hydration step agree on which
 * month is current — important for the expenses page masthead, which the
 * audit (§4.2) called out as a hydration-flicker source.
 */
export function findCurrentPeriod(
  months: ContributionPeriod[],
  now: Date = new Date(),
): ContributionPeriod | undefined {
  const key = periodMonthKey(now);
  return months.find((m) => m.periodStart.slice(0, 7) === key);
}

/** Personal bills with a recurrence — the user's monthly recurring slice. */
export function recurringPersonalBills(period: ContributionPeriod | undefined): PersonalBillItem[] {
  return (period?.personalBills ?? []).filter((b) => !!b.recurrenceFrequency);
}

/** Personal bills without a recurrence — one-time outlays in the period. */
export function oneTimePersonalBills(period: ContributionPeriod | undefined): PersonalBillItem[] {
  return (period?.personalBills ?? []).filter((b) => !b.recurrenceFrequency);
}

/** Sum the user owes this period: shared splits + personal bills due. */
export function monthObligations(period: ContributionPeriod | undefined): number {
  return (period?.totalDue ?? 0) + (period?.personalBillsDue ?? 0);
}

/** Distinct shared bills the user has a split on in the period. */
export function sharedBillIds(period: ContributionPeriod | undefined): Set<string> {
  return new Set((period?.contributions ?? []).map((c) => c.billId));
}

// ── Aggregations (year / quarter / month rollups) ─────────────────────────────

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

export function emptyBucket(label: string, periodStart: string): AggregatedPeriod {
  return {
    label,
    periodStart,
    totalDue: 0,
    totalPaid: 0,
    personalBillsDue: 0,
    projectedNetIncome: 0,
    net: 0,
    contributions: [],
    personalBills: [],
    isCurrent: false,
    disposableIncome: null,
    disposableIncomeSource: null,
  };
}

export function mergeBucket(b: AggregatedPeriod, m: ContributionPeriod, nk: string) {
  b.totalDue += m.totalDue;
  b.totalPaid += m.totalPaid;
  b.personalBillsDue += m.personalBillsDue ?? 0;
  b.projectedNetIncome += m.projectedNetIncome ?? m.projectedIncome;
  b.net += m.disposableIncome ?? m.projectedNetIncome - m.totalDue - (m.personalBillsDue ?? 0);
  b.contributions.push(...m.contributions);
  b.personalBills.push(...(m.personalBills ?? []));
  if (m.periodStart.slice(0, 7) === nk) b.isCurrent = true;
  if (m.disposableIncome != null) {
    b.disposableIncome = (b.disposableIncome ?? 0) + m.disposableIncome;
    if (b.disposableIncomeSource !== "balance")
      b.disposableIncomeSource = m.disposableIncomeSource ?? "estimate";
  }
}

export function aggregateByYear(months: ContributionPeriod[]): AggregatedPeriod[] {
  const map = new Map<number, AggregatedPeriod>();
  const nk = periodMonthKey();
  for (const m of months) {
    const y = new Date(m.periodStart).getUTCFullYear();
    if (!map.has(y)) map.set(y, emptyBucket(String(y), `${y}-01-01`));
    mergeBucket(map.get(y)!, m, nk);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

export function aggregateByQuarter(months: ContributionPeriod[]): AggregatedPeriod[] {
  const map = new Map<string, AggregatedPeriod>();
  const nk = periodMonthKey();
  for (const m of months) {
    const d = new Date(m.periodStart);
    const y = d.getUTCFullYear();
    const q = Math.floor(d.getUTCMonth() / 3) + 1;
    const key = `${y}-Q${q}`;
    if (!map.has(key))
      map.set(
        key,
        emptyBucket(`Q${q} ${y}`, `${y}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`),
      );
    mergeBucket(map.get(key)!, m, nk);
  }
  return [...map.values()];
}

export function toMonthlyPeriods(months: ContributionPeriod[]): AggregatedPeriod[] {
  const nk = periodMonthKey();
  return months.map((m) => ({
    label: m.periodLabel,
    periodStart: m.periodStart,
    totalDue: m.totalDue,
    totalPaid: m.totalPaid,
    personalBillsDue: m.personalBillsDue ?? 0,
    projectedNetIncome: m.projectedNetIncome ?? m.projectedIncome,
    net: m.disposableIncome ?? m.projectedNetIncome - m.totalDue - (m.personalBillsDue ?? 0),
    contributions: m.contributions,
    personalBills: m.personalBills ?? [],
    isCurrent: m.periodStart.slice(0, 7) === nk,
    disposableIncome: m.disposableIncome ?? null,
    disposableIncomeSource: m.disposableIncomeSource ?? null,
  }));
}

// ── Settlements ───────────────────────────────────────────────────────────────

/** One leg of the suggested settle-up: who pays whom, in the household currency. */
export interface SettlementTransfer {
  from: string;
  to: string;
  amount: number;
}

/**
 * Compute the minimum settle-up transfers from a month's member balances
 * (positive net = owed money, negative net = owes money). Greedily pairs
 * the biggest creditor with the biggest debtor until the residuals all
 * land inside the ±$0.005 (~half-cent) zero band.
 *
 * Returned in pay-order; consumers can sum `amount` for the unsettled
 * total. Lives here so the household contributions view and any future
 * dashboard widget share one canonical reduction.
 */
export function computeSettlements(month: HouseholdMonthlyContributions): SettlementTransfer[] {
  const nets = (month.members ?? []).map((m) => ({
    name: m.displayName ?? `User ${m.userId.slice(0, 6)}…`,
    net: (m.totalPaid ?? 0) - (m.totalDue ?? 0),
  }));

  const creditors = nets.filter((m) => m.net > 0.005).sort((a, b) => b.net - a.net);
  const debtors = nets.filter((m) => m.net < -0.005).sort((a, b) => a.net - b.net);

  const settlements: SettlementTransfer[] = [];
  let ci = 0;
  let di = 0;
  const c = creditors.map((x) => ({ ...x }));
  const d = debtors.map((x) => ({ ...x }));

  while (ci < c.length && di < d.length) {
    // The loop guard `ci < c.length && di < d.length` proves these
    // indexed accesses are defined, but TS's strict-indexed-access
    // can't see it. Bind to locals once so the non-null assertion
    // happens at the source, not every reference.
    const credit = c[ci]!;
    const debit = d[di]!;
    const pay = Math.min(credit.net, -debit.net);
    if (pay > 0.005) {
      settlements.push({ from: debit.name, to: credit.name, amount: pay });
    }
    credit.net -= pay;
    debit.net += pay;
    if (Math.abs(credit.net) < 0.005) ci++;
    if (Math.abs(debit.net) < 0.005) di++;
  }

  return settlements;
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
