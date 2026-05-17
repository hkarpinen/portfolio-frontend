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


export const iStyle: React.CSSProperties = {
  height: "38px", width: "100%",
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink)",
  
  padding: "0 12px",
  fontSize: "var(--ts-body-sm)",
  color: "var(--text)",
  outline: "none",
  transition: "border-color 110ms, box-shadow 110ms",
  fontFamily: "var(--ff-body)",
};

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
        {label}
      </label>
      {children}
      {error && <span className="text-sm text-red">{error}</span>}
    </div>
  );
}

export function onFocusField(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--ink)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
}

export function onBlurField(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--ink-3)";
  e.currentTarget.style.boxShadow = "none";
}
