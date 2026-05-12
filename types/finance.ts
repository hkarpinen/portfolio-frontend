export interface Household {
  householdId: string;
  name: string;
  description?: string;
  currencyCode: string;
  ownerId: string;
}

// ── Payroll deductions ────────────────────────────────────────────────────────

export type FilingStatus =
  | "Single"
  | "MarriedFilingJointly"
  | "MarriedFilingSeparately"
  | "HeadOfHousehold";

export type DeductionType =
  | "FederalIncomeTax"
  | "StateIncomeTax"
  | "SocialSecurity"
  | "Medicare"
  | "HealthInsurance"
  | "DentalInsurance"
  | "VisionInsurance"
  | "LifeInsurance"
  | "Retirement401k"
  | "Roth401k"
  | "HSA"
  | "FSA"
  | "Other";

export type DeductionCalculationMethod = "PercentOfGross" | "FixedAmount";

export interface TaxWithholdingProfile {
  filingStatus: FilingStatus;
  stateCode: string;
  federalAllowances: number;
  stateAllowances: number;
}

export interface PayrollDeduction {
  type: DeductionType;
  label: string;
  method: DeductionCalculationMethod;
  value: number;
  isEmployerSponsored: boolean;
  frequency: string; // Weekly | BiWeekly | Monthly | Quarterly | SemiAnnually | Annually
  isTaxExempt: boolean;
}

export interface DeductionLineItem {
  type: DeductionType;
  label: string;
  isEmployerSponsored: boolean;
  amount: number;
  currency: string;
}

export interface NetPayBreakdown {
  incomeId: string;
  grossPay: number;
  currency: string;
  deductions: DeductionLineItem[];
  totalDeductions: number;
  netPay: number;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface HouseholdSummary extends Household {
  memberCount: number;
  totalBills: number;
  totalGrossIncome: number;
  netBalance: number;
  isOvercommitted: boolean;
}

export interface MembershipResponse {
  membershipId: string;
  userId: string;
  displayName?: string;
  role: string;
  isActive: boolean;
  invitationCode?: string;
}

/** @deprecated Use MembershipResponse */
export type HouseholdMember = MembershipResponse;

export interface HouseholdExpense {
  expenseId: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: string;
  category?: string;
  recurrenceFrequency?: string;
  isActive?: boolean;
  description?: string;
  currentOccurrenceDate?: string;
  callerIsPaid?: boolean;
}

export interface ExpenseSplit {
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

export interface HouseholdExpenseListResponse {
  items: HouseholdExpense[];
  totalCount: number;
}

export interface HouseholdExpenseDetailResponse {
  expense: HouseholdExpense;
  splits: ExpenseSplit[];
  members: HouseholdMember[];
  currentUserRole?: string;
}

export interface HouseholdDetailResponse {
  household: Household;
  members: MembershipResponse[];
  bills: HouseholdExpense[];
  dashboard: HouseholdDashboard;
}

/** @deprecated Use HouseholdDetailResponse */
export type HouseholdPageResponse = HouseholdDetailResponse;

export interface HouseholdDashboard {
  totalBills: number;
  totalGrossIncome: number;
  totalNetIncome: number;
  netBalance: number;
  isOvercommitted: boolean;
  availableBalance?: number | null;
  balanceAsOf?: string | null;
}

export interface IncomeSource {
  incomeId: string;
  source: string;
  amount: number;
  /** The period the amount is quoted in (e.g. "Annually" for a $80k salary). */
  quotedAs: string;
  /** How often a paycheck actually arrives (e.g. "BiWeekly"). */
  paidEvery: string;
  currency?: string;
  startDate?: string;
  /** Date of the most recent paycheck — used as recurrence anchor on the backend. */
  lastPaycheckDate?: string;
  householdId?: string;
  taxProfile?: TaxWithholdingProfile | null;
  deductions?: PayrollDeduction[];
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

export interface ExpenseItem {
  expenseId: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  dueDate: string;
  isPaid?: boolean;
}

export interface ContributionPeriod {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  totalDue: number;
  totalPaid: number;
  projectedIncome: number;
  projectedNetIncome: number;
  contributions: ContributionItem[];
  personalBillsDue?: number;
  personalBills?: ExpenseItem[];
  personalBillsPaid?: number;
  /** Discretionary income for the period. Past/current months: income-math or real balance. Future: null. */
  disposableIncome?: number | null;
  /** How disposableIncome was derived: "balance" | "estimate" | null. */
  disposableIncomeSource?: "balance" | "estimate" | null;
}

/** Alias used by the budget/contributions view */
export type ContributionPeriodSummary = ContributionPeriod;

export interface UpcomingHouseholdExpense {
  billId: string;
  householdId: string;
  householdName: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: string;
}

export interface UserOverview {
  households: HouseholdSummary[];
  upcomingBills: UpcomingHouseholdExpense[];
  totalMonthlyIncome: number;
  totalMonthlyNetIncome: number;
  totalPersonalBillsMonthly: number;
  contributionsByMonth?: ContributionPeriod[];
}

/** @deprecated Use UserOverview */
export type UserExpensesOverview = UserOverview;
/** @deprecated Use UserOverview */
export type UserFinanceOverview = UserOverview;

export interface ExpenseListResponse {
  items: Expense[];
  totalCount: number;
}

export interface IncomeListResponse {
  items: IncomeSource[];
}

/** @deprecated Use IncomeListResponse */
export type IncomePage = IncomeListResponse;

export interface ExpensePage {
  items: Expense[];
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

export interface HouseholdMonthlyContributions {
  periodLabel: string;
  periodStart: string;
  total: number;
  currency: string;
  members: MemberContribution[];
}

/** @deprecated Use HouseholdMonthlyContributions */
export type HouseholdContributionsResponse = HouseholdMonthlyContributions;

/** Alias used by the contributions/budget view for personal expense occurrences within a period. */
export type PersonalBillItem = ExpenseItem;

export interface Expense {  expenseId: string;
  userId: string;
  householdId?: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category?: string;
  dueDate: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  recurrenceEndDate?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  isPaid?: boolean;
  currentOccurrenceDate?: string;
}