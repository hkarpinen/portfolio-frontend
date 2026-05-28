import type { ExpenseSplit, HouseholdExpense } from "@/types/household-expense";
import type { MembershipResponse } from "@/types/membership";

/**
 * Pure projections for the household expense-detail page. Both the inline
 * splits section and the older standalone `expense-splits.tsx` used to
 * hand-roll the same allocation reduction; pulling it here means one
 * canonical answer for "what's allocated / what's left".
 */

/** Sum of split amounts plus the headline remainder against the bill total. */
export function splitAllocation(splits: ExpenseSplit[], totalAmount: number) {
  const allocated = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  return {
    allocated,
    remaining: Math.max(0, Number(totalAmount) - allocated),
    /** Unclamped remainder — negative when over-allocated. The old
     *  `expense-splits.tsx` rendered this in its "Unallocated" tint card. */
    netRemaining: Number(totalAmount) - allocated,
  };
}

/**
 * Who's eligible to be added to a split, plus a flag for whether the
 * caller is already on it. `userId` comparison is case-insensitive — the
 * wire format mixes guid casings across services.
 */
export function eligibleSplitMembers(
  splits: ExpenseSplit[],
  members: MembershipResponse[],
  currentMembership: MembershipResponse | null,
) {
  const splitUserIds = new Set(
    splits.map((s) => s.userId?.toLowerCase()).filter(Boolean) as string[],
  );
  return {
    eligibleMembers: members.filter((m) => !splitUserIds.has(m.userId?.toLowerCase() ?? "")),
    currentUserInSplit: !!(
      currentMembership && splitUserIds.has(currentMembership.userId?.toLowerCase() ?? "")
    ),
  };
}

/** Percent-of-total label for a single split row; "—" when the bill is $0. */
export function splitShareLabel(split: ExpenseSplit, expense: HouseholdExpense): string {
  if (!(expense.amount > 0)) return "—";
  return `${((Number(split.amount) / Number(expense.amount)) * 100).toFixed(1)}%`;
}
