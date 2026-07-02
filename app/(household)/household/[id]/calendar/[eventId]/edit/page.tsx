"use client";

import { ArrowLink, SectionHeader } from "@/components/editorial";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCalendarEvent, useUpdateCalendarEvent } from "@/hooks/use-calendar";
import { getErrorMessage } from "@/lib/error-messages";
import { CalendarEventForm, isoToFormValues } from "../../event-form";

export default function EditCalendarEventPage({
  params,
}: {
  params: { id: string; eventId: string };
}) {
  const router = useRouter();
  const { id: householdId, eventId } = params;

  const eventQuery = useCalendarEvent(householdId, eventId);
  const updateEvent = useUpdateCalendarEvent(householdId);

  const initial = useMemo(
    () => (eventQuery.data ? isoToFormValues(eventQuery.data) : undefined),
    [eventQuery.data],
  );

  const backHref = `/household/${householdId}/calendar`;
  const isBill = eventQuery.data?.kind === "FinanceBill";

  return (
    <div className="page-enter flex max-w-[640px] flex-col gap-8">
      <ArrowLink href={backHref} direction="left" className="ed-label-muted">
        Calendar
      </ArrowLink>

      <SectionHeader kicker="Edit event" title="Edit <em>event</em>" />

      {eventQuery.isLoading ? (
        <p className="ed-label-muted">Loading…</p>
      ) : !eventQuery.data ? (
        <p role="alert" className="font-mono text-base text-red">
          Event not found.
        </p>
      ) : isBill ? (
        // Bill mirrors are upstream-owned; the backend would 403 a PUT here.
        // Send the user to the underlying expense detail instead.
        <div className="border border-border bg-paper-2 px-6 py-5">
          <p className="font-serif text-md">
            This event is synced from a shared expense and is read-only here.
          </p>
          <p className="mt-2 font-mono text-sm text-ink-3">
            Edit the bill to change its title or due date.
          </p>
          <p className="mt-4">
            <ArrowLink
              href={`/household/${householdId}/expenses/${eventQuery.data.linkedExpenseId}`}
              className="font-mono text-sm"
            >
              Open expense
            </ArrowLink>
          </p>
        </div>
      ) : (
        <CalendarEventForm
          mode="edit"
          // `initial` is stable across renders via useMemo, but the form's
          // useState only seeds on first mount — so a slow GET means the
          // initial render carries empty defaults. Keying the form on the
          // resolved id forces a remount once data arrives.
          key={eventQuery.data.id}
          initialValues={initial}
          isPending={updateEvent.isPending}
          errorMessage={
            updateEvent.isError
              ? getErrorMessage(updateEvent.error, "Failed to update event.")
              : null
          }
          onSubmit={(body) =>
            updateEvent.mutate({ eventId, body }, { onSuccess: () => router.push(backHref) })
          }
          cancelHref={backHref}
        />
      )}
    </div>
  );
}
