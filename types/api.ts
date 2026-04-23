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
}

// ─── Bills ─────────────────────────────────────────────────────────────────────

export interface Household {
  householdId: string;
  name: string;
  description?: string;
  currencyCode: string;
  ownerId: string;
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

export interface ContributionPeriod {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  totalDue: number;
  totalPaid: number;
  projectedIncome: number;
  netAfterContributions: number;
  contributions: ContributionItem[];
}

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
}

// ─── Forum ─────────────────────────────────────────────────────────────────────

export interface Community {
  communityId: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount?: number;
  threadCount?: number;
  privacy?: string;
  requireFlair?: boolean;
}

export interface Thread {
  threadId: string;
  title: string;
  body?: string;
  authorId?: string;
  authorUsername?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  communityId?: string;
  communityName?: string;
  communitySlug?: string;
  flair?: string;
  voteScore?: number;
  commentCount?: number;
  createdAt: string;
}

export interface Comment {
  commentId: string;
  threadId: string;
  parentCommentId?: string;
  authorId?: string;
  authorUsername?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  content: string;
  voteScore?: number;
  createdAt: string;
  replies?: Comment[];
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
