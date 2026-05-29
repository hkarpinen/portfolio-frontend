import { z } from "zod";
import { FrequencySchema } from "./schedule";
import { ExpenseCategorySchema } from "./expense";
import { HouseholdRoleSchema, MembershipResponseSchema } from "./membership";
import { pagedResponseSchema } from "./shared";

/**
 * Household-context (shared) expense types — mirrors finance/src/Domain/
 * Aggregates/HouseholdExpense.cs and its split value objects.
 *
 * Distinct from personal Expense (in expense.ts): shared expenses carry
 * splits, payer membership, and per-caller claim state.
 */

/**
 * Mirrors the household-scope projection of the unified `ExpenseResponseDto`.
 * The DTO uses a single `isPaid` field whose meaning is scope-aware: in
 * household responses it carries the *caller's* pay status (see
 * ExpenseDtos.cs). Several fields are nullable on the wire (`description`,
 * `recurrenceFrequency`, `currentOccurrenceDate`) — `.nullish()` accepts
 * both `null` and missing.
 */
export const HouseholdExpenseSchema = z.object({
  expenseId: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  dueDate: z.string(),
  category: ExpenseCategorySchema.nullish(),
  recurrenceFrequency: FrequencySchema.nullish(),
  isActive: z.boolean().optional(),
  description: z.string().nullish(),
  currentOccurrenceDate: z.string().nullish(),
  isPaid: z.boolean().optional(),
});
export type HouseholdExpense = z.infer<typeof HouseholdExpenseSchema>;

export const ExpenseSplitSchema = z.object({
  splitId: z.string(),
  userId: z.string(),
  displayName: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  membershipRole: z.string(),
  amount: z.number(),
  currency: z.string(),
  isClaimed: z.boolean(),
});
export type ExpenseSplit = z.infer<typeof ExpenseSplitSchema>;

export const HouseholdExpenseListResponseSchema = pagedResponseSchema(HouseholdExpenseSchema);
export type HouseholdExpenseListResponse = z.infer<typeof HouseholdExpenseListResponseSchema>;

export const HouseholdExpenseDetailResponseSchema = z.object({
  expense: HouseholdExpenseSchema,
  splits: z.array(ExpenseSplitSchema),
  members: z.array(MembershipResponseSchema),
  currentUserRole: HouseholdRoleSchema.optional(),
});
export type HouseholdExpenseDetailResponse = z.infer<typeof HouseholdExpenseDetailResponseSchema>;

const UpcomingHouseholdExpenseSchema = z.object({
  billId: z.string(),
  householdId: z.string(),
  householdName: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  dueDate: z.string(),
});
