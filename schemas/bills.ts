import { z } from "zod";

export const createHouseholdSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const createBillSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  householdId: z.string().uuid(),
});

export const updateIncomeSchema = z.object({
  householdId: z.string().uuid(),
  amount: z.number().nonnegative(),
});

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
