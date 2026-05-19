export const financeKeys = {
  all: ["finance"] as const,

  // Households
  households: () => [...financeKeys.all, "households"] as const,
  household: (id: string) => [...financeKeys.households(), id] as const,
  householdDetail: (id: string) => [...financeKeys.household(id), "detail"] as const,
  householdMembers: (id: string) => [...financeKeys.household(id), "members"] as const,
  householdDashboard: (id: string) => [...financeKeys.household(id), "dashboard"] as const,

  // Shared Expenses
  householdExpenses: (householdId: string) => [...financeKeys.household(householdId), "shared-expenses"] as const,
  householdExpense: (householdId: string, householdExpenseId: string) => [...financeKeys.householdExpenses(householdId), householdExpenseId] as const,
  householdExpenseDetail: (householdId: string, householdExpenseId: string) => [...financeKeys.householdExpense(householdId, householdExpenseId), "detail"] as const,
  householdExpenseSplits: (householdId: string, householdExpenseId: string) => [...financeKeys.householdExpense(householdId, householdExpenseId), "splits"] as const,

  // Income
  income: () => [...financeKeys.all, "income"] as const,
  householdIncome: (id: string) => [...financeKeys.income(), id] as const,

  // Overview / contributions
  overview: () => [...financeKeys.all, "overview"] as const,
  householdContributions: (householdId?: string) =>
    householdId
      ? [...financeKeys.all, "contributions", householdId]
      : [...financeKeys.all, "contributions"],
  accountBalance: () => [...financeKeys.all, "account-balance"] as const,

  // Expenses (personal)
  expenses: () => [...financeKeys.all, "expenses"] as const,
  expense: (id: string) => [...financeKeys.expenses(), id] as const,

  // Chores
  chores: (householdId: string) => [...financeKeys.household(householdId), "chores"] as const,
  chore: (householdId: string, choreId: string) => [...financeKeys.chores(householdId), choreId] as const,

  // Calendar
  calendarEvents: (householdId: string, from?: string, to?: string) =>
    [...financeKeys.household(householdId), "calendar", from ?? "", to ?? ""] as const,
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

export const geographyKeys = {
  all: ["geography"] as const,
  weather: (city: string) => [...geographyKeys.all, "weather", city.toLowerCase()] as const,
} as const;

export const mathKeys = {
  all: ["math"] as const,
  units: () => [...mathKeys.all, "units"] as const,
  conversion: (from: string, to: string, value: number) =>
    [...mathKeys.all, "conversion", from, to, value] as const,
} as const;

