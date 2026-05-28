import { z } from "zod";

// ── Forum domain enums ───────────────────────────────────────────────────────
// Mirror forum/src/Domain/ValueObjects/. Per `[[finance-publishes-domain-events-directly]]`,
// consumers declare matching types in their own namespace.

export enum CommunityRole {
  Member = "Member",
  Moderator = "Moderator",
  Owner = "Owner",
}

export const CommunityRoleSchema = z.nativeEnum(CommunityRole);

export enum CommunityVisibility {
  Public = "Public",
  Private = "Private",
  Restricted = "Restricted",
}

export const CommunityVisibilitySchema = z.nativeEnum(CommunityVisibility);

export enum ReportTargetType {
  Thread = "Thread",
  Comment = "Comment",
  User = "User",
}

export const ReportTargetTypeSchema = z.nativeEnum(ReportTargetType);

export enum ModerationAction {
  BanUser = "BanUser",
  UnbanUser = "UnbanUser",
  DeleteThread = "DeleteThread",
  DeleteComment = "DeleteComment",
  LockThread = "LockThread",
  PinThread = "PinThread",
  AppointModerator = "AppointModerator",
  RemoveModerator = "RemoveModerator",
  ResolveReportApproved = "ResolveReportApproved",
  ResolveReportRemoved = "ResolveReportRemoved",
  ResolveReportDismissed = "ResolveReportDismissed",
}

export const ModerationActionSchema = z.nativeEnum(ModerationAction);

// ─────────────────────────────────────────────────────────────────────────────

export const CommunityActivitySnapshotSchema = z.object({
  threadId: z.string(),
  threadTitle: z.string(),
  threadCreatedAt: z.string(),
  hotScore: z.number(),
  authorDisplayName: z.string().optional(),
  authorAvatarUrl: z.string().optional(),
  latestReplyAt: z.string().optional(),
  latestReplyAuthorDisplayName: z.string().optional(),
  latestReplyAuthorAvatarUrl: z.string().optional(),
});
export type CommunityActivitySnapshot = z.infer<typeof CommunityActivitySnapshotSchema>;

export const CommunitySummaryResponseSchema = z.object({
  communityId: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  visibility: CommunityVisibilitySchema.optional(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  rules: z.string().optional(),
  memberCount: z.number(),
  threadCount: z.number(),
  commentCount: z.number(),
  latestActivity: CommunityActivitySnapshotSchema.optional(),
});
export type CommunitySummaryResponse = z.infer<typeof CommunitySummaryResponseSchema>;

// CommunityDetailResponse currently has the exact same shape as
// CommunitySummaryResponse (`latestActivity?` was redeclared identically).
// Kept as a separate alias because consumers branch on the semantic distinction.
export const CommunityDetailResponseSchema = CommunitySummaryResponseSchema;
export type CommunityDetailResponse = z.infer<typeof CommunityDetailResponseSchema>;

// `Community` is a looser legacy projection used by older list call sites
// (memberCount/threadCount/etc. aren't always populated). Kept as a plain
// interface until those call sites migrate to CommunitySummaryResponse.
export interface Community {
  communityId: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility?: CommunityVisibility;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  latestActivity?: CommunityActivitySnapshot;
  // Fields not returned by the API — always undefined at runtime:
  memberCount?: number; // not in CommunityResponse
  threadCount?: number; // not in CommunityResponse
  privacy?: string; // use visibility instead
  requireFlair?: boolean; // not in CommunityResponse
}

// Thread schemas — the `Thread` interface includes several fields the API
// does NOT return ("authorUsername", "commentCount", "body", etc.). The
// schema validates only the wire shape; the extra fields stay on the
// type-only interface for the older consumers that read them as undefined.
export const ThreadWireSchema = z.object({
  threadId: z.string(),
  title: z.string(),
  content: z.string().optional(),
  authorId: z.string().optional(),
  authorDisplayName: z.string().optional(),
  authorAvatarUrl: z.string().optional(),
  communityId: z.string().optional(),
  voteScore: z.number().optional(),
  hotScore: z.number().optional(),
  createdAt: z.string(),
  editedAt: z.string().optional(),
  isLocked: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  deletedAt: z.string().optional(),
});

export interface Thread extends z.infer<typeof ThreadWireSchema> {
  // Fields not returned by the API — always undefined at runtime:
  body?: string; // use content instead
  authorUsername?: string; // not in ThreadResponse
  communityName?: string; // not in ThreadResponse
  communitySlug?: string; // not in ThreadResponse
  flair?: string;
  commentCount?: number; // not in ThreadResponse
}

// Comment is recursive (replies are themselves Comments). zod's recursive
// schemas require a `z.lazy` wrapper.
const CommentBaseSchema = z.object({
  commentId: z.string(),
  threadId: z.string(),
  parentCommentId: z.string().optional(),
  authorId: z.string().optional(),
  authorDisplayName: z.string().optional(),
  authorAvatarUrl: z.string().optional(),
  content: z.string(),
  voteScore: z.number().optional(),
  createdAt: z.string(),
  editedAt: z.string().optional(),
  deletedAt: z.string().optional(),
});

export interface Comment extends z.infer<typeof CommentBaseSchema> {
  replies?: Comment[];
  // Not in CommentResponse — always undefined at runtime:
  authorUsername?: string;
}

export const CommentSchema: z.ZodType<Comment> = CommentBaseSchema.extend({
  replies: z.lazy(() => z.array(CommentSchema)).optional(),
});

export const CommunityMembershipSchema = z.object({
  isMember: z.boolean(),
  role: CommunityRoleSchema.optional(),
  communityId: z.string().optional(),
});
export type CommunityMembership = z.infer<typeof CommunityMembershipSchema>;

export const ModQueueItemSchema = z.object({
  reportId: z.string(),
  type: ReportTargetTypeSchema,
  targetId: z.string(),
  reason: z.string().optional(),
  createdAt: z.string(),
});
export type ModQueueItem = z.infer<typeof ModQueueItemSchema>;

export const ModLogEntrySchema = z.object({
  logId: z.string(),
  action: ModerationActionSchema,
  targetId: z.string().optional(),
  modId: z.string().optional(),
  modName: z.string().optional(),
  createdAt: z.string(),
});
export type ModLogEntry = z.infer<typeof ModLogEntrySchema>;

export const CommunityMemberItemSchema = z.object({
  membershipId: z.string(),
  userId: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: CommunityRoleSchema,
  joinedAt: z.string(),
});
export type CommunityMemberItem = z.infer<typeof CommunityMemberItemSchema>;

export const ForumProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  signature: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
});
export type ForumProfile = z.infer<typeof ForumProfileSchema>;

