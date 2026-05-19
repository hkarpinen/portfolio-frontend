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
