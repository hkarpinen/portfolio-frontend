import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBillDetail,
  deleteBill,
  payBill,
  addSplit,
  removeSplit,
  createBill,
  updateBill,
} from "@/lib/api/bills";
import { fetchHouseholdIncome } from "@/lib/api/income";
import { fetchHouseholdContributions } from "@/lib/api/households";
import { billsKeys } from "@/lib/query-keys";
import type { BillPageResponse, BillSplit } from "@/types/bills";

export function useBillDetail(householdId: string, billId: string) {
  return useQuery({
    queryKey: billsKeys.billDetail(householdId, billId),
    queryFn: () => fetchBillDetail(householdId, billId),
    enabled: !!householdId && !!billId,
  });
}

export function useHouseholdIncome(id: string) {
  return useQuery({
    queryKey: billsKeys.householdIncome(id),
    queryFn: () => fetchHouseholdIncome(id),
    enabled: !!id,
  });
}

export function useHouseholdContributions(id: string) {
  return useQuery({
    queryKey: billsKeys.contributions(id),
    queryFn: () => fetchHouseholdContributions(id),
    enabled: !!id,
  });
}

export function useCreateBill(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createBill>[1]) => createBill(householdId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.bills(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
      queryClient.invalidateQueries({ queryKey: billsKeys.householdDashboard(householdId) });
    },
  });
}

export function useUpdateBill(householdId: string, billId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateBill>[2]) =>
      updateBill(householdId, billId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.billDetail(householdId, billId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.bills(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
      queryClient.invalidateQueries({ queryKey: billsKeys.contributions(householdId) });
    },
  });
}

export function useDeleteBill(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => deleteBill(householdId, billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.bills(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
      queryClient.invalidateQueries({ queryKey: billsKeys.contributions(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.householdDashboard(householdId) });
    },
  });
}

export function usePayBill(householdId: string, billId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => payBill(householdId, billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.billDetail(householdId, billId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.bills(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
      queryClient.invalidateQueries({ queryKey: billsKeys.contributions(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.householdDashboard(householdId) });
    },
  });
}

export function useAddSplit(householdId: string, billId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { membershipId: string; amount: number; currency: string }) =>
      addSplit(householdId, billId, body),
    onSuccess: (newSplit: BillSplit) => {
      queryClient.setQueryData(
        billsKeys.billDetail(householdId, billId),
        (old: BillPageResponse | undefined) =>
          old ? { ...old, splits: [...old.splits, newSplit] } : old
      );
    },
  });
}

export function useRemoveSplit(householdId: string, billId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (splitId: string) => removeSplit(householdId, billId, splitId),
    onSuccess: (_: unknown, splitId: string) => {
      queryClient.setQueryData(
        billsKeys.billDetail(householdId, billId),
        (old: BillPageResponse | undefined) =>
          old ? { ...old, splits: old.splits.filter((s) => s.splitId !== splitId) } : old
      );
    },
  });
}
