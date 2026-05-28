import { describe, it, expect, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  invalidatePersonalIncome,
  invalidatePersonalExpenses,
  invalidateHouseholdExpenseList,
  invalidateHouseholdExpenseDetail,
  invalidateContributionSplit,
  invalidateHouseholdMetadata,
  invalidateHouseholdCalendar,
  invalidateHouseholdMembers,
  invalidateAllHouseholds,
} from "@/lib/cache-invalidation";
import { financeKeys } from "@/lib/query-keys";

/**
 * These tests pin the mutation → projection cascades. If a key in
 * `financeKeys` is renamed and a helper isn't updated, the corresponding
 * `expect(isInvalidated).toBe(true)` flips to `false` and the suite fails —
 * which is the whole point of the helpers existing.
 *
 * Convention: seed each cache slot with placeholder data, run the helper,
 * then assert which slots are now invalidated and which are NOT.
 */

const HID = "h-1";
const OTHER_HID = "h-2";
const EXPENSE_ID = "e-1";

function seed(qc: QueryClient, key: readonly unknown[], value: unknown = "seed") {
  qc.setQueryData([...key], value);
}

function isInvalidated(qc: QueryClient, key: readonly unknown[]): boolean {
  return qc.getQueryState([...key])?.isInvalidated === true;
}

let qc: QueryClient;
beforeEach(() => {
  qc = new QueryClient();
});

describe("invalidatePersonalIncome", () => {
  it("invalidates personal income and the global contributions projection", () => {
    seed(qc, financeKeys.income());
    seed(qc, financeKeys.householdContributions());
    seed(qc, financeKeys.expenses());

    invalidatePersonalIncome(qc);

    expect(isInvalidated(qc, financeKeys.income())).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdContributions())).toBe(true);
    // Personal expenses are a different domain — must NOT be invalidated.
    expect(isInvalidated(qc, financeKeys.expenses())).toBe(false);
  });
});

describe("invalidatePersonalExpenses", () => {
  it("invalidates personal expenses and the global contributions projection", () => {
    seed(qc, financeKeys.expenses());
    seed(qc, financeKeys.householdContributions());
    seed(qc, financeKeys.income());

    invalidatePersonalExpenses(qc);

    expect(isInvalidated(qc, financeKeys.expenses())).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdContributions())).toBe(true);
    expect(isInvalidated(qc, financeKeys.income())).toBe(false);
  });
});

