import { z } from "zod";
import { HouseholdExpenseSchema } from "./household-expense";
import { MembershipResponseSchema } from "./membership";

/**
 * Household aggregate types — mirrors household/src/Domain/Aggregates/Household.cs
 * and the dashboard DTOs in finance/src/Application/Dtos/DashboardDtos.cs.
 *
 * Membership-related types (HouseholdRole, MembershipResponse, MemberBalance)
 * live in membership.ts. Expense-related types live in expense.ts /
 * household-expense.ts.
 */

export const HouseholdSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  currencyCode: z.string(),
  ownerId: z.string(),
  timezone: z.string(),
  createdAt: z.string(),
  memberCount: z.number(),
});
export type Household = z.infer<typeof HouseholdSchema>;

export const HouseholdSummarySchema = HouseholdSchema.extend({
  totalBills: z.number(),
  totalGrossIncome: z.number(),
  netBalance: z.number(),
  isOvercommitted: z.boolean(),
});
export type HouseholdSummary = z.infer<typeof HouseholdSummarySchema>;

/**
 * Matches `CoverageStatusKind` in finance/src/Application/Dtos/DashboardDtos.cs.
 * Serialized as enum name strings via JsonStringEnumConverter.
 */
export const CoverageStatusKindSchema = z.enum(["FullyCovered", "AtRisk", "Overcommitted"]);
export type CoverageStatusKind = z.infer<typeof CoverageStatusKindSchema>;

export const HouseholdDashboardSchema = z.object({
  groupId: z.string(),
  totalBills: z.number(),
  totalGrossIncome: z.number(),
  totalNetIncome: z.number(),
  netBalance: z.number(),
  isOvercommitted: z.boolean(),
  coverageRatio: z.number(),
  isFullyCovered: z.boolean(),
  coverageStatus: CoverageStatusKindSchema,
  periodStart: z.string(),
  periodEnd: z.string(),
  availableBalance: z.number().nullable().optional(),
  balanceAsOf: z.string().nullable().optional(),
});
export type HouseholdDashboard = z.infer<typeof HouseholdDashboardSchema>;

export const HouseholdDetailResponseSchema = z.object({
  household: HouseholdSchema,
  members: z.array(MembershipResponseSchema),
  bills: z.array(HouseholdExpenseSchema),
  dashboard: HouseholdDashboardSchema,
});
export type HouseholdDetailResponse = z.infer<typeof HouseholdDetailResponseSchema>;
