import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCalendarEvents,
  fetchCalendarEvent,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  type CalendarEventBody,
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

/** Single-event fetch, used by the edit form to pre-fill from the row's rule. */
export function useCalendarEvent(householdId: string, eventId: string) {
  return useQuery({
    queryKey: ["calendarEvent", householdId, eventId],
    queryFn: () => fetchCalendarEvent(householdId, eventId),
    staleTime: 30_000,
    enabled: !!householdId && !!eventId,
  });
}

export function useCreateCalendarEvent(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CalendarEventBody) => createCalendarEvent(householdId, body),
    onSuccess: () => invalidateHouseholdCalendar(queryClient, householdId),
  });
}

export function useUpdateCalendarEvent(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: string; body: CalendarEventBody }) =>
      updateCalendarEvent(householdId, eventId, body),
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
