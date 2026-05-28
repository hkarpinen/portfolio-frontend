import type { QueryClient } from "@tanstack/react-query";
import { financeKeys } from "./query-keys";

/**
 * Mutation → cache-invalidation cascades.
 *
 * The audit (§3.5) flagged that use-expenses.ts, use-household-expenses.ts,
 * and use-household.ts each repeated the same `invalidateQueries(...)` block
 * 30+ times — and *not always identically*. Some mutations dropped
 * `householdBalances()` from the cascade, which silently staled the
 * "you're owed / you owe" badge after a split or pay action.
 *
 * Centralising the cascades here makes the invariant explicit: if you mutate
 * a household-context expense or split, every household-scoped projection of
 * that expense gets invalidated. Adding a new projection (e.g. a chart cache
 * over balances) is one edit; over-invalidation is preferable to silent stale
 * data.
 */

/** Personal-income mutation (create/update/delete source, deduction, tax). */
export function invalidatePersonalIncome(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: financeKeys.income() });
  qc.invalidateQueries({ queryKey: financeKeys.householdContributions() });
}

/** Personal-expense mutation (create/update/delete/pay/unpay personal bill). */
export function invalidatePersonalExpenses(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: financeKeys.expenses() });
  qc.invalidateQueries({ queryKey: financeKeys.householdContributions() });
}

/**
 * Household shared-expense LIST mutation (create / delete a bill in this
 * household). Invalidates every projection that depends on the bill list.
 */
export function invalidateHouseholdExpenseList(qc: QueryClient, householdId: string) {
  qc.invalidateQueries({ queryKey: financeKeys.householdExpenses(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdDashboard(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdBalances(householdId) });
}

/**
 * Household shared-expense DETAIL mutation (update an existing bill, add/
 * remove split, pay/unpay). Touches the detail cache plus the same set of
 * household projections as the list mutation.
 */
export function invalidateHouseholdExpenseDetail(
  qc: QueryClient,
  householdId: string,
  householdExpenseId: string,
) {
  qc.invalidateQueries({
    queryKey: financeKeys.householdExpenseDetail(householdId, householdExpenseId),
  });
  qc.invalidateQueries({ queryKey: financeKeys.householdExpenses(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdDashboard(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdBalances(householdId) });
}

/**
 * Pay/unpay flow from the budget/contribution view, where the global
 * contributions cache (sum across all households) also needs to refresh.
 */
export function invalidateContributionSplit(qc: QueryClient, householdId: string) {
  qc.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdExpenses(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdContributions() });
  qc.invalidateQueries({ queryKey: financeKeys.householdBalances(householdId) });
}

/**
 * Household metadata mutation (rename, currency change).
 *
 * Honest naming caveat: this cascade is NOT narrow. `financeKeys.household(id)`
 * is the parent prefix of every per-household projection (`balances`,
 * `members`, `dashboard`, `detail`, …), so invalidating it sweeps the entire
 * household subtree. We preserve that behaviour rather than restructuring
 * the key tree because (a) rename/currency-change is rare, (b) the original
 * hand-rolled call site already had this property — invalidating
 * `financeKeys.households()` alone sweeps every household's subtree by
 * prefix — and (c) a balance refetch on a household rename is free; the
 * computation is idempotent.
 *
 * If a future change needs a *truly* narrow record-only refresh, add a
 * dedicated `financeKeys.householdRecord(id)` sibling key so the household
 * record query and its projections can be invalidated independently.
 */
export function invalidateHouseholdMetadata(qc: QueryClient, householdId: string) {
  qc.invalidateQueries({ queryKey: financeKeys.households() });
  qc.invalidateQueries({ queryKey: financeKeys.household(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdDetail(householdId) });
}

/**
 * Calendar event mutation (create / update / delete). The audit (§4.2)
 * flagged that the previous implementation hand-rolled a `predicate` that
 * matched on the magic string `"calendar"` — bypassing `financeKeys` and
 * silently failing the moment `financeKeys.calendarEvents` is renamed.
 * Routing through the factory restores the invariant.
 */
export function invalidateHouseholdCalendar(qc: QueryClient, householdId: string) {
  qc.invalidateQueries({ queryKey: [...financeKeys.household(householdId), "calendar"] });
}

/** Household membership mutation (invite, remove, role change). */
export function invalidateHouseholdMembers(qc: QueryClient, householdId: string) {
  qc.invalidateQueries({ queryKey: financeKeys.householdMembers(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdDetail(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
  qc.invalidateQueries({ queryKey: financeKeys.householdDashboard(householdId) });
}

/**
 * Top-level household list mutation (create, delete, join). The detail/
 * contributions caches refresh too because the user's set of households
 * changed.
 */
export function invalidateAllHouseholds(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: financeKeys.households() });
  qc.invalidateQueries({ queryKey: financeKeys.householdContributions() });
}
