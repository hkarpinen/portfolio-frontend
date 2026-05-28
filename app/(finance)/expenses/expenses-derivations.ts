import { toMonthlyAmount } from "@/lib/utils";
import type { IncomeSource } from "@/types/income";

/**
 * Pure helpers for the expenses page. Split from `expenses-client.tsx` so
 * the rendering file stays focused on JSX. Tested via the page's behaviour
 * rather than directly today; promoted to a separate file if a unit test
 * surfaces.
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

