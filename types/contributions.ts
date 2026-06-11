import { z } from "zod";
import { ExpenseCategorySchema, ExpenseItemSchema } from "./expense";

/**
 * Contribution / period-summary types — per-split obligations and the
 * monthly aggregations of them. Mirrors finance/src/Application/Dtos/
 * ContributionDtos.cs.
 *
 * Lives separately from expense.ts because contributions are about
 * "who owes what within a period" — a different concept from the
 * expense itself.
 */

// ── Individual contribution items ─────────────────────────────────────────────

export const ContributionItemSchema = z.object({
  allocationId: z.string(),
  billId: z.string(),
  /** Nullable on the wire — DTO comment notes it may be null for per-member breakdowns. */
  groupId: z.string().nullish(),
  /** @deprecated use groupId — kept for back-compat; backend no longer emits it. */
  householdId: z.string().nullish(),
  /** Not currently emitted by ContributionItemDto; consumers render empty until backend joins it in. */
  householdName: z.string().nullish(),
  billTitle: z.string(),
  /** Backend sends a raw category string; if it doesn't match the enum, treat as undefined. */
  billCategory: ExpenseCategorySchema.nullish(),
  amount: z.number(),
  currency: z.string(),
  dueDate: z.string(),
  // Finance owns the domain language — splits are "paid", not "claimed".
  // See memory: finance-split-paid-not-split-claimed.
  isPaid: z.boolean(),
  paidAt: z.string().nullable(),
});
export type ContributionItem = z.infer<typeof ContributionItemSchema>;

const HouseholdContributionItemSchema = z.object({
  allocationId: z.string(),
  billId: z.string(),
  billTitle: z.string(),
  billCategory: ExpenseCategorySchema.optional(),
  amount: z.number(),
  currency: z.string(),
  dueDate: z.string(),
  isPaid: z.boolean(),
});

// ── Monthly aggregations ─────────────────────────────────────────────────────

const MemberContributionSchema = z.object({
  userId: z.string(),
  displayName: z.string().nullish(),
  totalDue: z.number(),
  totalPaid: z.number(),
  contributions: z.array(HouseholdContributionItemSchema),
});

export const HouseholdMonthlyContributionsSchema = z.object({
  periodLabel: z.string(),
  periodStart: z.string(),
  total: z.number(),
  currency: z.string(),
  members: z.array(MemberContributionSchema),
});
export type HouseholdMonthlyContributions = z.infer<typeof HouseholdMonthlyContributionsSchema>;

// ── Contribution period (the caller's monthly view) ──────────────────────────

enum DisposableIncomeSource {
  Balance = "balance",
  Estimate = "estimate",
}

const DisposableIncomeSourceSchema = z.enum(DisposableIncomeSource);

export const ContributionPeriodSchema = z.object({
  periodLabel: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  totalDue: z.number(),
  totalPaid: z.number(),
  projectedIncome: z.number(),
  projectedNetIncome: z.number(),
  contributions: z.array(ContributionItemSchema),
  personalBillsDue: z.number().optional(),
  personalBills: z.array(ExpenseItemSchema).optional(),
  personalBillsPaid: z.number().optional(),
  /** Discretionary income for the period. Past/current months: income-math or real balance. Future: null. */
  disposableIncome: z.number().nullable().optional(),
  /** How disposableIncome was derived. */
  disposableIncomeSource: DisposableIncomeSourceSchema.nullable().optional(),
});
export type ContributionPeriod = z.infer<typeof ContributionPeriodSchema>;
