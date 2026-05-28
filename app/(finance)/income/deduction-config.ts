import { DeductionCalculationMethod, DeductionType } from "@/types/deductions";
import { FilingStatus, FILING_STATUS_LABELS } from "@/types/tax";
import { Frequency, FREQUENCY_LABELS } from "@/types/schedule";

// ── US States ─────────────────────────────────────────────────────────────────
export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "OR", name: "Oregon" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

// ── Per-deduction-type config ────────────────────────────────────────────────

export interface TypeConfig {
  label: string;
  defaultMethod: DeductionCalculationMethod;
  defaultFreq: Frequency;
  defaultPreTax: boolean;
  defaultEmployer: boolean;
  hint: string;
}

export const TYPE_CONFIGS: Record<DeductionType, TypeConfig | undefined> = {
  [DeductionType.FederalIncomeTax]: undefined,
  [DeductionType.StateIncomeTax]: undefined,
  [DeductionType.SocialSecurity]: undefined,
  [DeductionType.Medicare]: undefined,
  [DeductionType.HealthInsurance]: {
    label: "Health Insurance",
    defaultMethod: DeductionCalculationMethod.FixedAmount,
    defaultFreq: Frequency.BiWeekly,
    defaultPreTax: true,
    defaultEmployer: true,
    hint: "§125 cafeteria plan · pre-tax",
  },
  [DeductionType.DentalInsurance]: {
    label: "Dental Insurance",
    defaultMethod: DeductionCalculationMethod.FixedAmount,
    defaultFreq: Frequency.BiWeekly,
    defaultPreTax: true,
    defaultEmployer: true,
    hint: "§125 cafeteria plan · pre-tax",
  },
  [DeductionType.VisionInsurance]: {
    label: "Vision Insurance",
    defaultMethod: DeductionCalculationMethod.FixedAmount,
    defaultFreq: Frequency.BiWeekly,
    defaultPreTax: true,
    defaultEmployer: true,
    hint: "§125 cafeteria plan · pre-tax",
  },
  [DeductionType.LifeInsurance]: {
    label: "Life Insurance",
    defaultMethod: DeductionCalculationMethod.FixedAmount,
    defaultFreq: Frequency.Monthly,
    defaultPreTax: false,
    defaultEmployer: true,
    hint: "After-tax",
  },
  [DeductionType.Retirement401k]: {
    label: "401(k) Traditional",
    defaultMethod: DeductionCalculationMethod.PercentOfGross,
    defaultFreq: Frequency.BiWeekly,
    defaultPreTax: true,
    defaultEmployer: false,
    hint: "§401(a) · reduces W-2 Box 1",
  },
  [DeductionType.Roth401k]: {
    label: "401(k) Roth",
    defaultMethod: DeductionCalculationMethod.PercentOfGross,
    defaultFreq: Frequency.BiWeekly,
    defaultPreTax: false,
    defaultEmployer: false,
    hint: "After-tax — does not reduce taxable wages",
  },
  [DeductionType.HSA]: {
    label: "HSA",
    defaultMethod: DeductionCalculationMethod.FixedAmount,
    defaultFreq: Frequency.BiWeekly,
    defaultPreTax: true,
    defaultEmployer: false,
    hint: "§106/125 · pre-tax",
  },
  [DeductionType.FSA]: {
    label: "FSA",
    defaultMethod: DeductionCalculationMethod.FixedAmount,
    defaultFreq: Frequency.BiWeekly,
    defaultPreTax: true,
    defaultEmployer: false,
    hint: "§125 · pre-tax",
  },
  [DeductionType.Other]: {
    label: "Other",
    defaultMethod: DeductionCalculationMethod.FixedAmount,
    defaultFreq: Frequency.Monthly,
    defaultPreTax: false,
    defaultEmployer: false,
    hint: "",
  },
};

/** Deduction types the user can manually add. Filed (tax-withholding) types
 *  are handled separately via the TaxWithholdingProfile, not as line-item
 *  deductions, so they're excluded from voluntary types. */
export const VOLUNTARY_DEDUCTION_TYPES: readonly DeductionType[] = Object.keys(TYPE_CONFIGS).filter(
  (t) => TYPE_CONFIGS[t as DeductionType] !== undefined,
) as DeductionType[];

/** @deprecated Use VOLUNTARY_DEDUCTION_TYPES */
export const VOLUNTARY_TYPES = VOLUNTARY_DEDUCTION_TYPES;

// ── Filing status options (form-ready value/label pairs) ─────────────────────

export const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = Object.values(
  FilingStatus,
).map((status) => ({ value: status, label: FILING_STATUS_LABELS[status] }));

// ── Deduction frequency options (form-ready, excludes OneTime + Daily) ───────
// Deductions are inherently periodic. OneTime / Daily aren't valid cadences
// for a recurring payroll deduction.

const DEDUCTION_HIDDEN_FREQUENCIES: readonly Frequency[] = [Frequency.OneTime, Frequency.Daily];

export const DEDUCTION_FREQUENCIES: { value: Frequency; label: string }[] = Object.values(Frequency)
  .filter((f) => !DEDUCTION_HIDDEN_FREQUENCIES.includes(f))
  .map((f) => ({ value: f, label: FREQUENCY_LABELS[f] }));
