import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
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
  settleUpTransfer,
  createHouseholdExpense,
  updateHouseholdExpense,
  markVendorPaid,
  markVendorUnpaid,
} from "@/lib/api/household-expenses";
import { fetchHouseholdContributions, assignHouseholdAllocation } from "@/lib/api/households";
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

/** Optimistically flip `charge.vendorPaid` in the cached charge detail. vendorPaid is ledger-derived
 *  (~1–2s outbox lag), so patching the cache lets the detail page react instantly instead of waiting
 *  for the LedgerPostingConsumer to post — without an immediate refetch that would read back stale. */
function patchDetailVendorPaid(
  queryClient: QueryClient,
  householdId: string,
  householdExpenseId: string,
  vendorPaid: boolean,
) {
  queryClient.setQueryData(
    financeKeys.householdExpenseDetail(householdId, householdExpenseId),
    (old: HouseholdExpenseDetailResponse | undefined) =>
      old ? { ...old, charge: { ...old.charge, vendorPaid } } : old,
  );
}

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
                  b.chargeId === householdExpenseId
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
                  b.chargeId === householdExpenseId ? { ...b, isPaid: false } : b,
                ),
              }
            : old,
      );
      invalidateHouseholdExpenseDetail(queryClient, householdId, householdExpenseId);
    },
  });
}

/** Mark the VENDOR paid (the bill itself), choosing who paid now. Flips the bill to paid and
 *  refreshes the list/detail + balances + ledger (member shares become settleable). */
export function useMarkVendorPaid(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (occurrenceDate: string) =>
      markVendorPaid(householdId, householdExpenseId, occurrenceDate),
    onSuccess: () => {
      queryClient.setQueryData(
        financeKeys.householdExpenses(householdId),
        (old: HouseholdExpenseListResponse | undefined) =>
          old
            ? {
                ...old,
                items: old.items.map((b) =>
                  b.chargeId === householdExpenseId ? { ...b, vendorPaid: true } : b,
                ),
              }
            : old,
      );
      // Optimistically flip the detail's vendorPaid so the panel + the payer's fronted share update
      // instantly. We deliberately do NOT invalidate the detail here: vendorPaid is ledger-derived
      // and the LedgerPostingConsumer hasn't posted yet (~1–2s outbox lag), so an immediate refetch
      // would read back false and revert the UI. The optimistic value is what the ledger converges
      // to; staleTime / navigation reconciles it.
      patchDetailVendorPaid(queryClient, householdId, householdExpenseId, true);
      queryClient.invalidateQueries({ queryKey: financeKeys.householdBalances(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.groupLedger(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.accountStatements(householdId) });
    },
  });
}

/** Undo a vendor payment — back to upcoming/unpaid. */
export function useMarkVendorUnpaid(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (occurrenceDate: string) =>
      markVendorUnpaid(householdId, householdExpenseId, occurrenceDate),
    onSuccess: () => {
      queryClient.setQueryData(
        financeKeys.householdExpenses(householdId),
        (old: HouseholdExpenseListResponse | undefined) =>
          old
            ? {
                ...old,
                items: old.items.map((b) =>
                  b.chargeId === householdExpenseId ? { ...b, vendorPaid: false } : b,
                ),
              }
            : old,
      );
      patchDetailVendorPaid(queryClient, householdId, householdExpenseId, false);
      queryClient.invalidateQueries({ queryKey: financeKeys.householdBalances(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.groupLedger(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.accountStatements(householdId) });
    },
  });
}

export function useAddExpenseSplit(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { userId: string; amount: number; currency: string }) =>
      addExpenseSplit(householdId, householdExpenseId, body),
    onSuccess: (newSplit: ExpenseSplit) => {
      // Optimistic append on the detail cache; full invalidation rebuilds the
      // balances + dashboard projections that depend on the split set.
      queryClient.setQueryData(
        financeKeys.householdExpenseDetail(householdId, householdExpenseId),
        (old: HouseholdExpenseDetailResponse | undefined) =>
          old ? { ...old, allocations: [...old.allocations, newSplit] } : old,
      );
      invalidateHouseholdExpenseDetail(queryClient, householdId, householdExpenseId);
    },
  });
}

/**
 * Assign ANOTHER member's split via the household service (role-gated: Owner/Admin only). This is
 * the async, no-service-to-service path: household authorizes and emits an event finance applies a
 * moment later, so we invalidate now and again after the event has likely landed. Use
 * {@link useAddExpenseSplit} for the caller's OWN split (synchronous, direct to finance).
 */
export function useAssignHouseholdAllocation(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { userId: string; amount: number; currency: string }) =>
      assignHouseholdAllocation(householdId, householdExpenseId, body),
    onSuccess: () => {
      invalidateHouseholdExpenseDetail(queryClient, householdId, householdExpenseId);
      // The allocation lands asynchronously once finance consumes the event; reconcile shortly.
      setTimeout(
        () => invalidateHouseholdExpenseDetail(queryClient, householdId, householdExpenseId),
        2500,
      );
    },
  });
}

/** Record the caller settling up with another member (caller = payer). Refreshes balances + ledger. */
export function useSettleUpTransfer(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { toUserId: string; amount: number; currency: string }) =>
      settleUpTransfer(householdId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdBalances(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.groupLedger(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.accountStatements(householdId) });
    },
  });
}

export function useRemoveExpenseSplit(householdId: string, householdExpenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (allocationId: string) => removeSplit(householdId, householdExpenseId, allocationId),
    onSuccess: (_: unknown, allocationId: string) => {
      queryClient.setQueryData(
        financeKeys.householdExpenseDetail(householdId, householdExpenseId),
        (old: HouseholdExpenseDetailResponse | undefined) =>
          old ? { ...old, allocations: old.allocations.filter((s) => s.allocationId !== allocationId) } : old,
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

