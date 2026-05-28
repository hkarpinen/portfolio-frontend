import { z } from "zod";
import { FrequencySchema } from "./schedule";

/**
 * Payroll deduction types — mirrors finance/src/Domain/ValueObjects/
 * DeductionType.cs, DeductionCalculationMethod.cs and the PayrollDeduction
 * value object that lives on IncomeSource.
 *
 * Filing status, tax withholding profile, and net-pay summaries live in
 * tax.ts (tax-calculation concern, not the deduction value objects).
 */

// ── DeductionType ─────────────────────────────────────────────────────────────

export enum DeductionType {
  FederalIncomeTax = "FederalIncomeTax",
  StateIncomeTax = "StateIncomeTax",
  SocialSecurity = "SocialSecurity",
  Medicare = "Medicare",
  HealthInsurance = "HealthInsurance",
  DentalInsurance = "DentalInsurance",
  VisionInsurance = "VisionInsurance",
  LifeInsurance = "LifeInsurance",
  Retirement401k = "Retirement401k",
  Roth401k = "Roth401k",
  HSA = "HSA",
  FSA = "FSA",
  Other = "Other",
}

export const DeductionTypeSchema = z.enum(DeductionType);

// ── DeductionCalculationMethod ────────────────────────────────────────────────

export enum DeductionCalculationMethod {
  PercentOfGross = "PercentOfGross",
  FixedAmount = "FixedAmount",
}

export const DeductionCalculationMethodSchema = z.enum(DeductionCalculationMethod);

// ── Interfaces ────────────────────────────────────────────────────────────────

export const PayrollDeductionSchema = z.object({
  type: DeductionTypeSchema,
  label: z.string(),
  method: DeductionCalculationMethodSchema,
  value: z.number(),
  isEmployerSponsored: z.boolean(),
  frequency: FrequencySchema,
  isTaxExempt: z.boolean(),
});
export type PayrollDeduction = z.infer<typeof PayrollDeductionSchema>;

export const DeductionLineItemSchema = z.object({
  type: DeductionTypeSchema,
  label: z.string(),
  isEmployerSponsored: z.boolean(),
  amount: z.number(),
  currency: z.string(),
});
export type DeductionLineItem = z.infer<typeof DeductionLineItemSchema>;
