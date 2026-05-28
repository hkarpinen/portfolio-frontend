/**
 * Editorial copy helpers for the household route group — same pattern as
 * lib/finance/editorial-copy.ts. Returns headline strings that may contain
 * inline `<em>` for the red italic accent.
 */

import { formatCurrency } from "@/lib/formatting";

const num = (n: number) => n.toLocaleString("en-US");

// ── List page ────────────────────────────────────────────────────────────────

export function householdsHeadline({ count }: { count: number }): string {
  if (count === 0) return `<em>Start</em> your first household`;
  if (count === 1) return `Your <em>one</em> household`;
  return `Your <em>${num(count)}</em> households`;
}

export function householdsDeck({ count }: { count: number }): string {
  if (count === 0) {
    return "Households are where shared bills, calendars, and chores live. Create one, or join an existing one with an invite code.";
  }
  return "Shared bills, splits, calendars, chores. One ledger per household.";
}

// ── Detail page ──────────────────────────────────────────────────────────────

export interface HouseholdDetailHeadlineInput {
  householdName?: string;
  yourShare: number | null;
  monthlyObligations: number | null;
  currency: string;
  monthName: string;
}

export function householdDetailHeadline({
  householdName,
  yourShare,
  monthlyObligations,
  currency,
  monthName,
}: HouseholdDetailHeadlineInput): string {
  const name = householdName ?? "The household";
  if (monthlyObligations === null || monthlyObligations === 0) {
    return `${name} reports <em>no bills</em> this ${monthName.toLowerCase()}`;
  }
  if (yourShare !== null && yourShare > 0) {
    return `Your share: <em>${formatCurrency(yourShare, currency, { precision: 0 })}</em> this ${monthName.toLowerCase()}`;
  }
  return `${name} owes <em>${formatCurrency(monthlyObligations, currency, { precision: 0 })}</em> this ${monthName.toLowerCase()}`;
}

export function householdDetailDeck({
  memberCount,
  expensesCount,
  monthlyObligations,
  yourShare,
  currency,
}: {
  memberCount: number;
  expensesCount: number;
  monthlyObligations: number | null;
  yourShare: number | null;
  currency: string;
}): string {
  const m = `${memberCount} member${memberCount === 1 ? "" : "s"}`;
  if (expensesCount === 0) {
    return `${m} on file. Add an expense to start tracking splits.`;
  }
  const e = `${expensesCount} expense${expensesCount === 1 ? "" : "s"}`;
  if (yourShare !== null && monthlyObligations !== null && monthlyObligations > 0) {
    const pct = Math.round((yourShare / monthlyObligations) * 100);
    return `${m}, ${e} posted; your share is ${pct}% of ${formatCurrency(monthlyObligations, currency, { precision: 0 })} due across the household.`;
  }
  return `${m}, ${e} posted.`;
}

// ── Sub-page headlines (calendar / chores / contributions) ───────────────────

export function calendarHeadline({
  count,
  monthName,
}: {
  count: number;
  monthName: string;
}): string {
  if (count === 0) return `<em>Nothing</em> on the ${monthName} calendar`;
  return `<em>${count}</em> event${count === 1 ? "" : "s"} on the ${monthName} calendar`;
}

export function choresHeadline({ overdue, total }: { overdue: number; total: number }): string {
  if (total === 0) return `<em>No chores</em> on file`;
  if (overdue > 0) return `<em>${overdue}</em> chore${overdue === 1 ? "" : "s"} overdue`;
  return `${total} chore${total === 1 ? "" : "s"}, <em>all caught up</em>`;
}

export function contributionsHeadline({
  currency,
  unsettled,
  monthLabel,
}: {
  currency: string;
  unsettled: number;
  monthLabel: string;
}): string {
  if (unsettled === 0) return `${monthLabel} is <em>squared up</em>`;
  return `<em>${formatCurrency(unsettled, currency, { precision: 0 })}</em> unsettled in ${monthLabel}`;
}
