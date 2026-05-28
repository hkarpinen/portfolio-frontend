import { z } from "zod";
import { ExpenseCategory } from "@/types/expense";
import { Frequency } from "@/types/schedule";

/** Frequencies the expense form doesn't offer as a billing cadence.
 *  Daily isn't useful as a billing cadence. OneTime is filtered here
 *  until the backend mirrors it — see TODO below. */
const EXPENSE_FORM_HIDDEN_FREQUENCIES: readonly Frequency[] = [Frequency.Daily, Frequency.OneTime];

export const EXPENSE_FREQUENCY_OPTIONS: readonly Frequency[] = Object.values(Frequency).filter(
  (f) => !EXPENSE_FORM_HIDDEN_FREQUENCIES.includes(f),
);

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be positive"),
  currency: z.string().min(1),
  category: z.enum(ExpenseCategory),
  dueDate: z.string().min(1, "Due date is required"),
  // TODO(backend-OneTime): once finance/RecurrenceFrequency adds OneTime + backfills
  // existing nulls, tighten to `z.enum(Frequency)` (required, no empty literal).
  recurrenceFrequency: z.enum(Frequency).optional().or(z.literal("")),
  description: z.string().max(2000).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
