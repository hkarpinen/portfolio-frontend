import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type {
  ThreadSummaryResponse,
  ThreadMutationResponse,
  Thread,
  Comment,
  ThreadPage,
  ProfileCommentPage,
  ForumProfile,
  UserCommunityItem,
  SearchResult,
} from "@/types/forum";

// ─── Threads ─────────────────────────────────────────────────────────────────

export const fetchThreads = (params: { communityId?: string; sort?: string; page?: number; pageSize?: number } = {}) => {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 30),
    ...(params.communityId ? { communityId: params.communityId } : {}),
    ...(params.sort ? { sort: params.sort } : {}),
  });
  return api.get<ThreadPage>(`/api/forum/threads?${qs}`);
};

export const fetchThread = (threadId: string) =>
  api.get<Thread>(`/api/forum/threads/${threadId}`);

export const createThread = (body: {
  communityId?: string;
  communitySlug?: string;
  title: string;
  body?: string;
  content?: string;
  flair?: string;
}) => api.post<ThreadMutationResponse>("/api/forum/threads", body);

// ─── Comments ────────────────────────────────────────────────────────────────

interface CommentTreeNode {
  comment: {
    commentId: string;
    threadId: string;
    authorId?: string;
    authorDisplayName?: string;
    authorAvatarUrl?: string;
    content: string;
    createdAt: string;
    editedAt?: string;
    deletedAt?: string;
    parentCommentId?: string;
    voteScore: number;
  };
  children: CommentTreeNode[];
}

function mapTreeNode(node: CommentTreeNode): Comment {
  return {
    commentId: node.comment.commentId,
    threadId: node.comment.threadId,
    parentCommentId: node.comment.parentCommentId,
    authorId: node.comment.authorId,
    authorDisplayName: node.comment.authorDisplayName,
    authorAvatarUrl: node.comment.authorAvatarUrl,
    content: node.comment.content,
    createdAt: node.comment.createdAt,
    voteScore: node.comment.voteScore,
    replies: node.children.map(mapTreeNode),
  };
}

export const fetchComments = async (threadId: string): Promise<{ items: Comment[] }> => {
  const data = await api.get<{ rootComments: CommentTreeNode[] }>(`/api/forum/comments/thread/${threadId}`);
  return { items: (data?.rootComments ?? []).map(mapTreeNode) };
};

export const createComment = (body: { threadId: string; content: string; parentCommentId?: string }) =>
  api.post<Comment>("/api/forum/comments", body);

// ─── Votes ───────────────────────────────────────────────────────────────────

export const castVote = (body: { targetType: 0 | 1; targetId: string; direction: 1 | -1 }) =>
  api.post("/api/forum/votes", body);

// ─── Search ──────────────────────────────────────────────────────────────────

export const searchForum = (query: string) =>
  api.get<{ items?: SearchResult[] } | SearchResult[]>(
    `/api/forum/search?q=${encodeURIComponent(query)}&type=thread`
  );

export const searchThreads = (query: string) =>
  api.get<ThreadPage>(`/api/forum/threads/search?q=${encodeURIComponent(query)}&page=1&pageSize=20`);

// ─── Profiles ────────────────────────────────────────────────────────────────

export const fetchForumProfile = (userId: string) =>
  api.get<ForumProfile>(`/api/forum/profiles/${userId}`);

export const fetchProfileThreads = (userId: string, page = 1, pageSize = 20) =>
  api.get<ThreadPage>(`/api/forum/profiles/${userId}/threads?page=${page}&pageSize=${pageSize}`);

export const fetchProfileComments = (userId: string, page = 1, pageSize = 20) =>
  api.get<ProfileCommentPage>(`/api/forum/profiles/${userId}/comments?page=${page}&pageSize=${pageSize}`);

export const fetchProfileMemberships = (userId: string) =>
  api.get<UserCommunityItem[]>(`/api/forum/profiles/${userId}/memberships`);

// ─── Server-side (RSC) fetchers ──────────────────────────────────────────────

export const fetchThreadsServer = (
  params: { communityId?: string; sort?: string; page?: number; pageSize?: number } = {},
  cookieHeader?: string,
) => {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 30),
    ...(params.communityId ? { communityId: params.communityId } : {}),
    ...(params.sort ? { sort: params.sort } : {}),
  });
  return serverFetch<ThreadPage>(`/api/forum/threads?${qs}`, cookieHeader);
};

export const fetchThreadServer = (threadId: string, cookieHeader?: string) =>
  serverFetch<Thread>(`/api/forum/threads/${threadId}`, cookieHeader);

export const fetchCommentsServer = async (threadId: string, cookieHeader?: string): Promise<{ items: Comment[] }> => {
  const data = await serverFetch<{ rootComments: CommentTreeNode[] }>(
    `/api/forum/comments/thread/${threadId}`,
    cookieHeader,
  );
  return { items: (data?.rootComments ?? []).map(mapTreeNode) };
};
