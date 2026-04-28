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
  updateBill,
  createHousehold,
  updateHousehold,
  joinHousehold,
  generateInvite,
  removeMember,
  changeMemberRole,
  fetchHouseholdIncome,
  fetchIncome,
  createIncomeSource,
  deleteIncomeSource,
  fetchHouseholdContributions,
  deleteHousehold,
  transferOwnership,
  fetchPersonalBills,
  createPersonalBill,
  updatePersonalBill,
  deletePersonalBill,
} from "@/lib/api/bills";
import { billsKeys } from "@/lib/query-keys";
import type { BillPageResponse, BillSplit, PersonalBillPage, IncomePage } from "@/types/api";

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

export function useIncome(initialData?: IncomePage) {
  return useQuery({
    queryKey: billsKeys.income(),
    queryFn: fetchIncome,
    initialData,
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
      queryClient.invalidateQueries({ queryKey: billsKeys.households() });
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
      queryClient.invalidateQueries({ queryKey: billsKeys.contributions(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.householdDashboard(householdId) });
    },
  });
}

export function useChangeMemberRole(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: string }) =>
      changeMemberRole(householdId, membershipId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.householdMembers(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.householdDetail(householdId) });
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

export function useCreateIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIncomeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.income() });
      queryClient.invalidateQueries({ queryKey: billsKeys.contributions() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
    },
  });
}

export function useDeleteIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incomeId: string) => deleteIncomeSource(incomeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.income() });
      queryClient.invalidateQueries({ queryKey: billsKeys.contributions() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
    },
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

export function useDeleteHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdId: string) => deleteHousehold(householdId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.households() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
    },
  });
}

export function useTransferOwnership(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerId: string) => transferOwnership(householdId, newOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.householdDetail(householdId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.householdMembers(householdId) });
    },
  });
}

// ─── Personal Bills ────────────────────────────────────────────────────────────

export function usePersonalBills(initialData?: PersonalBillPage) {
  return useQuery({
    queryKey: billsKeys.personalBills(),
    queryFn: fetchPersonalBills,
    initialData,
  });
}

export function useCreatePersonalBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPersonalBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.personalBills() });
    },
  });
}

export function useUpdatePersonalBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updatePersonalBill>[1] }) =>
      updatePersonalBill(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.personalBills() });
    },
  });
}

export function useDeletePersonalBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePersonalBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.personalBills() });
    },
  });
}
