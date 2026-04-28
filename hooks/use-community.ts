import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCommunities,
  fetchCommunityBySlug,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  uploadCommunityImage,
  fetchMembership,
  joinCommunity,
  fetchMyMemberships,
  fetchCommunityMembers,
  appointModerator,
  removeModerator,
} from "@/lib/api/communities";
import { forumKeys } from "@/lib/query-keys";
import type { CommunityMembership } from "@/types/forum";

export function useCommunities(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: forumKeys.communities(),
    queryFn: () => fetchCommunities(page, pageSize),
  });
}

export function useCommunity(slug: string) {
  return useQuery({
    queryKey: forumKeys.community(slug),
    queryFn: () => fetchCommunityBySlug(slug),
    enabled: !!slug,
  });
}

export function useCommunityMembership(communityId: string) {
  return useQuery({
    queryKey: forumKeys.communityMembership(communityId),
    queryFn: () => fetchMembership(communityId).catch(() => null),
    staleTime: 60_000,
    enabled: !!communityId,
  });
}

export function useMyMemberships() {
  return useQuery({
    queryKey: forumKeys.memberships(),
    queryFn: fetchMyMemberships,
  });
}

export function useCommunityMembers(communityId: string) {
  return useQuery({
    queryKey: forumKeys.communityMembers(communityId),
    queryFn: () => fetchCommunityMembers(communityId),
    enabled: !!communityId,
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.communities() });
    },
  });
}

export function useUpdateCommunity(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateCommunity>[1]) =>
      updateCommunity(communityId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.communities() });
    },
  });
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (communityId: string) => deleteCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.communities() });
    },
  });
}

export function useUploadCommunityImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadCommunityImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.communities() });
    },
  });
}

export function useJoinCommunity(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinCommunity(communityId),
    onSuccess: () => {
      queryClient.setQueryData(
        forumKeys.communityMembership(communityId),
        (old: CommunityMembership | null | undefined) =>
          old ? { ...old, isMember: true } : { isMember: true }
      );
      queryClient.setQueryData(
        forumKeys.memberships(),
        (old: { items: Array<{ communityId?: string }> } | undefined) =>
          old
            ? { items: [...old.items.filter(m => m.communityId !== communityId), { communityId }] }
            : { items: [{ communityId }] }
      );
    },
  });
}

export function useAppointModerator(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => appointModerator(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.communityMembers(communityId) });
    },
  });
}

export function useRemoveModerator(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => removeModerator(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.communityMembers(communityId) });
    },
  });
}
