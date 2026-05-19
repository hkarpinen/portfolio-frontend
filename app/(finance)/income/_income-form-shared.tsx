import { z } from "zod";

export const FREQUENCIES = ["Weekly", "BiWeekly", "Monthly", "Quarterly", "SemiAnnually", "Annually"] as const;

export const FREQUENCY_LABELS: Record<typeof FREQUENCIES[number], string> = {
  Weekly:       "Weekly",
  BiWeekly:     "Bi-Weekly",
  Monthly:      "Monthly",
  Quarterly:    "Quarterly",
  SemiAnnually: "Semi-Annually",
  Annually:     "Annually",
};

export const incomeSchema = z.object({
  source: z.string().min(1, "Source is required").max(100),
  amount: z.string().min(1, "Amount is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be positive"),
  currency: z.string().min(1),
  quotedAs: z.enum(FREQUENCIES),
  paidEvery: z.enum(FREQUENCIES),
  startDate: z.string().min(1, "Start date is required"),
  lastPaycheckDate: z.string().min(1, "Last paycheck date is required"),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
