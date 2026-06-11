import { z } from "zod";
import { FrequencySchema } from "./schedule";
import { ExpenseCategorySchema } from "./expense";
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
  chargeId: z.string(),
  // Identity userId of the bill's creator/owner — only the owner pays the vendor (collect-first).
  createdBy: z.string().nullish(),
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
  // The identity userId of the payer who fronted the bill (always set for group charges). Under
  // PayerMember funding their own share is covered (not reversible); under GroupCash they settle
  // like everyone. Finance keys actors on the person, not the household membership.
  payerUserId: z.string().nullish(),
  // Which account funded the vendor payment: "PayerMember" (front-and-reimburse) or "GroupCash"
  // (pooled — every member, the payer included, settles reversibly). The *intended/of-record*
  // funding; only meaningful once the vendor is actually paid.
  fundingSource: z.string().nullish(),
  // Has the VENDOR been paid (the bill itself), distinct from the caller's share (isPaid). Derived
  // from the ledger server-side. Upcoming/unpaid bills are false; legacy cash-basis charges read true.
  vendorPaid: z.boolean().optional(),
  // The caller's OWN share amount on this charge (their allocation); null when they have no
  // allocation. Drives "your share" so it reflects the real split, not an even-split estimate.
  callerShare: z.number().nullish(),
});
export type HouseholdExpense = z.infer<typeof HouseholdExpenseSchema>;

export const ExpenseSplitSchema = z.object({
  allocationId: z.string(),
  userId: z.string(),
  displayName: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  membershipRole: z.string(),
  amount: z.number(),
  currency: z.string(),
  // Finance owns the domain language — splits are "paid", not "claimed".
  // See finance SplitDetailDto / memory: finance-split-paid-not-split-claimed.
  isPaid: z.boolean(),
});
export type ExpenseSplit = z.infer<typeof ExpenseSplitSchema>;

export const HouseholdExpenseListResponseSchema = pagedResponseSchema(HouseholdExpenseSchema);
export type HouseholdExpenseListResponse = z.infer<typeof HouseholdExpenseListResponseSchema>;

// Mirrors finance `GroupChargeDetailDto` — just `{ charge, allocations }`. The
// household members list is fetched separately on the page via
// `useHouseholdMembers` because finance treats group membership as opaque.
export const HouseholdExpenseDetailResponseSchema = z.object({
  charge: HouseholdExpenseSchema,
  allocations: z.array(ExpenseSplitSchema),
});
export type HouseholdExpenseDetailResponse = z.infer<typeof HouseholdExpenseDetailResponseSchema>;
