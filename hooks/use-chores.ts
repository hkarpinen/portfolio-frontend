import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchChores,
  createChore,
  assignChore,
  completeChore,
  deleteChore,
} from "@/lib/api/chores";
import { financeKeys } from "@/lib/query-keys";
import type { RecurrenceFrequency } from "@/lib/api/chores";

export function useChores(householdId: string, activeOnly = true) {
  return useQuery({
    queryKey: financeKeys.chores(householdId),
    queryFn: () => fetchChores(householdId, activeOnly),
    staleTime: 30_000,
    enabled: !!householdId,
  });
}

export function useCreateChore(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      description?: string;
      dueDate?: string;
      recurrenceFrequency?: RecurrenceFrequency;
    }) => createChore(householdId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.chores(householdId) });
    },
  });
}

export function useAssignChore(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ choreId, assignToUserId }: { choreId: string; assignToUserId: string }) =>
      assignChore(householdId, choreId, assignToUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.chores(householdId) });
    },
  });
}

export function useCompleteChore(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (choreId: string) => completeChore(householdId, choreId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.chores(householdId) });
    },
  });
}

export function useDeleteChore(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (choreId: string) => deleteChore(householdId, choreId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.chores(householdId) });
    },
  });
}
