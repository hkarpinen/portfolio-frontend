import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOverview,
  fetchHousehold,
  fetchHouseholdDetail,
  fetchHouseholdMembers,
  createHousehold,
  updateHousehold,
  joinHousehold,
  generateInvite,
  removeMember,
  changeMemberRole,
  deleteHousehold,
  transferOwnership,
} from "@/lib/api/households";
import { billsKeys } from "@/lib/query-keys";

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
