"use client";

import { Btn, Icon, Input, SelectField, Textarea } from "@/components/editorial";
import { useState } from "react";
import type { CalendarEventBody, RecurrenceFrequency } from "@/lib/api/calendar";
import { RecurrenceFrequencyValues } from "@/lib/api/calendar";
import { isoToDateInput } from "./date-helpers";

/** Friendly labels for the wire enum (which uses PascalCase identifiers). */
const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  Daily: "Daily",
  Weekly: "Weekly",
  BiWeekly: "Every 2 weeks",
  Monthly: "Monthly",
  Quarterly: "Every 3 months",
  SemiAnnually: "Every 6 months",
  Annually: "Yearly",
};

export interface CalendarEventFormValues {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  allDay: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  recurrenceFrequency: RecurrenceFrequency | "";
  recurrenceEndDate: string; // YYYY-MM-DD or ""
}

const EMPTY: CalendarEventFormValues = {
  title: "",
  description: "",
  date: "",
  allDay: true,
  startTime: "09:00",
  endTime: "10:00",
  recurrenceFrequency: "",
  recurrenceEndDate: "",
};

/**
 * Shared form used by both `new` and `[eventId]/edit`. Owns its own input
 * state; the parent supplies an `initialValues` snapshot, the submit handler,
 * and a pending/error pair. The serialised `CalendarEventBody` is what the
 * household API expects — recurrence fields drop out when no frequency is
 * picked so the wire payload stays minimal.
 */
export function CalendarEventForm({
  mode,
  initialValues,
  isPending,
  errorMessage,
  onSubmit,
  cancelHref,
}: {
  mode: "create" | "edit";
  initialValues?: Partial<CalendarEventFormValues>;
  isPending: boolean;
  errorMessage: string | null;
  onSubmit: (body: CalendarEventBody) => void;
  cancelHref: string;
}) {
  const [values, setValues] = useState<CalendarEventFormValues>({ ...EMPTY, ...initialValues });

  function update<K extends keyof CalendarEventFormValues>(k: K, v: CalendarEventFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim() || !values.date) return;

    const startsAtIso = values.allDay
      ? new Date(values.date + "T00:00:00Z").toISOString()
      : new Date(`${values.date}T${values.startTime}:00`).toISOString();
    const endsAtIso = values.allDay
      ? undefined
      : values.endTime
        ? new Date(`${values.date}T${values.endTime}:00`).toISOString()
        : undefined;
    const recurrenceFrequency = values.recurrenceFrequency || undefined;
    const recurrenceEndDate =
      recurrenceFrequency && values.recurrenceEndDate
        ? new Date(values.recurrenceEndDate + "T00:00:00Z").toISOString()
        : undefined;

    onSubmit({
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      startsAt: startsAtIso,
      endsAt: endsAtIso,
      allDay: values.allDay,
      recurrenceFrequency,
      recurrenceEndDate,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Input
        label="Title"
        value={values.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="e.g. House inspection"
        autoFocus={mode === "create"}
      />

      <Textarea
        label="Description"
        className="min-h-40"
        value={values.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="Optional notes…"
      />

      <div className="grid grid-cols-2 items-end gap-6">
        <Input
          label="Date"
          type="date"
          value={values.date}
          onChange={(e) => update("date", e.target.value)}
        />
        <div className="flex items-center gap-3 pb-[9px]">
          <input
            id="allday"
            type="checkbox"
            checked={values.allDay}
            onChange={(e) => update("allDay", e.target.checked)}
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

      {!values.allDay && (
        <div className="grid grid-cols-2 gap-6">
          <Input
            label="Start time"
            type="time"
            value={values.startTime}
            onChange={(e) => update("startTime", e.target.value)}
          />
          <Input
            label="End time"
            type="time"
            value={values.endTime}
            onChange={(e) => update("endTime", e.target.value)}
          />
        </div>
      )}

      {/* Recurrence — empty string means "no recurrence" sentinel. The end-date
       * input only renders once a frequency is picked, matching the data model
       * where end-date is meaningless without a rule. */}
      <div className="grid grid-cols-2 gap-6">
        <SelectField
          label="Repeats"
          value={values.recurrenceFrequency}
          onChange={(e) => update("recurrenceFrequency", e.target.value as RecurrenceFrequency | "")}
        >
          <option value="">Doesn’t repeat</option>
          {RecurrenceFrequencyValues.map((f) => (
            <option key={f} value={f}>
              {FREQUENCY_LABELS[f]}
            </option>
          ))}
        </SelectField>
        {values.recurrenceFrequency && (
          <Input
            label="Ends on (optional)"
            type="date"
            value={values.recurrenceEndDate}
            onChange={(e) => update("recurrenceEndDate", e.target.value)}
          />
        )}
      </div>

      {errorMessage && (
        <p role="alert" className="font-mono text-base text-red">
          {errorMessage}
        </p>
      )}

      <div className="flex gap-3">
        <Btn
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending || !values.title.trim() || !values.date}
          iconRight={<Icon name="arrowRight" size={16} />}
        >
          {isPending ? "Saving…" : mode === "create" ? "Create event" : "Save changes"}
        </Btn>
        <Btn href={cancelHref} variant="secondary" size="lg">
          Cancel
        </Btn>
      </div>
    </form>
  );
}

/** Helper: split an ISO datetime into the form's date/time components.
 *  All-day events read their date in UTC so the form pre-fill doesn't slide
 *  to the previous day in west-of-UTC timezones. */
export function isoToFormValues(
  ev: {
    startsAt: string;
    endsAt?: string | null;
    allDay: boolean;
    title: string;
    description?: string | null;
    recurrenceFrequency?: RecurrenceFrequency | null;
    recurrenceEndDate?: string | null;
  },
): Partial<CalendarEventFormValues> {
  const start = new Date(ev.startsAt);
  const end = ev.endsAt ? new Date(ev.endsAt) : null;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return {
    title: ev.title,
    description: ev.description ?? "",
    allDay: ev.allDay,
    date: isoToDateInput(ev.startsAt, ev.allDay),
    startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    endTime: end ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : "10:00",
    recurrenceFrequency: ev.recurrenceFrequency ?? "",
    // Recurrence end-date is also a date-only field; treat it like an
    // all-day stamp regardless of the parent event's `allDay` flag.
    recurrenceEndDate: ev.recurrenceEndDate ? isoToDateInput(ev.recurrenceEndDate, true) : "",
  };
}
