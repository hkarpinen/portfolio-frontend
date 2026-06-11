"use client";

import { ArrowLink, SectionHeader } from "@/components/editorial";
import { useRouter } from "next/navigation";
import { useCreateCalendarEvent } from "@/hooks/use-calendar";
import { getErrorMessage } from "@/lib/error-messages";
import { CalendarEventForm } from "../event-form";

export default function NewCalendarEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: householdId } = params;
  const createEvent = useCreateCalendarEvent(householdId);

  return (
    <div className="page-enter flex max-w-[640px] flex-col gap-8">
      <ArrowLink
        href={`/household/${householdId}/calendar`}
        direction="left"
        className="ed-label-muted"
      >
        Calendar
      </ArrowLink>

      <SectionHeader kicker="New event" title="New <em>event</em>" />

      <CalendarEventForm
        mode="create"
        isPending={createEvent.isPending}
        errorMessage={
          createEvent.isError ? getErrorMessage(createEvent.error, "Failed to create event.") : null
        }
        onSubmit={(body) =>
          createEvent.mutate(body, {
            onSuccess: () => router.push(`/household/${householdId}/calendar`),
          })
        }
        cancelHref={`/household/${householdId}/calendar`}
      />
    </div>
  );
}
