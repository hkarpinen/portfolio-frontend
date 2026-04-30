export interface Household {
  householdId: string;
  name: string;
  description?: string;
  currencyCode: string;
  ownerId: string;
  defaultSplitMethod?: string;
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
  projectedNetIncome: number;
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
  totalMonthlyNetIncome: number;
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
