import { z } from "zod";
import { FrequencySchema } from "./schedule";
import { pagedResponseSchema } from "./shared";

/**
 * Personal expense types — mirrors finance/src/Domain/Aggregates/Expense.cs.
 *
 * Household-context (shared) expenses live in household-expense.ts; they
 * have different semantics (splits, payer membership, claim state) and are
 * a distinct domain concept.
 */

// ── ExpenseCategory ───────────────────────────────────────────────────────────
// Mirrors finance/src/Domain/ValueObjects/ExpenseCategory.cs.

export enum ExpenseCategory {
  Rent = "Rent",
  Utilities = "Utilities",
  Groceries = "Groceries",
  Transportation = "Transportation",
  Entertainment = "Entertainment",
  Healthcare = "Healthcare",
  Insurance = "Insurance",
  Subscriptions = "Subscriptions",
  Internet = "Internet",
  Phone = "Phone",
  Other = "Other",
}

export const ExpenseCategorySchema = z.nativeEnum(ExpenseCategory);

export const EXPENSE_CATEGORY_OPTIONS = Object.values(ExpenseCategory);

// ── Personal expense ──────────────────────────────────────────────────────────

export const ExpenseSchema = z.object({
  expenseId: z.string(),
  userId: z.string(),
  householdId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  category: ExpenseCategorySchema.optional(),
  dueDate: z.string(),
  recurrenceFrequency: FrequencySchema.optional(),
  recurrenceStartDate: z.string().optional(),
  recurrenceEndDate: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isPaid: z.boolean().optional(),
  currentOccurrenceDate: z.string().optional(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

export const ExpenseItemSchema = z.object({
  expenseId: z.string(),
  title: z.string(),
  category: ExpenseCategorySchema,
  amount: z.number(),
  currency: z.string(),
  dueDate: z.string(),
  isPaid: z.boolean().optional(),
  recurrenceFrequency: FrequencySchema.optional(),
});
export type ExpenseItem = z.infer<typeof ExpenseItemSchema>;

/** Alias used by the contributions/budget view for personal expense occurrences within a period. */
export type PersonalBillItem = ExpenseItem;

// ExpenseListResponse and ExpensePage were duplicate definitions of the same
// `{items, totalCount}` envelope (see audit §1.5). Collapsed to a single
// alias so all consumers go through one schema.
export const ExpenseListResponseSchema = pagedResponseSchema(ExpenseSchema);
export type ExpenseListResponse = z.infer<typeof ExpenseListResponseSchema>;
export type ExpensePage = ExpenseListResponse;
