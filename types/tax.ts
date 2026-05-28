import { z } from "zod";
import { DeductionLineItemSchema } from "./deductions";

/**
 * Tax + net-pay types — mirrors finance/src/Domain/ValueObjects/FilingStatus.cs
 * and the net-pay summary DTOs.
 */

// ── FilingStatus ──────────────────────────────────────────────────────────────

export enum FilingStatus {
  Single = "Single",
  MarriedFilingJointly = "MarriedFilingJointly",
  MarriedFilingSeparately = "MarriedFilingSeparately",
  HeadOfHousehold = "HeadOfHousehold",
}

export const FilingStatusSchema = z.nativeEnum(FilingStatus);

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  [FilingStatus.Single]: "Single",
  [FilingStatus.MarriedFilingJointly]: "Married Filing Jointly",
  [FilingStatus.MarriedFilingSeparately]: "Married Filing Separately",
  [FilingStatus.HeadOfHousehold]: "Head of Household",
};

// ── TaxWithholdingProfile ─────────────────────────────────────────────────────

export const TaxWithholdingProfileSchema = z.object({
  filingStatus: FilingStatusSchema,
  stateCode: z.string(),
  federalAllowances: z.number(),
  stateAllowances: z.number(),
});
export type TaxWithholdingProfile = z.infer<typeof TaxWithholdingProfileSchema>;

// ── Net-pay summaries ─────────────────────────────────────────────────────────

export const NetPayBreakdownSchema = z.object({
  incomeId: z.string(),
  grossPay: z.number(),
  currency: z.string(),
  deductions: z.array(DeductionLineItemSchema),
  totalDeductions: z.number(),
  netPay: z.number(),
});
export type NetPayBreakdown = z.infer<typeof NetPayBreakdownSchema>;

/** Aggregate of every active income source for the caller in the given
 *  month. Served by /api/finance/income/net-pay/summary; replaces the
 *  client-side N+1 fan-out the income stats strip used to do. */
export const NetPaySummarySchema = z.object({
  year: z.number(),
  month: z.number(),
  currency: z.string(),
  monthlyGross: z.number(),
  monthlyNet: z.number(),
  totalTaxWithheld: z.number(),
  totalDeductions: z.number(),
  annualGross: z.number(),
  sourceCount: z.number(),
});
export type NetPaySummary = z.infer<typeof NetPaySummarySchema>;
