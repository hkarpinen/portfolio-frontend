// ─── Identity ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Me {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  role?: string;
}

// ─── Bills ─────────────────────────────────────────────────────────────────────

export interface Household {
  householdId: string;
  name: string;
  description?: string;
  currencyCode: string;
  ownerId: string;
  defaultSplitMethod?: string;
}

export interface HouseholdSummary extends Household {
  memberCount: number;
  totalBills: number;
  totalIncome: number;
  netBalance: number;
  isOvercommitted: boolean;
}

export interface HouseholdMember {
  membershipId: string;
  userId: string;
  displayName?: string;
  role: string;
  isActive: boolean;
  invitationCode?: string;
}

export interface Bill {
  billId: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: string;
  category?: string;
  recurrenceFrequency?: string;
  isActive?: boolean;
  description?: string;
}

export interface BillSplit {
  splitId: string;
  membershipId: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  amount: number;
  currency: string;
  isClaimed: boolean;
}

export interface BillPageResponse {
  bill: Bill;
  splits: BillSplit[];
  members: HouseholdMember[];
  currentUserRole?: string;
}

export interface HouseholdPageResponse {
  household: Household;
  members: HouseholdMember[];
  bills: Bill[];
  dashboard: HouseholdDashboard;
}

export interface HouseholdDashboard {
  totalBills: number;
  totalIncome: number;
  netBalance: number;
  isOvercommitted: boolean;
}

export interface IncomeSource {
  incomeId: string;
  source: string;
  amount: number;
  frequency: string;
  currency?: string;
  startDate?: string;
  householdId?: string;
}

export interface ContributionItem {
  splitId: string;
  billId: string;
  householdId: string;
  householdName: string;
  billTitle: string;
  billCategory?: string;
  amount: number;
  currency: string;
  dueDate: string;
  isClaimed: boolean;
  claimedAt: string | null;
}

export interface PersonalBillItem {
  personalBillId: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  dueDate: string;
}

export interface ContributionPeriod {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  totalDue: number;
  totalPaid: number;
  projectedIncome: number;
  netAfterContributions: number;
  contributions: ContributionItem[];
  personalBillsDue?: number;
  personalBills?: PersonalBillItem[];
}

/** Alias used by the budget/contributions view */
export type ContributionPeriodSummary = ContributionPeriod;

export interface UpcomingBill {
  billId: string;
  householdId: string;
  householdName: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: string;
}

export interface UserBillsOverview {
  households: HouseholdSummary[];
  upcomingBills: UpcomingBill[];
  totalMonthlyIncome: number;
  totalPersonalBillsMonthly: number;
  contributionsByMonth?: ContributionPeriod[];
}

export interface PersonalBill {
  personalBillId: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  dueDate: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  recurrenceEndDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalBillListResponse {
  items: PersonalBill[];
  totalCount: number;
}

// ─── Forum ─────────────────────────────────────────────────────────────────────

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

// ─── Identity ──────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  isBanned: boolean;
  isEmailConfirmed: boolean;
  createdAt: string;
}

// ─── Forum (community / profile / search) ──────────────────────────────────────

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
  authorId: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  title: string;
  createdAt: string;
  hotScore: number;
  voteScore: number;
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

// ─── Bills (page / contribution shapes) ────────────────────────────────────────

export interface IncomePage {
  items: IncomeSource[];
}

export interface PersonalBillPage {
  items: PersonalBill[];
  totalCount: number;
}

export interface HouseholdContributionItem {
  splitId: string;
  billId: string;
  billTitle: string;
  billCategory?: string;
  amount: number;
  currency: string;
  dueDate: string;
  isClaimed: boolean;
}

export interface MemberContribution {
  userId: string;
  displayName?: string;
  totalDue: number;
  totalPaid: number;
  contributions: HouseholdContributionItem[];
}

export interface HouseholdContributionsResponse {
  periodLabel: string;
  periodStart: string;
  total: number;
  currency: string;
  members: MemberContribution[];
}
