import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
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
  fetchMyForumProfile,
  updateMyForumProfile,
  reportThread,
  reportComment,
  type ReportPayload,
} from "@/lib/api/forum";
import { forumKeys } from "@/lib/query-keys";

export function useThreads(params: { communityId?: string; sort?: string; page?: number } = {}) {
  return useQuery({
    queryKey: forumKeys.threads(params.communityId, params.sort),
    queryFn: () => fetchThreads(params),
    staleTime: 60_000,
  });
}

export function useThread(threadId: string) {
  return useQuery({
    queryKey: forumKeys.thread(threadId),
    queryFn: () => fetchThread(threadId),
    staleTime: 60_000,
    enabled: !!threadId,
  });
}

export function useComments(threadId: string) {
  return useQuery({
    queryKey: forumKeys.comments(threadId),
    queryFn: () => fetchComments(threadId),
    staleTime: 60_000,
    enabled: !!threadId,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.threads() });
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
      queryClient.invalidateQueries({ queryKey: forumKeys.thread(threadId) });
    },
  });
}

function invalidateVoteTargets(
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>,
  threadId: string,
  vars: Parameters<typeof castVote>[0],
) {
  if (vars.targetType === 0) {
    queryClient.invalidateQueries({ queryKey: forumKeys.thread(vars.targetId) });
  } else {
    queryClient.invalidateQueries({ queryKey: forumKeys.comments(threadId) });
  }
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

// ─── My forum profile (settings page) ─────────────────────────────────────────

export function useMyForumProfile() {
  return useQuery({
    queryKey: forumKeys.myProfile(),
    queryFn: fetchMyForumProfile,
    staleTime: 60_000,
  });
}

export function useUpdateMyForumProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyForumProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.myProfile() });
    },
  });
}

// ─── Moderation: report ──────────────────────────────────────────────────────

/**
 * Fire-and-forget report submission for a thread or a comment.
 *
 * Both UI surfaces (`<ReportButton>` and `<ThreadActions>` per the audit
 * §5.4) call this hook so the api-client envelope (auth, error handling,
 * eslint-banned-generic protection) is shared. The mutation does not
 * invalidate any cache — reports don't surface back to the reporter.
 */
export function useReportContent(kind: "thread" | "comment", targetId: string) {
  return useMutation({
    mutationFn: (payload: ReportPayload) =>
      kind === "thread" ? reportThread(targetId, payload) : reportComment(targetId, payload),
  });
}
