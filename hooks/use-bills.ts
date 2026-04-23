import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOverview,
  fetchHousehold,
  fetchHouseholdDetail,
  fetchHouseholdMembers,
  fetchBillDetail,
  deleteBill,
  payBill,
  addSplit,
  removeSplit,
  createBill,
  createHousehold,
  updateHousehold,
  joinHousehold,
  generateInvite,
  removeMember,
  fetchHouseholdIncome,
  createIncomeSource,
  fetchHouseholdContributions,
  deleteHousehold,
  transferOwnership,
} from "@/lib/api/bills";
import { billsKeys } from "@/lib/query-keys";
import type { BillPageResponse, BillSplit } from "@/types/api";

// ─── Read hooks ────────────────────────────────────────────────────────────────

export function useOverview() {
  return useQuery({
    queryKey: billsKeys.overview(),
    queryFn: fetchOverview,
  });
}

export function useHousehold(id: string) {
  return useQuery({
    queryKey: billsKeys.household(id),
    queryFn: () => fetchHousehold(id),
    enabled: !!id,
  });
}

export function useHouseholdDetail(id: string) {
  return useQuery({
    queryKey: billsKeys.householdDetail(id),
    queryFn: () => fetchHouseholdDetail(id),
    enabled: !!id,
  });
}

export function useHouseholdMembers(id: string) {
  return useQuery({
    queryKey: billsKeys.householdMembers(id),
    queryFn: () => fetchHouseholdMembers(id),
    enabled: !!id,
  });
}

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

// ─── Mutation hooks ────────────────────────────────────────────────────────────

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHousehold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.households() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
    },
  });
}

export function useUpdateHousehold(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateHousehold>[1]) =>
      updateHousehold(householdId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.household(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.householdDetail(householdId) });
    },
  });
}

export function useJoinHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationCode: string) => joinHousehold(invitationCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.households() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
    },
  });
}

export function useGenerateInvite(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof generateInvite>[1]) =>
      generateInvite(householdId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.householdMembers(householdId) });
    },
  });
}

export function useRemoveMember(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof removeMember>[1]) =>
      removeMember(householdId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.householdMembers(householdId) });
    },
  });
}

export function useDeleteBill(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => deleteBill(householdId, billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.bills(householdId) });
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

export function useCreateIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIncomeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.income() });
    },
  });
}

export function useCreateBill(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createBill>[1]) => createBill(householdId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.bills(householdId) });
    },
  });
}

export function useDeleteHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdId: string) => deleteHousehold(householdId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.households() });
    },
  });
}

export function useTransferOwnership(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerId: string) => transferOwnership(householdId, newOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.householdDetail(householdId) });
    },
  });
}
