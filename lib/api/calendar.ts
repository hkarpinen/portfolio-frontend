import { z } from "zod";
import { api } from "@/lib/api-client";

export const CalendarEventDtoSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  startsAt: z.string(),
  endsAt: z.string().nullish(),
  allDay: z.boolean(),
  createdByUserId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullish(),
});
export type CalendarEventDto = z.infer<typeof CalendarEventDtoSchema>;

const CreatedIdSchema = z.object({ id: z.string() });

export const fetchCalendarEvents = (householdId: string, from: string, to: string) =>
  api.parsed.get(
    `/api/households/${householdId}/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    z.array(CalendarEventDtoSchema),
  );

export const createCalendarEvent = (
  householdId: string,
  body: {
    title: string;
    description?: string;
    startsAt: string;
    endsAt?: string;
    allDay: boolean;
  },
) => api.parsed.post(`/api/households/${householdId}/calendar`, CreatedIdSchema, body);

export const deleteCalendarEvent = (householdId: string, eventId: string) =>
  api.delete(`/api/households/${householdId}/calendar/${eventId}`);
