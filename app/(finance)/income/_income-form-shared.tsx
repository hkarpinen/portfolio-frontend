import { z } from "zod";
import { Frequency } from "@/types/schedule";

/** Frequencies the income form doesn't offer as a pay cadence.
 *  OneTime / Daily aren't realistic for income (no one is "paid one-time"
 *  or "paid daily" in an HR-managed payroll system). */
const INCOME_FORM_HIDDEN_FREQUENCIES: readonly Frequency[] = [Frequency.OneTime, Frequency.Daily];

export const INCOME_FREQUENCY_OPTIONS: readonly Frequency[] = Object.values(Frequency).filter(
  (f) => !INCOME_FORM_HIDDEN_FREQUENCIES.includes(f),
);

export const incomeSchema = z.object({
  source: z.string().min(1, "Source is required").max(100),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be positive"),
  currency: z.string().min(1),
  quotedAs: z.nativeEnum(Frequency),
  paidEvery: z.nativeEnum(Frequency),
  startDate: z.string().min(1, "Start date is required"),
  lastPaycheckDate: z.string().min(1, "Last paycheck date is required"),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
