import { z } from "zod";

export const createHouseholdSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const createHouseholdExpenseSchema = z.object({
  title: z.string().min(1).max(300),
  amount: z.number().positive(),
  dueDate: z.string().min(1),
  householdId: z.string().uuid(),
});

export const updateIncomeSchema = z.object({
  householdId: z.string().uuid(),
  amount: z.number().nonnegative(),
});

