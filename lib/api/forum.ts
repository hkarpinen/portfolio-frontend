import { z } from "zod";
import { api } from "@/lib/api-client";
import { parsedServerFetch } from "@/lib/server-api-client";
import {
  ThreadMutationResponseSchema,
  ThreadWireSchema,
  CommentSchema,
  ThreadPageSchema,
  ProfileCommentPageSchema,
  ForumProfileSchema,
  UserCommunityItemSchema,
  SearchResultSchema,
  type Comment,
  type Thread,
} from "@/types/forum";

// ─── Threads ─────────────────────────────────────────────────────────────────

export const fetchThreads = (
  params: { communityId?: string; sort?: string; page?: number; pageSize?: number } = {},
) => {
  if (params.communityId) {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 30),
      communityId: params.communityId,
      ...(params.sort ? { sort: params.sort } : {}),
    });
    return api.parsed.get(`/api/forum/threads?${qs}`, ThreadPageSchema);
  }
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 30),
    ...(params.sort ? { sort: params.sort } : {}),
  });
  return api.parsed.get(`/api/forum/threads/feed?${qs}`, ThreadPageSchema);
};

// Thread responses carry the additional `Thread`-only convenience fields
// (body alias, commentCount, etc.) as undefined. The wire schema only checks
// the API-returned shape; we cast back to `Thread` for downstream type
// consumers that branch on the optional extras.
export const fetchThread = (threadId: string): Promise<Thread> =>
  api.parsed.get(`/api/forum/threads/${threadId}`, ThreadWireSchema) as Promise<Thread>;

export const createThread = (body: {
  communityId?: string;
  communitySlug?: string;
  title: string;
  body?: string;
  content?: string;
  flair?: string;
}) => api.parsed.post("/api/forum/threads", ThreadMutationResponseSchema, body);

// ─── Comments ────────────────────────────────────────────────────────────────

// The /comments/thread endpoint returns a tree (`rootComments` + children),
// which our consumers want flattened to a recursive Comment[]. The schema
// validates the tree shape, then a mapper rebuilds it as the Comment[] the
// rest of the app already consumes.
const CommentTreeNodeSchema: z.ZodType<{
  comment: {
    commentId: string;
    threadId: string;
    authorId?: string;
    // The wire returns `null` for absent display data; match that here so
    // the manual annotation lines up with the schema's `nullish()` output.
    authorDisplayName?: string | null;
    authorAvatarUrl?: string | null;
    content: string;
    createdAt: string;
    editedAt?: string | null;
    deletedAt?: string | null;
    parentCommentId?: string | null;
    voteScore: number;
  };
  children: Array<unknown>;
}> = z.object({
  comment: z.object({
    commentId: z.string(),
    threadId: z.string(),
    authorId: z.string().optional(),
    authorDisplayName: z.string().nullish(),
    authorAvatarUrl: z.string().nullish(),
    content: z.string(),
    createdAt: z.string(),
    editedAt: z.string().nullish(),
    deletedAt: z.string().nullish(),
    parentCommentId: z.string().nullish(),
    voteScore: z.number(),
  }),
  children: z.lazy(() => z.array(CommentTreeNodeSchema)),
});

const CommentTreeResponseSchema = z.object({
  rootComments: z.array(CommentTreeNodeSchema),
});

