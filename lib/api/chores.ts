import { api } from "@/lib/api-client";

export type RecurrenceFrequency = "Daily" | "Weekly" | "BiWeekly" | "Monthly";

export interface ChoreDto {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  assignedToUserId?: string;
  dueDate?: string;
  recurrenceFrequency?: RecurrenceFrequency;
  createdByUserId: string;
  createdAt: string;
  completedAt?: string;
  isActive: boolean;
}

export const fetchChores = (householdId: string, activeOnly = true) =>
  api.get<ChoreDto[]>(
    `/api/households/${householdId}/chores?activeOnly=${activeOnly}`
  );

export const createChore = (
  householdId: string,
  body: {
    title: string;
    description?: string;
    dueDate?: string;
    recurrenceFrequency?: RecurrenceFrequency;
  }
) => api.post<{ id: string }>(`/api/households/${householdId}/chores`, body);

export const assignChore = (
  householdId: string,
  choreId: string,
  assignToUserId: string
) =>
  api.post(`/api/households/${householdId}/chores/${choreId}/assign`, {
    assignToUserId,
  });

export const completeChore = (householdId: string, choreId: string) =>
  api.post(`/api/households/${householdId}/chores/${choreId}/complete`, {});

export const deleteChore = (householdId: string, choreId: string) =>
  api.delete(`/api/households/${householdId}/chores/${choreId}`);
