import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCommunities,
  fetchCommunityBySlug,
  createCommunity,
  updateCommunity,
  fetchMembership,
  joinCommunity,
  fetchMyMemberships,
  fetchThreads,
  fetchThread,
  createThread,
  fetchComments,
  createComment,
  castVote,
  searchForum,
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

export function useSearchThreads(query: string) {
  return useQuery({
    queryKey: forumKeys.search(query),
    queryFn: () => searchForum(query),
    enabled: query.trim().length > 0,
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
    onSuccess: (thread) => {
      if (thread.communityId) {
        queryClient.invalidateQueries({ queryKey: forumKeys.threads(thread.communityId) });
      }
      if (thread.communitySlug) {
        queryClient.invalidateQueries({ queryKey: forumKeys.threads(thread.communitySlug) });
      }
    },
  });
}

export function useCreateComment(threadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Parameters<typeof createComment>[0], "threadId">) =>
      createComment({ ...body, threadId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.comments(threadId) });
    },
  });
}

export function useCastVote() {
  return useMutation({
    mutationFn: castVote,
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
