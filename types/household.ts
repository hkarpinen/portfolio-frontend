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
  householdId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  currencyCode: z.string(),
  ownerId: z.string(),
});
export type Household = z.infer<typeof HouseholdSchema>;

export const HouseholdSummarySchema = HouseholdSchema.extend({
  memberCount: z.number(),
  totalBills: z.number(),
  totalGrossIncome: z.number(),
  netBalance: z.number(),
  isOvercommitted: z.boolean(),
});
export type HouseholdSummary = z.infer<typeof HouseholdSummarySchema>;

export const HouseholdDashboardSchema = z.object({
  totalBills: z.number(),
  totalGrossIncome: z.number(),
  totalNetIncome: z.number(),
  netBalance: z.number(),
  isOvercommitted: z.boolean(),
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
