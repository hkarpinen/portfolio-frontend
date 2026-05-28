import { z } from "zod";
import { FrequencySchema } from "./schedule";
import { PayrollDeductionSchema } from "./deductions";
import { TaxWithholdingProfileSchema } from "./tax";
import { pagedResponseSchema } from "./shared";

/**
 * Income source types — mirrors finance/src/Domain/Aggregates/IncomeSource.cs.
 *
 * Separate from deductions.ts because IncomeSource isn't a deduction —
 * it's the aggregate that owns them.
 */

export const IncomeSourceSchema = z.object({
  incomeId: z.string(),
  source: z.string(),
  amount: z.number(),
  /** The period the amount is quoted in (e.g. Frequency.Annually for a $80k salary). */
  quotedAs: FrequencySchema,
  /** How often a paycheck actually arrives (e.g. Frequency.BiWeekly). */
  paidEvery: FrequencySchema,
  currency: z.string().optional(),
  startDate: z.string().optional(),
  /** Date of the most recent paycheck — used as recurrence anchor on the backend. */
  lastPaycheckDate: z.string().nullish(),
  householdId: z.string().optional(),
  taxProfile: TaxWithholdingProfileSchema.nullable().optional(),
  deductions: z.array(PayrollDeductionSchema).nullish(),
});
export type IncomeSource = z.infer<typeof IncomeSourceSchema>;

export const IncomeListResponseSchema = pagedResponseSchema(IncomeSourceSchema);
export type IncomeListResponse = z.infer<typeof IncomeListResponseSchema>;