describe("invalidateHouseholdExpenseList", () => {
  it("invalidates every household-scoped projection for the targeted household", () => {
    seed(qc, financeKeys.householdExpenses(HID));
    seed(qc, financeKeys.householdContributions(HID));
    seed(qc, financeKeys.householdDashboard(HID));
    seed(qc, financeKeys.householdBalances(HID));
    seed(qc, financeKeys.householdExpenses(OTHER_HID));

    invalidateHouseholdExpenseList(qc, HID);

    expect(isInvalidated(qc, financeKeys.householdExpenses(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdContributions(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdDashboard(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdBalances(HID))).toBe(true);
    // Other households are untouched.
    expect(isInvalidated(qc, financeKeys.householdExpenses(OTHER_HID))).toBe(false);
  });
});

describe("invalidateHouseholdExpenseDetail", () => {
  it("invalidates the detail cache plus the same household projections", () => {
    seed(qc, financeKeys.householdExpenseDetail(HID, EXPENSE_ID));
    seed(qc, financeKeys.householdExpenses(HID));
    seed(qc, financeKeys.householdContributions(HID));
    seed(qc, financeKeys.householdDashboard(HID));
    seed(qc, financeKeys.householdBalances(HID));

    invalidateHouseholdExpenseDetail(qc, HID, EXPENSE_ID);

    expect(isInvalidated(qc, financeKeys.householdExpenseDetail(HID, EXPENSE_ID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdExpenses(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdContributions(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdDashboard(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdBalances(HID))).toBe(true);
  });
});

describe("invalidateContributionSplit", () => {
  it("invalidates the household contributions AND the global contributions cache", () => {
    seed(qc, financeKeys.householdContributions(HID));
    seed(qc, financeKeys.householdExpenses(HID));
    seed(qc, financeKeys.householdContributions());
    seed(qc, financeKeys.householdBalances(HID));

    invalidateContributionSplit(qc, HID);

    expect(isInvalidated(qc, financeKeys.householdContributions(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdExpenses(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdContributions())).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdBalances(HID))).toBe(true);
  });
});

describe("invalidateHouseholdMetadata", () => {
  it("sweeps the household subtree via the household(id) prefix", () => {
    // See the doc-comment on the helper for why this cascade is intentionally
    // broad: `financeKeys.household(id)` is the parent of every per-household
    // projection. We pin the *actual* behaviour so a future tightening (e.g.
    // adding a `householdRecord(id)` sibling key) is a deliberate change with
    // an obvious test diff, not a silent regression.
    seed(qc, financeKeys.households());
    seed(qc, financeKeys.household(HID));
    seed(qc, financeKeys.householdDetail(HID));
    seed(qc, financeKeys.householdMembers(HID));
    seed(qc, financeKeys.householdBalances(HID));
    seed(qc, financeKeys.household(OTHER_HID)); // sibling — must NOT be touched

    invalidateHouseholdMetadata(qc, HID);

    expect(isInvalidated(qc, financeKeys.households())).toBe(true);
    expect(isInvalidated(qc, financeKeys.household(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdDetail(HID))).toBe(true);
    // Children swept by hierarchical-prefix match.
    expect(isInvalidated(qc, financeKeys.householdMembers(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdBalances(HID))).toBe(true);
    // But `households()` ALSO matches by prefix → sibling households get
    // swept too. Document and accept; rename/currency is rare.
    expect(isInvalidated(qc, financeKeys.household(OTHER_HID))).toBe(true);
  });
});

describe("invalidateHouseholdCalendar", () => {
  it("invalidates every calendar query for the targeted household, across date ranges", () => {
    seed(qc, financeKeys.calendarEvents(HID, "2026-01-01", "2026-01-31"));
    seed(qc, financeKeys.calendarEvents(HID, "2026-02-01", "2026-02-28"));
    seed(qc, financeKeys.calendarEvents(HID, "", ""));
    seed(qc, financeKeys.calendarEvents(OTHER_HID, "2026-01-01", "2026-01-31"));

    invalidateHouseholdCalendar(qc, HID);

    expect(isInvalidated(qc, financeKeys.calendarEvents(HID, "2026-01-01", "2026-01-31"))).toBe(
      true,
    );
    expect(isInvalidated(qc, financeKeys.calendarEvents(HID, "2026-02-01", "2026-02-28"))).toBe(
      true,
    );
    expect(isInvalidated(qc, financeKeys.calendarEvents(HID, "", ""))).toBe(true);
    // Other households' calendar is untouched.
    expect(
      isInvalidated(qc, financeKeys.calendarEvents(OTHER_HID, "2026-01-01", "2026-01-31")),
    ).toBe(false);
  });

  it("does not invalidate non-calendar projections under the same household", () => {
    seed(qc, financeKeys.householdExpenses(HID));
    seed(qc, financeKeys.householdMembers(HID));

    invalidateHouseholdCalendar(qc, HID);

    expect(isInvalidated(qc, financeKeys.householdExpenses(HID))).toBe(false);
    expect(isInvalidated(qc, financeKeys.householdMembers(HID))).toBe(false);
  });
});

describe("invalidateHouseholdMembers", () => {
  it("invalidates members, detail, contributions, and dashboard", () => {
    seed(qc, financeKeys.householdMembers(HID));
    seed(qc, financeKeys.householdDetail(HID));
    seed(qc, financeKeys.householdContributions(HID));
    seed(qc, financeKeys.householdDashboard(HID));
    seed(qc, financeKeys.householdMembers(OTHER_HID));

    invalidateHouseholdMembers(qc, HID);

    expect(isInvalidated(qc, financeKeys.householdMembers(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdDetail(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdContributions(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdDashboard(HID))).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdMembers(OTHER_HID))).toBe(false);
  });
});

describe("invalidateAllHouseholds", () => {
  it("invalidates the household list AND the global contributions cache", () => {
    seed(qc, financeKeys.households());
    seed(qc, financeKeys.householdContributions());
    seed(qc, financeKeys.expenses());

    invalidateAllHouseholds(qc);

    expect(isInvalidated(qc, financeKeys.households())).toBe(true);
    expect(isInvalidated(qc, financeKeys.householdContributions())).toBe(true);
    expect(isInvalidated(qc, financeKeys.expenses())).toBe(false);
  });

  it("also invalidates a specific household record via the household-list prefix", () => {
    // Hierarchical keys mean financeKeys.households() is a prefix of
    // financeKeys.household(id), so invalidateQueries with the parent key
    // should sweep up the child. This pins that hierarchical contract.
    seed(qc, financeKeys.household(HID));

    invalidateAllHouseholds(qc);

    expect(isInvalidated(qc, financeKeys.household(HID))).toBe(true);
  });
});
