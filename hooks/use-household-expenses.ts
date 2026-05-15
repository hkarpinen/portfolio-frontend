import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHouseholdExpenses,
  fetchHouseholdExpenseDetail,
  deleteHouseholdExpense,
  payHouseholdExpense,
  unpayHouseholdExpense,
  addExpenseSplit,
  removeSplit,
  createHouseholdExpense,
  updateHouseholdExpense,
} from "@/lib/api/household-expenses";
import { fetchHouseholdIncome } from "@/lib/api/income";
import { fetchHouseholdContributions } from "@/lib/api/households";
import { financeKeys } from "@/lib/query-keys";
import type { HouseholdExpenseListResponse, HouseholdExpenseDetailResponse, ExpenseSplit } from "@/types/finance";

export function useHouseholdExpenses(householdId: string, initialData?: HouseholdExpenseListResponse) {
  return useQuery({
    queryKey: financeKeys.householdExpenses(householdId),
    queryFn: () => fetchHouseholdExpenses(householdId),
    initialData,
    enabled: !!householdId,
  });
}

export function useHouseholdExpenseDetail(householdId: string, householdExpenseId: string) {
  return useQuery({
    queryKey: financeKeys.householdExpenseDetail(householdId, householdExpenseId),
    queryFn: () => fetchHouseholdExpenseDetail(householdId, householdExpenseId),
    enabled: !!householdId && !!householdExpenseId,
  });
}

export function useHouseholdIncome(id: string) {
  return useQuery({
    queryKey: financeKeys.householdIncome(id),
    queryFn: () => fetchHouseholdIncome(id),
    enabled: !!id,
  });
}

export function useHouseholdContributions(id: string) {
  return useQuery({
    queryKey: financeKeys.householdContributions(id),
    queryFn: () => fetchHouseholdContributions(id),
    enabled: !!id,
  });
}

export function useCreateHouseholdExpense(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createHouseholdExpense>[1]) => createHouseholdExpense(householdId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdExpenses(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdDashboard(householdId) });
    },
  });
}

export function useUpdateHouseholdExpense(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateHouseholdExpense>[2]) =>
      updateHouseholdExpense(householdId, householdExpenseId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdExpenseDetail(householdId, householdExpenseId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdExpenses(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
    },
  });
}

export function useDeleteHouseholdExpense(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdExpenseId: string) => deleteHouseholdExpense(householdId, householdExpenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdExpenses(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdDashboard(householdId) });
    },
  });
}

export function usePayHouseholdExpense(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (occurrenceDate: string) => payHouseholdExpense(householdId, householdExpenseId, occurrenceDate),
    onSuccess: (_data, occurrenceDate) => {
      queryClient.setQueryData(
        financeKeys.householdExpenses(householdId),
        (old: HouseholdExpenseListResponse | undefined) =>
          old
            ? {
                ...old,
                items: old.items.map((b) =>
                  b.expenseId === householdExpenseId
                    ? { ...b, callerIsPaid: true, currentOccurrenceDate: occurrenceDate }
                    : b
                ),
              }
            : old
      );
      queryClient.invalidateQueries({ queryKey: financeKeys.householdExpenseDetail(householdId, householdExpenseId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdDashboard(householdId) });
    },
  });
}

export function useUnpayHouseholdExpense(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (occurrenceDate: string) => unpayHouseholdExpense(householdId, householdExpenseId, occurrenceDate),
    onSuccess: () => {
      queryClient.setQueryData(
        financeKeys.householdExpenses(householdId),
        (old: HouseholdExpenseListResponse | undefined) =>
          old
            ? {
                ...old,
                items: old.items.map((b) =>
                  b.expenseId === householdExpenseId ? { ...b, callerIsPaid: false } : b
                ),
              }
            : old
      );
      queryClient.invalidateQueries({ queryKey: financeKeys.householdExpenseDetail(householdId, householdExpenseId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdDashboard(householdId) });
    },
  });
}

export function useAddExpenseSplit(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { membershipId: string; amount: number; currency: string }) =>
      addExpenseSplit(householdId, householdExpenseId, body),
    onSuccess: (newSplit: ExpenseSplit) => {
      queryClient.setQueryData(
        financeKeys.householdExpenseDetail(householdId, householdExpenseId),
        (old: HouseholdExpenseDetailResponse | undefined) =>
          old ? { ...old, splits: [...old.splits, newSplit] } : old
      );
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
          old ? { ...old, splits: old.splits.filter((s) => s.splitId !== splitId) } : old
      );
    },
  });
}

/**
 * Unbound version of usePayHouseholdExpense for use in the budget view where
 * householdId + billId are not known ahead of time (vary per row).
 */
export function usePayContributionSplit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, billId, occurrenceDate }: { householdId: string; billId: string; occurrenceDate: string }) =>
      payHouseholdExpense(householdId, billId, occurrenceDate),
    onSuccess: (_data, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdExpenses(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions() });
    },
  });
}

export function useUnpayContributionSplit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, billId, occurrenceDate }: { householdId: string; billId: string; occurrenceDate: string }) =>
      unpayHouseholdExpense(householdId, billId, occurrenceDate),
    onSuccess: (_data, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdExpenses(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions() });
    },
  });
}
