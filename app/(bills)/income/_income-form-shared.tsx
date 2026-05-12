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
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: "0 12px",
  fontSize: "13px",
  color: "var(--text)",
  outline: "none",
  transition: "border-color 110ms, box-shadow 110ms",
  fontFamily: "var(--ff-body)",
};

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: "11px", color: "var(--danger)" }}>{error}</span>}
    </div>
  );
}

export function onFocusField(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--accent)";
  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
}

export function onBlurField(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--border)";
  e.currentTarget.style.boxShadow = "none";
}
