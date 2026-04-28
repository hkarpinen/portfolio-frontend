export interface CommunityActivitySnapshot {
  threadId: string;
  threadTitle: string;
  threadCreatedAt: string;
  hotScore: number;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  latestReplyAt?: string;
  latestReplyAuthorDisplayName?: string;
  latestReplyAuthorAvatarUrl?: string;
}

export interface CommunitySummaryResponse {
  communityId: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  icon?: string;
  visibility?: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
  memberCount: number;
  threadCount: number;
  commentCount: number;
  latestActivity?: CommunityActivitySnapshot;
}

export interface CommunityDetailResponse extends CommunitySummaryResponse {
  latestActivity?: CommunityActivitySnapshot;
}

export interface Community {
  communityId: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  latestActivity?: CommunityActivitySnapshot;
  // Fields not returned by the API — always undefined at runtime:
  memberCount?: number;   // not in CommunityResponse
  threadCount?: number;   // not in CommunityResponse
  privacy?: string;       // use visibility instead
  requireFlair?: boolean; // not in CommunityResponse
}

export interface Thread {
  threadId: string;
  title: string;
  content?: string;
  authorId?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  communityId?: string;
  voteScore?: number;
  hotScore?: number;
  createdAt: string;
  editedAt?: string;
  isLocked?: boolean;
  isPinned?: boolean;
  deletedAt?: string;
  // Fields not returned by the API — always undefined at runtime:
  body?: string;           // use content instead
  authorUsername?: string; // not in ThreadResponse
  communityName?: string;  // not in ThreadResponse
  communitySlug?: string;  // not in ThreadResponse
  flair?: string;          // not in ThreadResponse
  commentCount?: number;   // not in ThreadResponse
}

export interface Comment {
  commentId: string;
  threadId: string;
  parentCommentId?: string;
  authorId?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  content: string;
  voteScore?: number;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
  replies?: Comment[];
  // Not in CommentResponse — always undefined at runtime:
  authorUsername?: string;
}

export interface CommunityMembership {
  isMember: boolean;
  role?: string;
  communityId?: string;
}

export interface ModQueueItem {
  reportId: string;
  type: string;
  targetId: string;
  reason?: string;
  createdAt: string;
}

export interface ModLogEntry {
  logId: string;
  action: string;
  targetId?: string;
  modId?: string;
  modName?: string;
  createdAt: string;
}

export interface CommunityMemberItem {
  membershipId: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  joinedAt: string;
}

export interface ForumProfile {
  userId: string;
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  signature?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UserCommunityItem {
  membershipId: string;
  communityId: string;
  communityName: string;
  communitySlug: string;
  communityImageUrl?: string | null;
  role: string;
  joinedAt: string;
}

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

export interface ThreadMutationResponse {
  threadId: string;
  isLocked: boolean;
  isPinned: boolean;
  editedAt?: string;
  deletedAt?: string;
}

/** A thread row returned in list projections — no Content field. */
export interface ThreadSummaryResponse {
  threadId: string;
  communityId: string;
  communitySlug?: string;
  communityName?: string;
  authorId: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  title: string;
  createdAt: string;
  hotScore: number;
  voteScore: number;
  commentCount?: number;
  isPinned?: boolean;
  flair?: string;
}

export interface CommunityPage {
  items: CommunitySummaryResponse[];
  total?: number;
}

export interface ThreadPage {
  items: ThreadSummaryResponse[];
  total?: number;
}

export interface ProfileCommentSummary {
  commentId: string;
  threadId: string;
  threadTitle: string;
  communitySlug: string;
  communityName: string;
  content: string;
  createdAt: string;
  voteScore: number;
}

export interface ProfileCommentPage {
  items: ProfileCommentSummary[];
  totalCount: number;
}
