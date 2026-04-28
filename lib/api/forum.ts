import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type {
  CommunitySummaryResponse,
  CommunityDetailResponse,
  ThreadSummaryResponse,
  ThreadMutationResponse,
  Thread,
  CommunityMembership,
  CommunityMemberItem,
  CommunityPage,
  ThreadPage,
  ProfileCommentPage,
  ForumProfile,
  UserCommunityItem,
  SearchResult,
  Comment,
} from "@/types/api";

export const uploadCommunityImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<{ url: string }>("/api/forum/media/image", formData);
};

// ─── Communities ───────────────────────────────────────────────────────────────

export const fetchCommunities = (page = 1, pageSize = 20) =>
  api.get<CommunityPage>(`/api/forum/communities?page=${page}&pageSize=${pageSize}`);

export const fetchCommunityBySlug = (slug: string) =>
  api.get<CommunityDetailResponse>(`/api/forum/communities/by-slug/${slug}`);

export const createCommunity = (body: { name: string; description?: string; privacy?: string; imageUrl?: string }) =>
  api.post<CommunityDetailResponse>("/api/forum/communities", body);

export const updateCommunity = (communityId: string, body: Partial<CommunitySummaryResponse>) =>
  api.put<CommunityDetailResponse>(`/api/forum/communities/${communityId}`, body);

export const deleteCommunity = (communityId: string) =>
  api.delete<void>(`/api/forum/communities/${communityId}`);

export const fetchMembership = (communityId: string) =>
  api.get<CommunityMembership>(`/api/forum/communities/${communityId}/membership`);

export const joinCommunity = (communityId: string) =>
  api.post(`/api/forum/communities/${communityId}/join`);

export const fetchMyMemberships = () =>
  api.get<{ items: Array<{ communityId?: string }> }>("/api/forum/memberships");

export const fetchCommunityMembers = (communityId: string) =>
  api.get<CommunityMemberItem[]>(`/api/forum/communities/${communityId}/members`);

export const appointModerator = (membershipId: string) =>
  api.post(`/api/forum/memberships/${membershipId}/moderator`, {});

export const removeModerator = (membershipId: string) =>
  api.delete(`/api/forum/memberships/${membershipId}/moderator`);

// ─── Threads ───────────────────────────────────────────────────────────────────

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

// ─── Comments ──────────────────────────────────────────────────────────────────

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

// ─── Votes ─────────────────────────────────────────────────────────────────────

export const castVote = (body: { targetType: 0 | 1; targetId: string; direction: 1 | -1 }) =>
  api.post("/api/forum/votes", body);

// ─── Search ────────────────────────────────────────────────────────────────────

export const searchForum = (query: string) =>
  api.get<{ items?: SearchResult[] } | SearchResult[]>(
    `/api/forum/search?q=${encodeURIComponent(query)}&type=thread`
  );

export const searchThreads = (query: string) =>
  api.get<ThreadPage>(`/api/forum/threads/search?q=${encodeURIComponent(query)}&page=1&pageSize=20`);

// ─── Profiles ──────────────────────────────────────────────────────────────────

export const fetchForumProfile = (userId: string) =>
  api.get<ForumProfile>(`/api/forum/profiles/${userId}`);

export const fetchProfileThreads = (userId: string, page = 1, pageSize = 20) =>
  api.get<ThreadPage>(`/api/forum/profiles/${userId}/threads?page=${page}&pageSize=${pageSize}`);

export const fetchProfileComments = (userId: string, page = 1, pageSize = 20) =>
  api.get<ProfileCommentPage>(`/api/forum/profiles/${userId}/comments?page=${page}&pageSize=${pageSize}`);

export const fetchProfileMemberships = (userId: string) =>
  api.get<UserCommunityItem[]>(`/api/forum/profiles/${userId}/memberships`);

// ─── Server-side (RSC) fetchers ───────────────────────────────────────────────
// These use SERVER_API + cookie forwarding for use in React Server Components.
// The browser `api` client cannot be used in server components.

export const fetchCommunitiesServer = (
  cookieHeader?: string,
  page = 1,
  pageSize = 20,
) =>
  serverFetch<CommunityPage>(
    `/api/forum/communities?page=${page}&pageSize=${pageSize}`,
    cookieHeader,
  );

export const fetchCommunityBySlugServer = (
  slug: string,
  cookieHeader?: string,
) =>
  serverFetch<CommunityDetailResponse>(
    `/api/forum/communities/by-slug/${slug}`,
    cookieHeader,
  );

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

export const fetchMyMembershipsServer = (cookieHeader: string) =>
  serverFetch<{ items: Array<{ communityId?: string }> }>(
    "/api/forum/memberships",
    cookieHeader,
  );

export const fetchMembershipServer = (
  communityId: string,
  cookieHeader: string,
) =>
  serverFetch<CommunityMembership>(
    `/api/forum/communities/${communityId}/membership`,
    cookieHeader,
  );
