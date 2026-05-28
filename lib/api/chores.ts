import { z } from "zod";
import { api } from "@/lib/api-client";

export const RecurrenceFrequencySchema = z.enum(["Daily", "Weekly", "BiWeekly", "Monthly"]);
export type RecurrenceFrequency = z.infer<typeof RecurrenceFrequencySchema>;

export const ChoreDtoSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  assignedToUserId: z.string().optional(),
  dueDate: z.string().optional(),
  recurrenceFrequency: RecurrenceFrequencySchema.optional(),
  createdByUserId: z.string(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  isActive: z.boolean(),
});
export type ChoreDto = z.infer<typeof ChoreDtoSchema>;

const CreatedIdSchema = z.object({ id: z.string() });

export const fetchChores = (householdId: string, activeOnly = true) =>
  api.parsed.get(
    `/api/households/${householdId}/chores?activeOnly=${activeOnly}`,
    z.array(ChoreDtoSchema),
  );

export const createChore = (
  householdId: string,
  body: {
    title: string;
    description?: string;
    dueDate?: string;
    recurrenceFrequency?: RecurrenceFrequency;
  },
) => api.parsed.post(`/api/households/${householdId}/chores`, CreatedIdSchema, body);

export const assignChore = (householdId: string, choreId: string, assignToUserId: string) =>
  api.post(`/api/households/${householdId}/chores/${choreId}/assign`, {
    assignToUserId,
  });

export const completeChore = (householdId: string, choreId: string) =>
  api.post(`/api/households/${householdId}/chores/${choreId}/complete`, {});

export const deleteChore = (householdId: string, choreId: string) =>
  api.delete(`/api/households/${householdId}/chores/${choreId}`);
