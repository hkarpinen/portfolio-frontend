import { toMonthlyAmount } from "@/lib/utils";
import type { ContributionPeriod } from "@/types/contributions";
import type { IncomeSource } from "@/types/income";
import type { ExpenseCategory } from "@/types/expense";
import type { UpcomingBill } from "@/lib/finance/editorial-copy";

/** A flattened "recent expense" row for the Terminus `.tx-row` stack — one
 *  per outgoing line (personal bill or shared split) in the selected period. */
export interface RecentExpenseRow {
  key: string;
  name: string;
  category?: ExpenseCategory | string | null;
  dueDate: string;
  amount: number;
  currency: string;
}

/**
 * Flatten a period's personal bills and shared-split contributions into a
 * single list of outgoing rows, newest due-date first, capped at `limit`.
 * Backs the prototype's `// RECENT_EXPENSES` `.tx-row` stack.
 */
export function buildRecentExpenses(
  period: ContributionPeriod | undefined,
  limit = 6,
): RecentExpenseRow[] {
  const rows: RecentExpenseRow[] = [
    ...(period?.personalBills ?? []).map((b) => ({
      key: `bill:${b.chargeId}`,
      name: b.title,
      category: b.category,
      dueDate: b.dueDate,
      amount: b.amount,
      currency: b.currency ?? "USD",
    })),
    ...(period?.contributions ?? []).map((c) => ({
      key: `split:${c.allocationId}`,
      name: c.billTitle,
      category: c.billCategory,
      dueDate: c.dueDate,
      amount: Number(c.amount),
      currency: c.currency,
    })),
  ];
  return rows.sort((a, b) => b.dueDate.localeCompare(a.dueDate)).slice(0, limit);
}

/**
 * Pure helpers for the expenses page. Split from `expenses-client.tsx` so
 * the rendering file stays focused on JSX. Period-level helpers
 * (`findCurrentPeriod`, `monthObligations`, etc.) live in `lib/contributions.ts`
 * — they belong to the contribution-period domain, not the expenses view.
 */

/** Roll income sources up to monthly gross + monthly net (after deductions). */
export function computeIncomeMonthly(sources: IncomeSource[]) {
  let monthlyGross = 0;
  let monthlyDeductions = 0;
  for (const source of sources) {
    const gross = toMonthlyAmount(source.amount, source.quotedAs);
    monthlyGross += gross;
    for (const d of source.deductions ?? []) {
      const base = d.method === "PercentOfGross" ? (d.value / 100) * gross : d.value;
      monthlyDeductions += toMonthlyAmount(base, d.frequency ?? "Monthly");
    }
  }
  return { monthlyGross, monthlyNet: monthlyGross - monthlyDeductions };
}

/** A spend-by-category row for the Terminus `// BUDGET_OVERVIEW` bars. */
export interface CategorySpendRow {
  category: string;
  spent: number;
  /** Bar fill 0–100, spent relative to the heaviest category (no budget
   *  model exists, so this is share-of-peak, not share-of-budget). */
  pct: number;
}

/**
 * Roll a period's outgoings up by category for the budget-overview bars.
 *
 * There is no budget-target model in the finance domain yet, so this can't
 * show "spent / budget" the way the prototype mock did. Instead it shows
 * real spend per category as a share of the heaviest category — an honest
 * read of where the month's money is going. Top `limit` categories by spend.
 */
export function spendByCategory(
  period: ContributionPeriod | undefined,
  limit = 4,
): CategorySpendRow[] {
  const byCat = new Map<string, number>();
  const add = (cat: string | null | undefined, amount: number) => {
    const key = cat || "Other";
    byCat.set(key, (byCat.get(key) ?? 0) + amount);
  };
  for (const b of period?.personalBills ?? []) add(b.category, b.amount);
  for (const c of period?.contributions ?? []) add(c.billCategory, Number(c.amount));

  const rows = Array.from(byCat.entries())
    .map(([category, spent]) => ({ category, spent }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit);
  const peak = rows[0]?.spent ?? 0;
  return rows.map((r) => ({
    ...r,
    pct: peak > 0 ? Math.round((r.spent / peak) * 100) : 0,
  }));
}

/**
 * Merge personal bills and shared-split contributions in a period into a
 * single upcoming-bills list, dropping anything more than ~1 day past and
 * sorting earliest due-date first.
 */
export function buildUpcomingFromPeriod(
  period: ContributionPeriod | undefined,
  now: Date = new Date(),
): UpcomingBill[] {
  const cutoff = now.getTime() - 86_400_000;
  return [
    ...(period?.personalBills ?? []).map((b) => ({
      title: b.title,
      amount: b.amount,
      dueDate: b.dueDate,
    })),
    ...(period?.contributions ?? []).map((c) => ({
      title: c.billTitle,
      amount: Number(c.amount),
      dueDate: c.dueDate,
    })),
  ]
    .filter((b) => new Date(b.dueDate).getTime() >= cutoff)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
