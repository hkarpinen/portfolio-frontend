import { api } from "@/lib/api-client";

export interface CalendarEventDto {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  allDay: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt?: string;
}

export const fetchCalendarEvents = (
  householdId: string,
  from: string,
  to: string
) =>
  api.get<CalendarEventDto[]>(
    `/api/households/${householdId}/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );

export const createCalendarEvent = (
  householdId: string,
  body: {
    title: string;
    description?: string;
    startsAt: string;
    endsAt?: string;
    allDay: boolean;
  }
) =>
  api.post<{ id: string }>(`/api/households/${householdId}/calendar`, body);

export const updateCalendarEvent = (
  householdId: string,
  eventId: string,
  body: {
    title: string;
    description?: string;
    startsAt: string;
    endsAt?: string;
    allDay: boolean;
  }
) =>
  api.put(`/api/households/${householdId}/calendar/${eventId}`, body);

export const deleteCalendarEvent = (householdId: string, eventId: string) =>
  api.delete(`/api/households/${householdId}/calendar/${eventId}`);
