import { z } from "zod";
import { api } from "@/lib/api-client";

// Wire-shape enum of household.RecurrenceFrequency — must stay aligned with
// household's C# enum (same names, same order). Used by recurring member
// events and by the bill-mirror rows whose schedule is mirrored from finance.
export const RecurrenceFrequencyValues = [
  "Daily",
  "Weekly",
  "BiWeekly",
  "Monthly",
  "Quarterly",
  "SemiAnnually",
  "Annually",
] as const;
export type RecurrenceFrequency = (typeof RecurrenceFrequencyValues)[number];
export const RecurrenceFrequencySchema = z.enum(RecurrenceFrequencyValues);

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
  // `kind` discriminates a member-created event from a finance-bill mirror;
  // bill entries also carry `linkedExpenseId` so the UI can link to the bill.
  // Default to "Member" when older payloads predate the field.
  kind: z.enum(["Member", "FinanceBill"]).default("Member"),
  linkedExpenseId: z.string().nullish(),
  recurrenceFrequency: RecurrenceFrequencySchema.nullish(),
  recurrenceEndDate: z.string().nullish(),
});
export type CalendarEventDto = z.infer<typeof CalendarEventDtoSchema>;

const CreatedIdSchema = z.object({ id: z.string() });

export type CalendarEventBody = {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  allDay: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: string;
};

export const fetchCalendarEvents = (householdId: string, from: string, to: string) =>
  api.parsed.get(
    `/api/households/${householdId}/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    z.array(CalendarEventDtoSchema),
  );

export const fetchCalendarEvent = (householdId: string, eventId: string) =>
  api.parsed.get(
    `/api/households/${householdId}/calendar/${eventId}`,
    CalendarEventDtoSchema,
  );

export const createCalendarEvent = (householdId: string, body: CalendarEventBody) =>
  api.parsed.post(`/api/households/${householdId}/calendar`, CreatedIdSchema, body);

export const updateCalendarEvent = (
  householdId: string,
  eventId: string,
  body: CalendarEventBody,
) => api.put(`/api/households/${householdId}/calendar/${eventId}`, body);

export const deleteCalendarEvent = (householdId: string, eventId: string) =>
  api.delete(`/api/households/${householdId}/calendar/${eventId}`);