interface CommentTreeNode {
  comment: {
    commentId: string;
    threadId: string;
    authorId?: string;
    authorDisplayName?: string | null;
    authorAvatarUrl?: string | null;
    content: string;
    createdAt: string;
    editedAt?: string | null;
    deletedAt?: string | null;
    parentCommentId?: string | null;
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
  const data = await api.parsed.get(
    `/api/forum/comments/thread/${threadId}`,
    CommentTreeResponseSchema,
  );
  return { items: (data?.rootComments ?? []).map((n) => mapTreeNode(n as CommentTreeNode)) };
};

export const createComment = (body: {
  threadId: string;
  content: string;
  parentCommentId?: string;
}) => api.parsed.post("/api/forum/comments", CommentSchema, body);

// ─── Votes ───────────────────────────────────────────────────────────────────

export const castVote = (body: { targetType: 0 | 1; targetId: string; direction: 1 | -1 }) =>
  api.post("/api/forum/votes", body);

// ─── Search ──────────────────────────────────────────────────────────────────

const SearchResponseSchema = z.object({
  items: z.array(SearchResultSchema),
  totalCount: z.number(),
});

export const searchForum = (query: string) =>
  api.parsed.get(
    `/api/forum/search?query=${encodeURIComponent(query)}&scope=All&sort=Relevance`,
    SearchResponseSchema,
  );

// ─── Profiles ────────────────────────────────────────────────────────────────

export const fetchForumProfile = (userId: string) =>
  api.parsed.get(`/api/forum/profiles/${userId}`, ForumProfileSchema);

export const fetchProfileThreads = (userId: string, page = 1, pageSize = 20) =>
  api.parsed.get(
    `/api/forum/profiles/${userId}/threads?page=${page}&pageSize=${pageSize}`,
    ThreadPageSchema,
  );

export const fetchProfileComments = (userId: string, page = 1, pageSize = 20) =>
  api.parsed.get(
    `/api/forum/profiles/${userId}/comments?page=${page}&pageSize=${pageSize}`,
    ProfileCommentPageSchema,
  );

export const fetchProfileMemberships = (userId: string) =>
  api.parsed.get(`/api/forum/profiles/${userId}/memberships`, z.array(UserCommunityItemSchema));

// Server-side counterparts for the profile RSC (audit §3.3 — server-ifying
// the profile page). Each is the parsedServerFetch mirror of the client
// fetcher above with the same schema.
export const fetchForumProfileServer = (userId: string, cookieHeader?: string) =>
  parsedServerFetch(`/api/forum/profiles/${userId}`, ForumProfileSchema, cookieHeader);

export const fetchProfileThreadsServer = (
  userId: string,
  cookieHeader?: string,
  page = 1,
  pageSize = 20,
) =>
  parsedServerFetch(
    `/api/forum/profiles/${userId}/threads?page=${page}&pageSize=${pageSize}`,
    ThreadPageSchema,
    cookieHeader,
  );

export const fetchProfileCommentsServer = (
  userId: string,
  cookieHeader?: string,
  page = 1,
  pageSize = 20,
) =>
  parsedServerFetch(
    `/api/forum/profiles/${userId}/comments?page=${page}&pageSize=${pageSize}`,
    ProfileCommentPageSchema,
    cookieHeader,
  );

export const fetchProfileMembershipsServer = (userId: string, cookieHeader?: string) =>
  parsedServerFetch(
    `/api/forum/profiles/${userId}/memberships`,
    z.array(UserCommunityItemSchema),
    cookieHeader,
  );

const MyForumProfileSchema = z.object({
  bio: z.string().nullable().optional(),
  signature: z.string().nullable().optional(),
});

export const fetchMyForumProfile = () =>
  api.parsed.get("/api/forum/profiles/me", MyForumProfileSchema);

export const updateMyForumProfile = (payload: { bio: string | null; signature: string | null }) =>
  api.send.put("/api/forum/profiles/me", payload);

// ─── Moderation: reporting ───────────────────────────────────────────────────

export interface ReportPayload {
  reason: string;
  /** Optional free-text context. The caller should trim and treat empty as absent. */
  details?: string;
}

/**
 * Fire-and-forget: report a thread or a comment to moderators. The audit
 * (§5.4) called out that this endpoint was hit via raw `fetch()` from two
 * separate UI surfaces — routing through the typed api-client here means
 * the next backend rename surfaces via ESLint / tsc instead of as a
 * silent 404.
 */
export const reportThread = (threadId: string, payload: ReportPayload) =>
  api.send.post(`/api/forum/threads/${threadId}/report`, payload);

export const reportComment = (commentId: string, payload: ReportPayload) =>
  api.send.post(`/api/forum/comments/${commentId}/report`, payload);

// ─── Server-side (RSC) fetchers ──────────────────────────────────────────────

export const fetchThreadsServer = (
  params: { communityId?: string; sort?: string; page?: number; pageSize?: number } = {},
  cookieHeader?: string,
) => {
  if (params.communityId) {
    // Community-scoped list
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 30),
      communityId: params.communityId,
      ...(params.sort ? { sort: params.sort } : {}),
    });
    return parsedServerFetch(`/api/forum/threads?${qs}`, ThreadPageSchema, cookieHeader);
  }

  // Global feed endpoint
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 30),
    ...(params.sort ? { sort: params.sort } : {}),
  });
  return parsedServerFetch(`/api/forum/threads/feed?${qs}`, ThreadPageSchema, cookieHeader);
};

export const fetchThreadServer = (
  threadId: string,
  cookieHeader?: string,
): Promise<Thread | null> =>
  parsedServerFetch(
    `/api/forum/threads/${threadId}`,
    ThreadWireSchema,
    cookieHeader,
  ) as Promise<Thread | null>;

export const fetchCommentsServer = async (
  threadId: string,
  cookieHeader?: string,
): Promise<{ items: Comment[] }> => {
  const data = await parsedServerFetch(
    `/api/forum/comments/thread/${threadId}`,
    CommentTreeResponseSchema,
    cookieHeader,
  );
  return { items: (data?.rootComments ?? []).map((n) => mapTreeNode(n as CommentTreeNode)) };
};
