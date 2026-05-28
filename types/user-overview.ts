import { z } from "zod";
import { HouseholdSummarySchema } from "./household";
import { UpcomingHouseholdExpenseSchema } from "./household-expense";
import { ContributionPeriodSchema } from "./contributions";

/**
 * UserOverview — single cross-domain aggregate served by /api/finance/overview.
 *
 * Lives in its own file because it crosses three domains (household,
 * household-expense, contributions). It doesn't fit cleanly under any of
 * the per-domain files.
 */

export const UserOverviewSchema = z.object({
  households: z.array(HouseholdSummarySchema),
  upcomingBills: z.array(UpcomingHouseholdExpenseSchema),
  totalMonthlyIncome: z.number(),
  totalMonthlyNetIncome: z.number(),
  totalPersonalBillsMonthly: z.number(),
  contributionsByMonth: z.array(ContributionPeriodSchema).optional(),
});
