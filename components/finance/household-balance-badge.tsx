"use client";

import { useHouseholdBalances } from "@/hooks/use-household-expenses";
import type { MemberBalance } from "@/types/finance";

/**
 * Compact "YOU'RE OWED / YOU OWE / Settled" badge for one household,
 * computed from the caller's per-member balance list.
 *
 * NetSettlement convention (see types/finance.ts MemberBalance): positive means
 * the other member owes the caller. Summing across all members gives the
 * caller's overall position in the household.
 *
 * Visual variants:
 *   - `card`   — used on the household list cards (page.tsx)
 *   - `header` — used on the household detail header (household-chrome.tsx)
 *
 * Both variants use `.ed-mod-badge` so styling matches. Net-positive renders
 * with `.ed-mod-badge-filled-red` per the W2-H4 design spec.
 */
export function HouseholdBalanceBadge({
  householdId,
  variant = "card",
}: {
  householdId: string;
  variant?: "card" | "header";
}) {
  const { data, isLoading, isError } = useHouseholdBalances(householdId);

  const baseClass = variant === "card" ? "ed-mod-badge" : "ed-mod-badge";

  if (isLoading) {
    return (
      <span className={`${baseClass} ed-mod-badge-muted`} aria-label="Balance loading">
        Balance…
      </span>
    );
  }

  // Treat errors and missing data as "settled" rather than blocking the UI
  // with a loading state forever — the badge is informational, not gating.
  if (isError || !data) {
    return (
      <span className={`${baseClass} ed-mod-badge-muted`} aria-label="Balance unavailable">
        Settled
      </span>
    );
  }

  const summary = summarizeBalances(data.items);

  if (summary.status === "settled") {
    return (
      <span className={`${baseClass} ed-mod-badge-muted`} aria-label="No outstanding balance">
        Settled
      </span>
    );
  }

  const formatted = formatCurrency(summary.amount, summary.currency);
  const label = summary.status === "owed" ? "You're owed" : "You owe";

  return (
    <span
      className={
        summary.status === "owed"
          ? `${baseClass} ed-mod-badge-filled-red`
          : `${baseClass} ed-mod-badge-muted`
      }
      aria-label={`${label} ${formatted}`}
    >
      {label} {formatted}
    </span>
  );
}

type BalanceSummary =
  | { status: "settled" }
  | { status: "owed" | "owes"; amount: number; currency: string };

/**
 * Reduces a list of per-member balances to a single net position for the
 * caller. Picks the dominant currency rather than mixing — if a household
 * accumulates multi-currency splits we render the largest-magnitude currency
 * to avoid summing apples and oranges. In practice every member entry uses
 * the household's single currency.
 */
function summarizeBalances(items: MemberBalance[]): BalanceSummary {
  if (items.length === 0) return { status: "settled" };

  const byCurrency = new Map<string, number>();
  for (const m of items) {
    const cur = m.currency || "USD";
    byCurrency.set(cur, (byCurrency.get(cur) ?? 0) + m.netSettlement);
  }

  // Pick the currency with the largest absolute net.
  let net = 0;
  let currency = items[0].currency || "USD";
  let bestMagnitude = -1;
  for (const [cur, sum] of byCurrency) {
    if (Math.abs(sum) > bestMagnitude) {
      bestMagnitude = Math.abs(sum);
      net = sum;
      currency = cur;
    }
  }

  // Round to cents before zero-checking so trailing-decimal noise doesn't
  // surface as "you owe $0.00".
  const rounded = Math.round(net * 100) / 100;
  if (rounded === 0) return { status: "settled" };

  return rounded > 0
    ? { status: "owed", amount: rounded, currency }
    : { status: "owes", amount: -rounded, currency };
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Bad currency code — fall back to a plain number with the code suffix.
    return `${amount.toFixed(2)} ${currency}`;
  }
}
