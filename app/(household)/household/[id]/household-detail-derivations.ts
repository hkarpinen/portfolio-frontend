import type { HouseholdExpense } from "@/types/household-expense";

/**
 * Pure projections for the household detail page (`/household/[id]`).
 * The page reduces a bag of shared expenses to "your share this month" —
 * an even split across members. Kept here so the page stays focused on
 * its editorial chrome and the math is one canonical home if the
 * weighted-by-presence variants ship later.
 */

export interface HouseholdMonthFigures {
  /** Sum of all shared-expense amounts; null when the household has none. */
  monthlyObligations: number | null;
  /** Even split across members; null when obligations or memberCount are 0. */
  yourShare: number | null;
  /** Even-split percentage; null when memberCount is 0. */
  yourSharePct: number | null;
}

export function householdMonthFigures(
  expenses: HouseholdExpense[],
  memberCount: number,
): HouseholdMonthFigures {
  const monthlyObligations: number | null =
    expenses.length > 0 ? expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0) : null;
  const yourShare =
    monthlyObligations !== null && memberCount > 0 ? monthlyObligations / memberCount : null;
  const yourSharePct = memberCount > 0 ? Math.round(100 / memberCount) : null;
  return { monthlyObligations, yourShare, yourSharePct };
}