export const UserCommunityItemSchema = z.object({
  membershipId: z.string(),
  communityId: z.string(),
  communityName: z.string(),
  communitySlug: z.string(),
  communityImageUrl: z.string().nullable().optional(),
  role: CommunityRoleSchema,
  joinedAt: z.string(),
});
export type UserCommunityItem = z.infer<typeof UserCommunityItemSchema>;

export const SearchResultSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(["thread", "community"]),
  title: z.string(),
  snippet: z.string().nullable().optional(),
  communityId: z.string(),
  communitySlug: z.string().nullable().optional(),
  communityName: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  createdAt: z.string(),
  rankScore: z.number().optional(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const ThreadMutationResponseSchema = z.object({
  threadId: z.string(),
  isLocked: z.boolean(),
  isPinned: z.boolean(),
  editedAt: z.string().optional(),
  deletedAt: z.string().optional(),
});
export type ThreadMutationResponse = z.infer<typeof ThreadMutationResponseSchema>;

/** A thread row returned in list projections — no Content field. */
export const ThreadSummaryResponseSchema = z.object({
  threadId: z.string(),
  communityId: z.string(),
  communitySlug: z.string().optional(),
  communityName: z.string().optional(),
  authorId: z.string(),
  authorDisplayName: z.string().optional(),
  authorAvatarUrl: z.string().optional(),
  title: z.string(),
  createdAt: z.string(),
  hotScore: z.number(),
  voteScore: z.number(),
  commentCount: z.number().optional(),
  isPinned: z.boolean().optional(),
  flair: z.string().optional(),
});
export type ThreadSummaryResponse = z.infer<typeof ThreadSummaryResponseSchema>;

// Community/Thread pages use `total` (no Count suffix) rather than `totalCount`,
// so they don't fit the shared `pagedResponseSchema` helper. Defined inline.
export const CommunityPageSchema = z.object({
  items: z.array(CommunitySummaryResponseSchema),
  total: z.number().optional(),
});
export type CommunityPage = z.infer<typeof CommunityPageSchema>;

export const ThreadPageSchema = z.object({
  items: z.array(ThreadSummaryResponseSchema),
  total: z.number().optional(),
});
export type ThreadPage = z.infer<typeof ThreadPageSchema>;

export const ProfileCommentSummarySchema = z.object({
  commentId: z.string(),
  threadId: z.string(),
  threadTitle: z.string(),
  communitySlug: z.string(),
  communityName: z.string(),
  content: z.string(),
  createdAt: z.string(),
  voteScore: z.number(),
});
export type ProfileCommentSummary = z.infer<typeof ProfileCommentSummarySchema>;

export const ProfileCommentPageSchema = z.object({
  items: z.array(ProfileCommentSummarySchema),
  totalCount: z.number(),
});
export type ProfileCommentPage = z.infer<typeof ProfileCommentPageSchema>;
