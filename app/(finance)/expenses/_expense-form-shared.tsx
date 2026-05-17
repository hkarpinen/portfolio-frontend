import { z } from "zod";

export const BILL_CATEGORIES = [
  "Rent", "Utilities", "Groceries", "Transportation", "Entertainment",
  "Healthcare", "Insurance", "Subscriptions", "Internet", "Phone", "Other",
] as const;

export const FREQUENCIES = ["Monthly", "Weekly", "BiWeekly", "Quarterly", "SemiAnnually", "Annually"] as const;

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  amount: z.string().min(1, "Amount is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be positive"),
  currency: z.string().min(1),
  category: z.enum(BILL_CATEGORIES),
  dueDate: z.string().min(1, "Due date is required"),
  recurrenceFrequency: z.enum(FREQUENCIES).optional().or(z.literal("")),
  description: z.string().max(2000).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

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

export function onFocusField(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--ink)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
}

export function onBlurField(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--ink-3)";
  e.currentTarget.style.boxShadow = "none";
}
