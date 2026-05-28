import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/api/calendar";
import { financeKeys } from "@/lib/query-keys";
import { invalidateHouseholdCalendar } from "@/lib/cache-invalidation";

export function useCalendarEvents(householdId: string, from: string, to: string) {
  return useQuery({
    queryKey: financeKeys.calendarEvents(householdId, from, to),
    queryFn: () => fetchCalendarEvents(householdId, from, to),
    staleTime: 30_000,
    enabled: !!householdId && !!from && !!to,
  });
}

export function useCreateCalendarEvent(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      description?: string;
      startsAt: string;
      endsAt?: string;
      allDay: boolean;
    }) => createCalendarEvent(householdId, body),
    onSuccess: () => invalidateHouseholdCalendar(queryClient, householdId),
  });
}

export function useUpdateCalendarEvent(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      ...body
    }: {
      eventId: string;
      title: string;
      description?: string;
      startsAt: string;
      endsAt?: string;
      allDay: boolean;
    }) => updateCalendarEvent(householdId, eventId, body),
    onSuccess: () => invalidateHouseholdCalendar(queryClient, householdId),
  });
}

export function useDeleteCalendarEvent(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteCalendarEvent(householdId, eventId),
    onSuccess: () => invalidateHouseholdCalendar(queryClient, householdId),
  });
}
