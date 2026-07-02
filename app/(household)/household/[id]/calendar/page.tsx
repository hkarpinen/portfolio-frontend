"use client";

import { Btn, EmptyState, Icon, SectionHeader } from "@/components/editorial";
import { HouseholdTabs } from "../household-tabs";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useCalendarEvents, useDeleteCalendarEvent } from "@/hooks/use-calendar";

import { CalendarGrid } from "./calendar-grid";
import { eventCalendarDate } from "./date-helpers";
import { calendarHeadline } from "@/lib/household/editorial-copy";
import { MONTH_NAMES } from "@/lib/utils";

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
    <div className="page-enter">
      <SectionHeader
        kicker={`// ${monthName.toUpperCase()}_${year}`}
        title={headline}
        subtitle="Birthdays, bills, deadlines, gatherings — anything the household needs to put on a date."
      />

      <HouseholdTabs />

      {/* .card — month nav header (label + ← Today →) wrapping the month grid */}
      <div className="card" style={{ marginTop: 16, marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: "0.95rem" }}>
            {monthName} {year}
          </h2>
          <div className="row" style={{ gap: 6 }}>
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
      </div>

      {/* .section-h — // UPCOMING + Add event */}
      <div className="section-h">
        <h2>// UPCOMING</h2>
        <div className="actions">
          <Btn
            href={`/household/${householdId}/calendar/new`}
            variant="primary"
            size="sm"
            iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}
          >
            Add event
          </Btn>
        </div>
      </div>

      {/* Events list — Terminus date / event / who stack rows */}
      <section className="flex flex-col gap-4">
        {events.length === 0 ? (
          <EmptyState
            glyph={<Icon name="calendar" size={24} strokeWidth={1.5} />}
            kicker="// EVENTS_EMPTY"
            title={`No events filed for <em>${monthName}</em>`}
            body="Add an event and it will show up here and on the grid above."
            cta={{ label: "$ add-event →", href: `/household/${householdId}/calendar/new` }}
          />
        ) : (
          <ol className="stack">
            {events
              .slice()
              .sort(
                (a, b) => eventCalendarDate(a).getTime() - eventCalendarDate(b).getTime(),
              )
              .map((ev) => {
                // All-day events read in UTC so the date doesn't slide
                // backwards in west-of-UTC viewer timezones.
                const date = eventCalendarDate(ev).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const time = !ev.allDay
                  ? new Date(ev.startsAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "All day";
                const isBill = ev.kind === "FinanceBill";
                return (
                  <li
                    key={ev.id}
                    className="flex items-center gap-4 border-b border-border py-3 last:border-b-0"
                  >
                    {/* Amber date column (fixed width), per Terminus UPCOMING rows */}
                    <div
                      style={{
                        font: "600 0.68rem/1 var(--ff-mono)",
                        color: "var(--amber)",
                        flexShrink: 0,
                        width: 56,
                      }}
                    >
                      {date}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {isBill && (
                        <span className="badge green" aria-label="Synced from a shared expense">
                          Bill
                        </span>
                      )}
                      <span
                        className="truncate"
                        style={{ font: "500 0.78rem/1 var(--ff-mono)", color: "var(--text)" }}
                      >
                        {ev.title}
                      </span>
                    </div>
                    {/* "who" column = the time/all-day, matching the prototype's right meta */}
                    <span className="label" style={{ flexShrink: 0 }}>
                      {time}
                    </span>
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
