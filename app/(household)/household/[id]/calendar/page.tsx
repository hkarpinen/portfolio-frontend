"use client";

import {
  Btn,
  DepartmentHead,
  EditorialPageHead,
  EmptyDispatch,
  Icon,
} from "@/components/editorial";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useCalendarEvents, useDeleteCalendarEvent } from "@/hooks/use-calendar";

import { CalendarGrid } from "./calendar-grid";
import { eventCalendarDate } from "./date-helpers";
import { calendarHeadline } from "@/lib/household/editorial-copy";
import { MONTH_NAMES, pluralize } from "@/lib/utils";

export default function CalendarPage({ params }: { params: { id: string } }) {
  const { id: householdId } = params;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // The window must be in UTC, not local. Backend stores all-day events
  // (member events + bill mirrors) at UTC midnight; a local-midnight
  // `from` in a west-of-UTC zone (e.g. PDT 07:00Z) excludes the same-day
  // UTC-midnight occurrence, so bills due on the 1st silently slid into
  // the next month. UTC bounds = "the calendar dates the viewer is asking
  // for", same semantic as the eventCalendarDate display helper.
  const from = useMemo(() => new Date(Date.UTC(year, month, 1)).toISOString(), [year, month]);
  const to = useMemo(
    () => new Date(Date.UTC(year, month + 1, 0, 23, 59, 59)).toISOString(),
    [year, month],
  );

  const eventsQuery = useCalendarEvents(householdId, from, to);
  const deleteEvent = useDeleteCalendarEvent(householdId);
  const events = eventsQuery.data ?? [];

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  // month is 0–11; MONTH_NAMES has length 12. Strict-indexed-access fallback.
  const monthName = MONTH_NAMES[month] ?? "";
  const headline = calendarHeadline({ count: events.length, monthName });

  return (
    <div className="page-enter flex flex-col gap-6">
      <EditorialPageHead
        kicker={`${monthName} ${year}`}
        title={headline}
        deck="Birthdays, bills, deadlines, gatherings — anything the household needs to put on a date."
      />

      <div className="-mt-2 flex items-center justify-end gap-2">
        <Btn variant="secondary" size="sm" onClick={prevMonth} aria-label="Previous month">
          <Icon name="arrowLeft" size={14} strokeWidth={2} />
        </Btn>
        <Btn variant="secondary" size="sm" onClick={goToday}>
          Today
        </Btn>
        <Btn variant="secondary" size="sm" onClick={nextMonth} aria-label="Next month">
          <Icon name="arrowRight" size={14} strokeWidth={2} />
        </Btn>
      </div>

      {/* Calendar grid */}
      {eventsQuery.isLoading ? (
        <p className="ed-label-muted py-12 text-center">Loading…</p>
      ) : (
        <CalendarGrid
          year={year}
          month={month}
          events={events}
          onDelete={(id) => deleteEvent.mutate(id)}
          deleting={deleteEvent.isPending}
        />
      )}

      {/* Events list */}
      <section className="flex flex-col gap-4">
        <DepartmentHead
          kicker={`${monthName} · Events`}
          count={`${events.length} ${pluralize("event", events.length)}`}
          title="Posted <em>this month</em>"
        />
        {events.length === 0 ? (
          <EmptyDispatch>
            No events <em>filed</em> for {monthName}
          </EmptyDispatch>
        ) : (
          <ol className="flex flex-col">
            {events
              .slice()
              .sort(
                (a, b) => eventCalendarDate(a).getTime() - eventCalendarDate(b).getTime(),
              )
              .map((ev) => {
                // All-day events read in UTC so the date doesn't slide
                // backwards in west-of-UTC viewer timezones.
                const date = eventCalendarDate(ev).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const time = !ev.allDay
                  ? " · " +
                    new Date(ev.startsAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "";
                const isBill = ev.kind === "FinanceBill";
                return (
                  <li
                    key={ev.id}
                    className="flex items-center justify-between gap-6 border-b border-rule-soft py-3 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-serif text-md">
                        {isBill && (
                          <span
                            className="inline-flex items-center border border-green bg-green-soft px-1.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-ink"
                            aria-label="Synced from a shared expense"
                          >
                            Bill
                          </span>
                        )}
                        <span className="truncate">{ev.title}</span>
                      </p>
                      <p className="mt-1 font-mono text-sm text-ink-3">
                        {date}
                        {time}
                      </p>
                    </div>
                    {isBill && ev.linkedExpenseId ? (
                      <Link
                        href={`/household/${householdId}/expenses/${ev.linkedExpenseId}`}
                        className="inline-flex items-center gap-1 font-mono text-sm text-ink-3 no-underline transition-colors hover:text-ink"
                        aria-label={`Open expense: ${ev.title}`}
                      >
                        Open <Icon name="arrowRight" size={13} strokeWidth={2} />
                      </Link>
                    ) : (
                      <button
                        onClick={() => deleteEvent.mutate(ev.id)}
                        disabled={deleteEvent.isPending}
                        aria-label={`Delete event: ${ev.title}`}
                        className="cursor-pointer border-none bg-transparent font-mono text-sm text-ink-3 transition-colors hover:text-red"
                      >
                        <Icon name="x" size={12} strokeWidth={2.5} aria-hidden />
                      </button>
                    )}
                  </li>
                );
              })}
          </ol>
        )}
      </section>
    </div>
  );
}
