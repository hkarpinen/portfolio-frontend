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
import { financeKeys } from "@/lib/query-keys";

export function useOverview() {
  return useQuery({
    queryKey: financeKeys.overview(),
    queryFn: fetchOverview,
    staleTime: 60_000,
  });
}

export function useHousehold(id: string) {
  return useQuery({
    queryKey: financeKeys.household(id),
    queryFn: () => fetchHousehold(id),
    staleTime: 60_000,
    enabled: !!id,
  });
}

export function useHouseholdDetail(id: string) {
  return useQuery({
    queryKey: financeKeys.householdDetail(id),
    queryFn: () => fetchHouseholdDetail(id),
    staleTime: 60_000,
    enabled: !!id,
  });
}

export function useHouseholdMembers(id: string) {
  return useQuery({
    queryKey: financeKeys.householdMembers(id),
    queryFn: () => fetchHouseholdMembers(id),
    staleTime: 60_000,
    enabled: !!id,
  });
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHousehold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.households() });
      queryClient.invalidateQueries({ queryKey: financeKeys.overview() });
    },
  });
}

export function useUpdateHousehold(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateHousehold>[1]) =>
      updateHousehold(householdId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.households() });
      queryClient.invalidateQueries({ queryKey: financeKeys.household(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdDetail(householdId) });
    },
  });
}

export function useDeleteHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdId: string) => deleteHousehold(householdId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.households() });
      queryClient.invalidateQueries({ queryKey: financeKeys.overview() });
    },
  });
}

export function useJoinHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationCode: string) => joinHousehold(invitationCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.households() });
      queryClient.invalidateQueries({ queryKey: financeKeys.overview() });
    },
  });
}

export function useGenerateInvite(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateInvite(householdId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdMembers(householdId) });
    },
  });
}

export function useRemoveMember(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) =>
      removeMember(householdId, membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdMembers(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdDashboard(householdId) });
    },
  });
}

export function useChangeMemberRole(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: string }) =>
      changeMemberRole(householdId, membershipId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdMembers(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdDetail(householdId) });
    },
  });
}

export function useTransferOwnership(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerId: string) => transferOwnership(householdId, newOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.householdDetail(householdId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdMembers(householdId) });
    },
  });
}
