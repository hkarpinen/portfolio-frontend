"use client";

import { useState, useMemo } from "react";
import { useCalendarEvents, useDeleteCalendarEvent } from "@/hooks/use-calendar";
import { Icon } from "@/components/editorial/icon";
import { Btn } from "@/components/editorial/button";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { DepartmentHead } from "@/components/editorial/department-head";
import { EmptyDispatch } from "@/components/editorial/empty-dispatch";
import { CalendarGrid } from "./calendar-grid";
import { calendarHeadline } from "@/lib/household/editorial-copy";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarPage({ params }: { params: { id: string } }) {
  const { id: householdId } = params;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const from = useMemo(() => new Date(year, month, 1).toISOString(), [year, month]);
  const to = useMemo(() => new Date(year, month + 1, 0, 23, 59, 59).toISOString(), [year, month]);

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

  const monthName = MONTHS[month];
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
          ←
        </Btn>
        <Btn variant="secondary" size="sm" onClick={goToday}>
          Today
        </Btn>
        <Btn variant="secondary" size="sm" onClick={nextMonth} aria-label="Next month">
          →
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
          count={`${events.length} event${events.length === 1 ? "" : "s"}`}
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
              .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
              .map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center justify-between gap-6 border-b border-rule-soft py-3 last:border-b-0"
                >
                  <div>
                    <p className="font-serif text-md">{ev.title}</p>
                    <p className="mt-1 font-mono text-sm text-ink-3">
                      {new Date(ev.startsAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {!ev.allDay &&
                        " · " +
                          new Date(ev.startsAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEvent.mutate(ev.id)}
                    disabled={deleteEvent.isPending}
                    aria-label={`Delete event: ${ev.title}`}
                    className="cursor-pointer border-none bg-transparent font-mono text-sm text-ink-3 transition-colors hover:text-red"
                  >
                    <Icon name="x" size={12} strokeWidth={2.5} aria-hidden />
                  </button>
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}
