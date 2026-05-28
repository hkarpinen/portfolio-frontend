import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { renderHookWithClient } from "@/tests/test-utils/query-client";
import { financeKeys } from "@/lib/query-keys";

/**
 * The audit (§6.3) singled these out as the highest-risk mutation hooks
 * because they each touch a different cascade — getting any of them wrong
 * silently stales a derived projection (the balance badge, the budget
 * total, the members list) without any visible error.
 *
 * Strategy: mock just the api layer (not fetch — `tests/lib/api-client.test.ts`
 * pins that contract separately), seed every cache slot the cascade is
 * expected to touch, drive the mutation, then assert every expected slot
 * is invalidated AND that an adjacent unrelated slot is NOT. The second
 * half catches over-broad cascades that would refetch the world.
 */

// ─── Module mocks ─────────────────────────────────────────────────────────────
// vi.mock is hoisted; we re-import the modules below so the test can drive
// the stubs via vi.mocked(...).
vi.mock("@/lib/api/expenses", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/expenses")>("@/lib/api/expenses");
  return {
    ...actual,
    deleteExpense: vi.fn(),
  };
});

vi.mock("@/lib/api/household-expenses", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/household-expenses")>(
    "@/lib/api/household-expenses",
  );
  return {
    ...actual,
    deleteHouseholdExpense: vi.fn(),
    payHouseholdExpense: vi.fn(),
  };
});

vi.mock("@/lib/api/households", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/households")>(
    "@/lib/api/households",
  );
  return {
    ...actual,
    removeMember: vi.fn(),
  };
});

// Imports after vi.mock so the mocked versions are in effect.
import {
  useDeleteExpense,
  usePayHouseholdExpense,
  useDeleteHouseholdExpense,
  usePayContributionSplit,
} from "@/hooks/use-expenses";
import { useRemoveMember } from "@/hooks/use-household";
import { deleteExpense } from "@/lib/api/expenses";
import {
  deleteHouseholdExpense,
  payHouseholdExpense,
} from "@/lib/api/household-expenses";
import { removeMember } from "@/lib/api/households";

const HID = "h-1";
const EXPENSE_ID = "e-1";

function seed(qc: import("@tanstack/react-query").QueryClient, key: readonly unknown[], v: unknown = "seed") {
  qc.setQueryData([...key], v);
}

function isInvalidated(
  qc: import("@tanstack/react-query").QueryClient,
  key: readonly unknown[],
): boolean {
  return qc.getQueryState([...key])?.isInvalidated === true;
}

beforeEach(() => {
  vi.mocked(deleteExpense).mockResolvedValue(undefined as unknown as never);
  vi.mocked(deleteHouseholdExpense).mockResolvedValue(undefined as unknown as never);
  vi.mocked(payHouseholdExpense).mockResolvedValue(undefined as unknown as never);
  vi.mocked(removeMember).mockResolvedValue(undefined as unknown as never);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useDeleteExpense", () => {
  it("calls the api and invalidates personal expenses + global contributions", async () => {
    const { result, queryClient } = renderHookWithClient(() => useDeleteExpense());
    seed(queryClient, financeKeys.expenses());
    seed(queryClient, financeKeys.householdContributions());
    seed(queryClient, financeKeys.income()); // adjacent — must NOT be invalidated.

    await act(async () => {
      await result.current.mutateAsync(EXPENSE_ID);
    });

    expect(vi.mocked(deleteExpense)).toHaveBeenCalledWith(EXPENSE_ID);
    await waitFor(() => {
      expect(isInvalidated(queryClient, financeKeys.expenses())).toBe(true);
      expect(isInvalidated(queryClient, financeKeys.householdContributions())).toBe(true);
    });
    expect(isInvalidated(queryClient, financeKeys.income())).toBe(false);
  });
});

describe("usePayHouseholdExpense", () => {
  it("optimistically marks the row paid and invalidates the household-detail cascade", async () => {
    const occurrence = "2026-05-01";
    const { result, queryClient } = renderHookWithClient(() =>
      usePayHouseholdExpense(HID, EXPENSE_ID),
    );

    // Seed the list cache with one row so we can observe the optimistic patch.
    queryClient.setQueryData(financeKeys.householdExpenses(HID), {
      items: [{ expenseId: EXPENSE_ID, callerIsPaid: false }],
    });
    seed(queryClient, financeKeys.householdExpenseDetail(HID, EXPENSE_ID));
    seed(queryClient, financeKeys.householdContributions(HID));
    seed(queryClient, financeKeys.householdDashboard(HID));
    seed(queryClient, financeKeys.householdBalances(HID));

    await act(async () => {
      await result.current.mutateAsync(occurrence);
    });

    expect(vi.mocked(payHouseholdExpense)).toHaveBeenCalledWith(HID, EXPENSE_ID, occurrence);

    // Optimistic patch — the cache row is now flagged paid even before the
    // invalidation refetches. Caching this contract because removing it
    // would visibly stutter the UI on pay.
    const listCache = queryClient.getQueryData<{
      items: { expenseId: string; callerIsPaid: boolean; currentOccurrenceDate?: string }[];
    }>(financeKeys.householdExpenses(HID));
    expect(listCache?.items[0].callerIsPaid).toBe(true);
    expect(listCache?.items[0].currentOccurrenceDate).toBe(occurrence);

    await waitFor(() => {
      expect(isInvalidated(queryClient, financeKeys.householdExpenseDetail(HID, EXPENSE_ID))).toBe(
        true,
      );
      expect(isInvalidated(queryClient, financeKeys.householdBalances(HID))).toBe(true);
      expect(isInvalidated(queryClient, financeKeys.householdContributions(HID))).toBe(true);
    });
  });
});

