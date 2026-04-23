import { api } from "@/lib/api-client";
import type { Community, Thread, Comment, CommunityMembership } from "@/types/api";

// ─── Communities ───────────────────────────────────────────────────────────────

export interface CommunityPage {
  items: Community[];
  total?: number;
}

export const fetchCommunities = (page = 1, pageSize = 20) =>
  api.get<CommunityPage>(`/api/forum/communities?page=${page}&pageSize=${pageSize}`);

export const fetchCommunityBySlug = (slug: string) =>
  api.get<Community>(`/api/forum/communities/by-name/${encodeURIComponent(slug)}`);

export const createCommunity = (body: { name: string; description?: string; privacy?: string }) =>
  api.post<Community>("/api/forum/communities", body);

export const updateCommunity = (communityId: string, body: Partial<Community>) =>
  api.put<Community>(`/api/forum/communities/${communityId}`, body);

export const fetchMembership = (communityId: string) =>
  api.get<CommunityMembership>(`/api/forum/communities/${communityId}/membership`);

export const joinCommunity = (communityId: string) =>
  api.post(`/api/forum/communities/${communityId}/join`);

export const fetchMyMemberships = () =>
  api.get<{ items: Array<{ communityId?: string }> }>("/api/forum/memberships");

// ─── Threads ───────────────────────────────────────────────────────────────────

export interface ThreadPage {
  items: Thread[];
  total?: number;
}

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
}) => api.post<Thread>("/api/forum/threads", body);

// ─── Comments ──────────────────────────────────────────────────────────────────

export const fetchComments = (threadId: string) =>
  api.get<{ items: Comment[] }>(`/api/forum/comments?threadId=${threadId}&page=1&pageSize=100`);

export const createComment = (body: { threadId: string; content: string; parentCommentId?: string }) =>
  api.post<Comment>("/api/forum/comments", body);

// ─── Votes ─────────────────────────────────────────────────────────────────────

export const castVote = (body: { targetType: 0 | 1; targetId: string; direction: 1 | -1 }) =>
  api.post("/api/forum/votes", body);

// ─── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: "thread" | "community";
  title?: string;
  name?: string;
  slug?: string;
  communitySlug?: string;
  excerpt?: string;
  score?: number;
}

export const searchForum = (query: string) =>
  api.get<{ items?: SearchResult[] } | SearchResult[]>(
    `/api/forum/search?q=${encodeURIComponent(query)}&type=thread`
  );

export const searchThreads = (query: string) =>
  api.get<ThreadPage>(`/api/forum/threads/search?q=${encodeURIComponent(query)}&page=1&pageSize=20`);
