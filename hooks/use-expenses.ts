import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  payExpense,
  unpayExpense,
} from "@/lib/api/expenses";
import {
  fetchHouseholdExpenses,
  fetchHouseholdExpenseDetail,
  fetchHouseholdBalances,
  deleteHouseholdExpense,
  payHouseholdExpense,
  unpayHouseholdExpense,
  addExpenseSplit,
  removeSplit,
  createHouseholdExpense,
  updateHouseholdExpense,
} from "@/lib/api/household-expenses";
import { fetchHouseholdContributions } from "@/lib/api/households";
import { financeKeys } from "@/lib/query-keys";
import {
  invalidatePersonalExpenses,
  invalidateHouseholdExpenseList,
  invalidateHouseholdExpenseDetail,
  invalidateContributionSplit,
} from "@/lib/cache-invalidation";
import type { ExpensePage } from "@/types/expense";
import type {
  HouseholdExpenseListResponse,
  HouseholdExpenseDetailResponse,
  ExpenseSplit,
} from "@/types/household-expense";
import type { MemberBalanceListResponse } from "@/types/membership";

// ─── Personal expenses ────────────────────────────────────────────────────────

export function useExpenses(initialData?: ExpensePage) {
  return useQuery({
    queryKey: financeKeys.expenses(),
    queryFn: fetchExpenses,
    staleTime: 60_000,
    initialData,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => invalidatePersonalExpenses(queryClient),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateExpense>[1] }) =>
      updateExpense(id, body),
    onSuccess: () => invalidatePersonalExpenses(queryClient),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => invalidatePersonalExpenses(queryClient),
  });
}

export function usePayExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, occurrenceDate }: { id: string; occurrenceDate: string }) =>
      payExpense(id, occurrenceDate),
    onSuccess: () => invalidatePersonalExpenses(queryClient),
  });
}

export function useUnpayExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, occurrenceDate }: { id: string; occurrenceDate: string }) =>
      unpayExpense(id, occurrenceDate),
    onSuccess: () => invalidatePersonalExpenses(queryClient),
  });
}

// ─── Household shared expenses ────────────────────────────────────────────────

export function useHouseholdExpenses(
  householdId: string,
  initialData?: HouseholdExpenseListResponse,
) {
  return useQuery({
    queryKey: financeKeys.householdExpenses(householdId),
    queryFn: () => fetchHouseholdExpenses(householdId),
    staleTime: 60_000,
    initialData,
    enabled: !!householdId,
  });
}

export function useHouseholdExpenseDetail(householdId: string, householdExpenseId: string) {
  return useQuery({
    queryKey: financeKeys.householdExpenseDetail(householdId, householdExpenseId),
    queryFn: () => fetchHouseholdExpenseDetail(householdId, householdExpenseId),
    staleTime: 60_000,
    enabled: !!householdId && !!householdExpenseId,
  });
}

export function useHouseholdContributions(id: string) {
  return useQuery({
    queryKey: financeKeys.householdContributions(id),
    queryFn: () => fetchHouseholdContributions(id),
    staleTime: 60_000,
    enabled: !!id,
  });
}

/**
 * Per-other-member balances for one household, from the caller's POV.
 * Used by the YOU'RE OWED / YOU OWE badge on the household list and detail.
 *
 * Accepts an optional `initialData` so RSC-prefetched balances hydrate the
 * cache and the badge skips its initial client fetch — see the N+1 fix in
 * audit §3.4 (`fetchAllBalancesServer` on the household landing page).
 */
export function useHouseholdBalances(householdId: string, initialData?: MemberBalanceListResponse) {
  return useQuery({
    queryKey: financeKeys.householdBalances(householdId),
    queryFn: () => fetchHouseholdBalances(householdId),
    staleTime: 60_000,
    enabled: !!householdId,
    initialData,
  });
}

export function useCreateHouseholdExpense(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createHouseholdExpense>[1]) =>
      createHouseholdExpense(householdId, body),
    onSuccess: () => invalidateHouseholdExpenseList(queryClient, householdId),
  });
}

export function useUpdateHouseholdExpense(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateHouseholdExpense>[2]) =>
      updateHouseholdExpense(householdId, householdExpenseId, body),
    onSuccess: () => invalidateHouseholdExpenseDetail(queryClient, householdId, householdExpenseId),
  });
}

export function useDeleteHouseholdExpense(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdExpenseId: string) =>
      deleteHouseholdExpense(householdId, householdExpenseId),
    onSuccess: () => invalidateHouseholdExpenseList(queryClient, householdId),
  });
}

export function usePayHouseholdExpense(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (occurrenceDate: string) =>
      payHouseholdExpense(householdId, householdExpenseId, occurrenceDate),
    onSuccess: (_data, occurrenceDate) => {
      // Optimistic patch the list cache so the row paints "paid" immediately.
      queryClient.setQueryData(
        financeKeys.householdExpenses(householdId),
        (old: HouseholdExpenseListResponse | undefined) =>
          old
            ? {
                ...old,
                items: old.items.map((b) =>
                  b.expenseId === householdExpenseId
                    ? { ...b, isPaid: true, currentOccurrenceDate: occurrenceDate }
                    : b,
                ),
              }
            : old,
      );
      invalidateHouseholdExpenseDetail(queryClient, householdId, householdExpenseId);
    },
  });
}

export function useUnpayHouseholdExpense(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (occurrenceDate: string) =>
      unpayHouseholdExpense(householdId, householdExpenseId, occurrenceDate),
    onSuccess: () => {
      queryClient.setQueryData(
        financeKeys.householdExpenses(householdId),
        (old: HouseholdExpenseListResponse | undefined) =>
          old
            ? {
                ...old,
                items: old.items.map((b) =>
                  b.expenseId === householdExpenseId ? { ...b, isPaid: false } : b,
                ),
              }
            : old,
      );
      invalidateHouseholdExpenseDetail(queryClient, householdId, householdExpenseId);
    },
  });
}

export function useAddExpenseSplit(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { membershipId: string; amount: number; currency: string }) =>
      addExpenseSplit(householdId, householdExpenseId, body),
    onSuccess: (newSplit: ExpenseSplit) => {
      // Optimistic append on the detail cache; full invalidation rebuilds the
      // balances + dashboard projections that depend on the split set.
      queryClient.setQueryData(
        financeKeys.householdExpenseDetail(householdId, householdExpenseId),
        (old: HouseholdExpenseDetailResponse | undefined) =>
          old ? { ...old, splits: [...old.splits, newSplit] } : old,
      );
      invalidateHouseholdExpenseDetail(queryClient, householdId, householdExpenseId);
    },
  });
}

export function useRemoveExpenseSplit(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (splitId: string) => removeSplit(householdId, householdExpenseId, splitId),
    onSuccess: (_: unknown, splitId: string) => {
      queryClient.setQueryData(
        financeKeys.householdExpenseDetail(householdId, householdExpenseId),
        (old: HouseholdExpenseDetailResponse | undefined) =>
          old ? { ...old, splits: old.splits.filter((s) => s.splitId !== splitId) } : old,
      );
      invalidateHouseholdExpenseDetail(queryClient, householdId, householdExpenseId);
    },
  });
}

/**
 * Unbound version of usePayHouseholdExpense for the budget view, where
 * householdId + billId vary per row.
 */
export function usePayContributionSplit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      householdId,
      billId,
      occurrenceDate,
    }: {
      householdId: string;
      billId: string;
      occurrenceDate: string;
    }) => payHouseholdExpense(householdId, billId, occurrenceDate),
    onSuccess: (_data, { householdId }) => invalidateContributionSplit(queryClient, householdId),
  });
}

