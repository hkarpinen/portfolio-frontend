import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
  fetchThreads,
  fetchThread,
  createThread,
  fetchComments,
  createComment,
  castVote,
  searchForum,
  fetchForumProfile,
  fetchProfileThreads,
  fetchProfileComments,
  fetchProfileMemberships,
} from "@/lib/api/forum";
import { forumKeys } from "@/lib/query-keys";
import type { CommunityMembership } from "@/types/api";

// ─── Read hooks ────────────────────────────────────────────────────────────────

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

export function useThreads(params: { communityId?: string; sort?: string; page?: number } = {}) {
  return useQuery({
    queryKey: forumKeys.threads(params.communityId, params.sort),
    queryFn: () => fetchThreads(params),
  });
}

export function useThread(threadId: string) {
  return useQuery({
    queryKey: forumKeys.thread(threadId),
    queryFn: () => fetchThread(threadId),
    enabled: !!threadId,
  });
}

export function useComments(threadId: string) {
  return useQuery({
    queryKey: forumKeys.comments(threadId),
    queryFn: () => fetchComments(threadId),
    enabled: !!threadId,
  });
}


// ─── Mutation hooks ────────────────────────────────────────────────────────────

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
      // Update the memberships list so community cards reflect the join
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

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThread,
    onSuccess: () => {
      // Bust all thread lists; individual community caches will revalidate on
      // next access. The mutation response is ThreadMutationResponse which does
      // not carry communityId, so we invalidate broadly.
      queryClient.invalidateQueries({ queryKey: forumKeys.threads() });
    },
  });
}

export function useCreateComment(threadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Parameters<typeof createComment>[0], "threadId">) =>
      createComment({ ...body, threadId }),    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.comments(threadId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.thread(threadId) });
    },
  });
}

// Extracted helper so the invalidation + router refresh side-effect is named,
// discoverable, and consistent if other mutations ever need the same pattern.
function invalidateVoteTargets(
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>,
  threadId: string,
  vars: Parameters<typeof castVote>[0]
) {
  if (vars.targetType === 0) {
    queryClient.invalidateQueries({ queryKey: forumKeys.thread(vars.targetId) });
  } else {
    queryClient.invalidateQueries({ queryKey: forumKeys.comments(threadId) });
  }
  // router.refresh() re-renders parent Server Components so vote scores
  // fetched server-side (e.g. thread detail page) pick up the new value.
  router.refresh();
}

export function useCastVote(threadId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: castVote,
    onSuccess: (_, vars) => invalidateVoteTargets(queryClient, router, threadId, vars),
  });
}

export function useForumSearch(query: string) {
  return useQuery({
    queryKey: forumKeys.search(query),
    queryFn: () => searchForum(query),
    enabled: query.trim().length > 0,
    staleTime: 10_000,
  });
}

export function useForumProfile(userId: string) {
  return useQuery({
    queryKey: forumKeys.profile(userId),
    queryFn: () => fetchForumProfile(userId),
    enabled: !!userId,
  });
}

export function useProfileThreads(userId: string, page = 1) {
  return useQuery({
    queryKey: forumKeys.profileThreads(userId),
    queryFn: () => fetchProfileThreads(userId, page),
    enabled: !!userId,
  });
}

export function useProfileMemberships(userId: string) {
  return useQuery({
    queryKey: forumKeys.profileMemberships(userId),
    queryFn: () => fetchProfileMemberships(userId),
    enabled: !!userId,
  });
}

export function useProfileComments(userId: string, page = 1) {
  return useQuery({
    queryKey: [...forumKeys.profile(userId), "comments", page],
    queryFn: () => fetchProfileComments(userId, page),
    enabled: !!userId,
  });
}