"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCalendarEvents, useDeleteCalendarEvent } from "@/hooks/use-calendar";
import { Icon } from "@/components/editorial/icon";
import { CalendarGrid } from "./calendar-grid";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage({ params }: { params: { id: string } }) {
  const { id: householdId } = params;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const from = useMemo(
    () => new Date(year, month, 1).toISOString(),
    [year, month]
  );
  const to = useMemo(
    () => new Date(year, month + 1, 0, 23, 59, 59).toISOString(),
    [year, month]
  );

  const eventsQuery = useCalendarEvents(householdId, from, to);
  const deleteEvent = useDeleteCalendarEvent(householdId);
  const events = eventsQuery.data ?? [];

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  return (
    <div className="page-enter flex flex-col gap-12" >
      {/* Header */}
      <div
        className="flex items-start justify-between flex-wrap gap-6 pb-8" style={{ borderBottom: "2px solid var(--ink)" }}
      >
        <div>
          <Link
            href={`/bills/${householdId}`}
            className="font-mono text-sm tracking-[0.08em] uppercase text-ink-3 no-underline"
          >
            ← Household
          </Link>
          <h1
            className="font-serif text-4xl leading-none mt-2"
          >
            Calendar
          </h1>
        </div>
        <Link
          href={`/bills/${householdId}/calendar/new`}
          className="bg-ink text-paper py-5 px-10 font-mono text-base tracking-[0.05em] uppercase no-underline inline-block"
        >
          + New Event
        </Link>
      </div>

      {/* Month navigator */}
      <div
        className="flex items-center justify-between"
      >
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="bg-transparent w-[36] h-[36] cursor-pointer font-mono text-md text-ink" style={{ border: "1px solid var(--ink)" }}
        >
          ‹
        </button>
        <h2 className="font-serif text-2xl tracking-[-0.01em]">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="bg-transparent w-[36] h-[36] cursor-pointer font-mono text-md text-ink" style={{ border: "1px solid var(--ink)" }}
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      {eventsQuery.isLoading ? (
        <p
          className="text-center p-[48px_0] font-mono text-base text-ink-3"
        >
          Loading…
        </p>
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
      {events.length > 0 && (
        <div className="pt-8" style={{ borderTop: "1px solid var(--ink-4)" }}>
          <p
            className="font-mono text-sm tracking-[0.08em] uppercase text-ink-3 mb-6"
          >
            {events.length} event{events.length !== 1 ? "s" : ""} this month
          </p>
          {events
            .slice()
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
            .map((ev) => (
              <div
                key={ev.id}
                className="flex justify-between items-center p-[10px_0] gap-6" style={{ borderBottom: "1px solid var(--ink-4)" }}
              >
                <div>
                  <p className="font-serif text-md">
                    {ev.title}
                  </p>
                  <p
                    className="font-mono text-sm text-ink-3 mt-1"
                  >
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
                  aria-label="Delete event"
                  className="bg-transparent cursor-pointer text-ink-3 font-mono text-sm" style={{ border: "none" }}
                >
                  <Icon name="x" size={12} strokeWidth={2.5} />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
