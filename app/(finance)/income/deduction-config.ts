import type { DeductionCalculationMethod, DeductionType, FilingStatus } from "@/types/finance";

// ── US States ─────────────────────────────────────────────────────────────────
export const US_STATES = [
  { code: "AL", name: "Alabama" },        { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },        { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },     { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },    { code: "DC", name: "Washington D.C." },
  { code: "DE", name: "Delaware" },       { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },        { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },          { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },        { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },         { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },      { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },       { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },       { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },    { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },        { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },         { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },     { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },       { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },   { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },       { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },   { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },      { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },           { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },       { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// ── Deduction type smart defaults ─────────────────────────────────────────────
export interface TypeConfig {
  label: string;
  defaultMethod: DeductionCalculationMethod;
  defaultFreq: string;
  defaultPreTax: boolean;
  defaultEmployer: boolean;
  hint: string;
}

export const TYPE_CONFIGS: Record<string, TypeConfig> = {
  HealthInsurance: { label: "Health Insurance",   defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: true,  hint: "§125 cafeteria plan · pre-tax" },
  DentalInsurance: { label: "Dental Insurance",   defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: true,  hint: "§125 cafeteria plan · pre-tax" },
  VisionInsurance: { label: "Vision Insurance",   defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: true,  hint: "§125 cafeteria plan · pre-tax" },
  LifeInsurance:   { label: "Life Insurance",     defaultMethod: "FixedAmount",    defaultFreq: "Monthly",  defaultPreTax: false, defaultEmployer: true,  hint: "After-tax" },
  Retirement401k:  { label: "401(k) Traditional", defaultMethod: "PercentOfGross", defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: false, hint: "§401(a) · reduces W-2 Box 1" },
  Roth401k:        { label: "401(k) Roth",        defaultMethod: "PercentOfGross", defaultFreq: "BiWeekly", defaultPreTax: false, defaultEmployer: false, hint: "After-tax — does not reduce taxable wages" },
  HSA:             { label: "HSA",                defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: false, hint: "§106/125 · pre-tax" },
  FSA:             { label: "FSA",                defaultMethod: "FixedAmount",    defaultFreq: "BiWeekly", defaultPreTax: true,  defaultEmployer: false, hint: "§125 · pre-tax" },
  Other:           { label: "Other",              defaultMethod: "FixedAmount",    defaultFreq: "Monthly",  defaultPreTax: false, defaultEmployer: false, hint: "" },
};

export const VOLUNTARY_TYPES = Object.keys(TYPE_CONFIGS) as DeductionType[];

export const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "Single",                  label: "Single" },
  { value: "MarriedFilingJointly",    label: "Married Filing Jointly" },
  { value: "MarriedFilingSeparately", label: "Married Filing Separately" },
  { value: "HeadOfHousehold",         label: "Head of Household" },
];

export const DEDUCTION_FREQUENCIES = [
  { value: "Weekly",       label: "Weekly" },
  { value: "BiWeekly",     label: "Bi-Weekly" },
  { value: "Monthly",      label: "Monthly" },
  { value: "Quarterly",    label: "Quarterly" },
  { value: "SemiAnnually", label: "Semi-Annually" },
  { value: "Annually",     label: "Annually" },
];