describe("usePayContributionSplit", () => {
  it("invalidates the per-household AND the global contributions caches", async () => {
    const { result, queryClient } = renderHookWithClient(() => usePayContributionSplit());

    seed(queryClient, financeKeys.householdContributions(HID));
    seed(queryClient, financeKeys.householdExpenses(HID));
    seed(queryClient, financeKeys.householdContributions());
    seed(queryClient, financeKeys.householdBalances(HID));
    seed(queryClient, financeKeys.householdContributions("other-h")); // unrelated

    await act(async () => {
      await result.current.mutateAsync({
        householdId: HID,
        billId: EXPENSE_ID,
        occurrenceDate: "2026-05-01",
      });
    });

    await waitFor(() => {
      expect(isInvalidated(queryClient, financeKeys.householdContributions(HID))).toBe(true);
      // Hierarchical prefix — global key is a parent of "other-h" too, so
      // invalidating it sweeps every sibling. That's the documented
      // over-invalidation tradeoff.
      expect(isInvalidated(queryClient, financeKeys.householdContributions())).toBe(true);
      expect(isInvalidated(queryClient, financeKeys.householdBalances(HID))).toBe(true);
    });
  });
});

describe("useDeleteHouseholdExpense", () => {
  it("invalidates the full household-projection set (list + contributions + dashboard + balances)", async () => {
    const { result, queryClient } = renderHookWithClient(() => useDeleteHouseholdExpense(HID));

    seed(queryClient, financeKeys.householdExpenses(HID));
    seed(queryClient, financeKeys.householdContributions(HID));
    seed(queryClient, financeKeys.householdDashboard(HID));
    seed(queryClient, financeKeys.householdBalances(HID));
    seed(queryClient, financeKeys.householdExpenses("other-h"));

    await act(async () => {
      await result.current.mutateAsync(EXPENSE_ID);
    });

    expect(vi.mocked(deleteHouseholdExpense)).toHaveBeenCalledWith(HID, EXPENSE_ID);

    await waitFor(() => {
      expect(isInvalidated(queryClient, financeKeys.householdExpenses(HID))).toBe(true);
      expect(isInvalidated(queryClient, financeKeys.householdContributions(HID))).toBe(true);
      expect(isInvalidated(queryClient, financeKeys.householdDashboard(HID))).toBe(true);
      expect(isInvalidated(queryClient, financeKeys.householdBalances(HID))).toBe(true);
    });
    expect(isInvalidated(queryClient, financeKeys.householdExpenses("other-h"))).toBe(false);
  });
});

describe("useRemoveMember", () => {
  it("invalidates members, detail, contributions, and dashboard but not balances", async () => {
    const { result, queryClient } = renderHookWithClient(() => useRemoveMember(HID));

    seed(queryClient, financeKeys.householdMembers(HID));
    seed(queryClient, financeKeys.householdDetail(HID));
    seed(queryClient, financeKeys.householdContributions(HID));
    seed(queryClient, financeKeys.householdDashboard(HID));
    seed(queryClient, financeKeys.householdBalances(HID));

    await act(async () => {
      await result.current.mutateAsync("membership-1");
    });

    expect(vi.mocked(removeMember)).toHaveBeenCalledWith(HID, "membership-1");

    await waitFor(() => {
      expect(isInvalidated(queryClient, financeKeys.householdMembers(HID))).toBe(true);
      expect(isInvalidated(queryClient, financeKeys.householdDetail(HID))).toBe(true);
      expect(isInvalidated(queryClient, financeKeys.householdContributions(HID))).toBe(true);
      expect(isInvalidated(queryClient, financeKeys.householdDashboard(HID))).toBe(true);
    });
    // Balances cascade is owned by expense/split mutations; not member ops.
    expect(isInvalidated(queryClient, financeKeys.householdBalances(HID))).toBe(false);
  });
});
