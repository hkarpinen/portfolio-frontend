export const billsKeys = {
  all: ["bills"] as const,

  // Households
  households: () => [...billsKeys.all, "households"] as const,
  household: (id: string) => [...billsKeys.households(), id] as const,
  householdDetail: (id: string) => [...billsKeys.household(id), "detail"] as const,
  householdMembers: (id: string) => [...billsKeys.household(id), "members"] as const,
  householdDashboard: (id: string) => [...billsKeys.household(id), "dashboard"] as const,

  // Bills
  bills: (householdId: string) => [...billsKeys.household(householdId), "bills"] as const,
  bill: (householdId: string, billId: string) => [...billsKeys.bills(householdId), billId] as const,
  billDetail: (householdId: string, billId: string) => [...billsKeys.bill(householdId, billId), "detail"] as const,
  billSplits: (householdId: string, billId: string) => [...billsKeys.bill(householdId, billId), "splits"] as const,

  // Income
  income: () => [...billsKeys.all, "income"] as const,
  householdIncome: (id: string) => [...billsKeys.income(), id] as const,

  // Overview / contributions
  overview: () => [...billsKeys.all, "overview"] as const,
  contributions: (householdId?: string) =>
    householdId
      ? [...billsKeys.all, "contributions", householdId]
      : [...billsKeys.all, "contributions"],

  // Personal Bills
  personalBills: () => [...billsKeys.all, "personal-bills"] as const,
  personalBill: (id: string) => [...billsKeys.personalBills(), id] as const,
} as const;

export const forumKeys = {
  all: ["forum"] as const,

  communities: () => [...forumKeys.all, "communities"] as const,
  community: (slug: string) => [...forumKeys.communities(), slug] as const,
  communityMembership: (communityId: string) => [...forumKeys.community(communityId), "membership"] as const,
  communityMembers: (communityId: string) => [...forumKeys.all, "community-members", communityId] as const,

  threads: (communityId?: string, sort?: string) =>
    communityId
      ? [...forumKeys.all, "threads", communityId, sort ?? "new"]
      : [...forumKeys.all, "threads", sort ?? "new"],
  thread: (threadId: string) => [...forumKeys.all, "thread", threadId] as const,
  comments: (threadId: string) => [...forumKeys.thread(threadId), "comments"] as const,

  search: (query: string) => [...forumKeys.all, "search", query] as const,
  memberships: () => [...forumKeys.all, "memberships"] as const,

  profile: (userId: string) => [...forumKeys.all, "profile", userId] as const,
  profileThreads: (userId: string) => [...forumKeys.all, "profile", userId, "threads"] as const,
  profileMemberships: (userId: string) => [...forumKeys.all, "profile", userId, "memberships"] as const,
} as const;

export const identityKeys = {
  all: ["identity"] as const,
  me: () => [...identityKeys.all, "me"] as const,
  adminUsers: (page: number) => [...identityKeys.all, "admin-users", page] as const,
} as const;
