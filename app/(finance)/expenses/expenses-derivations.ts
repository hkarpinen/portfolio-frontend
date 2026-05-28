import { toMonthlyAmount } from "@/lib/utils";
import type { ContributionPeriod } from "@/types/contributions";
import type { IncomeSource } from "@/types/income";
import type { UpcomingBill } from "@/lib/finance/editorial-copy";

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

/**
 * Merge personal bills and shared-split contributions in a period into a
 * single upcoming-bills list, dropping anything more than ~1 day past and
 * sorting earliest due-date first. Feeds the expenses-page Ticker.
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
