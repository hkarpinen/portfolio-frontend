import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchContributionSummary,
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
import {
  invalidateAllHouseholds,
  invalidateHouseholdMembers,
  invalidateHouseholdMetadata,
} from "@/lib/cache-invalidation";
import type { ContributionPeriod } from "@/types/contributions";

export function useOverview(initialData?: ContributionPeriod[]) {
  return useQuery({
    queryKey: financeKeys.householdContributions(),
    queryFn: () => fetchContributionSummary(),
    staleTime: 60_000,
    initialData,
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
    onSuccess: () => invalidateAllHouseholds(queryClient),
  });
}

export function useUpdateHousehold(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateHousehold>[1]) => updateHousehold(householdId, body),
    onSuccess: () => invalidateHouseholdMetadata(queryClient, householdId),
  });
}

export function useDeleteHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdId: string) => deleteHousehold(householdId),
    onSuccess: () => invalidateAllHouseholds(queryClient),
  });
}

export function useJoinHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationCode: string) => joinHousehold(invitationCode),
    onSuccess: () => invalidateAllHouseholds(queryClient),
  });
}

export function useGenerateInvite(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipientEmail?: string) => generateInvite(householdId, recipientEmail),
    onSuccess: () => {
      // Invite generation only changes the members list (a code appears on
      // their row); no projections to refresh.
      queryClient.invalidateQueries({ queryKey: financeKeys.householdMembers(householdId) });
    },
  });
}

export function useRemoveMember(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => removeMember(householdId, membershipId),
    onSuccess: () => invalidateHouseholdMembers(queryClient, householdId),
  });
}

export function useChangeMemberRole(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: string }) =>
      changeMemberRole(householdId, membershipId, role),
    onSuccess: () => invalidateHouseholdMembers(queryClient, householdId),
  });
}

export function useTransferOwnership(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerId: string) => transferOwnership(householdId, newOwnerId),
    onSuccess: () => invalidateHouseholdMembers(queryClient, householdId),
  });
}
