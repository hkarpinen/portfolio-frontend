"use client";

import { Btn, Icon, Input, SectionHeader, Textarea } from "@/components/editorial";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateCalendarEvent } from "@/hooks/use-calendar";
import { getErrorMessage } from "@/lib/error-messages";

export default function NewCalendarEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: householdId } = params;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const createEvent = useCreateCalendarEvent(householdId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Pre-mutation validation — submit is disabled below if either is missing.
    if (!title.trim() || !date) return;

    const startsAtIso = allDay
      ? new Date(date + "T00:00:00Z").toISOString()
      : new Date(`${date}T${startTime}:00`).toISOString();
    const endsAtIso = allDay
      ? undefined
      : endTime
        ? new Date(`${date}T${endTime}:00`).toISOString()
        : undefined;

    createEvent.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: startsAtIso,
        endsAt: endsAtIso,
        allDay,
      },
      { onSuccess: () => router.push(`/household/${householdId}/calendar`) },
    );
  }

  return (
    <div className="page-enter flex max-w-[640px] flex-col gap-8">
      <Link
        href={`/household/${householdId}/calendar`}
        className="ed-label-muted no-underline hover:text-red"
      >
        ← Calendar
      </Link>

      <SectionHeader kicker="New event" title="New <em>event</em>" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. House inspection"
          autoFocus
        />

        <Textarea
          label="Description"
          className="min-h-[80px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes…"
        />

        {/* Date + All-day row */}
        <div className="grid grid-cols-2 items-end gap-6">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="flex items-center gap-3 pb-[9px]">
            <input
              id="allday"
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-neutral-900"
            />
            <label
              htmlFor="allday"
              className="cursor-pointer font-mono text-xs uppercase tracking-[0.1em] text-ink-2"
            >
              All day
            </label>
          </div>
        </div>

        {/* Time inputs — only shown when not all-day */}
        {!allDay && (
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Start time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="End time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        )}

        {createEvent.isError && (
          <p role="alert" className="font-mono text-base text-red">
            {getErrorMessage(createEvent.error, "Failed to create event.")}
          </p>
        )}

        <div className="flex gap-3">
          <Btn
            type="submit"
            variant="primary"
            size="lg"
            disabled={createEvent.isPending || !title.trim() || !date}
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            {createEvent.isPending ? "Saving…" : "Create event"}
          </Btn>
          <Btn href={`/household/${householdId}/calendar`} variant="secondary" size="lg">
            Cancel
          </Btn>
        </div>
      </form>
    </div>
  );
}
