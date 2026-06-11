import type { HouseholdExpense } from "@/types/household-expense";

/**
 * Pure projections for the household detail page (`/household/[id]`).
 * The page reduces a bag of shared expenses to "your share this month" — the sum of the caller's
 * OWN allocation (`callerShare`) across the bills, so it reflects the real (possibly uneven) split.
 * Falls back to an even split per bill only for bills the server didn't attribute a caller share to
 * (e.g. the caller has no allocation yet).
 */

interface HouseholdMonthFigures {
  /** Sum of all shared-expense amounts; null when the household has none. */
  monthlyObligations: number | null;
  /** The caller's real share — sum of their allocations; null when there are no expenses. */
  yourShare: number | null;
  /** yourShare as a % of total obligations; null when obligations are 0. */
  yourSharePct: number | null;
}

export function householdMonthFigures(
  expenses: HouseholdExpense[],
  memberCount: number,
): HouseholdMonthFigures {
  const monthlyObligations: number | null =
    expenses.length > 0 ? expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0) : null;

  const yourShare =
    expenses.length > 0
      ? expenses.reduce((sum, e) => {
          // The caller's real allocation when the server attributed one; otherwise fall back to an
          // even split of THAT bill (not the whole pot) so a missing allocation doesn't overstate.
          const share =
            e.callerShare ?? (memberCount > 0 ? (e.amount ?? 0) / memberCount : 0);
          return sum + share;
        }, 0)
      : null;

  const yourSharePct =
    yourShare !== null && monthlyObligations && monthlyObligations > 0
      ? Math.round((yourShare / monthlyObligations) * 100)
      : null;

  return { monthlyObligations, yourShare, yourSharePct };
}
