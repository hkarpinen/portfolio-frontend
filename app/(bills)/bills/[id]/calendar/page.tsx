"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCalendarEvents, useDeleteCalendarEvent } from "@/hooks/use-calendar";
import type { CalendarEventDto } from "@/lib/api/calendar";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function CalendarGrid({
  year,
  month,
  events,
  onDelete,
  deleting,
}: {
  year: number;
  month: number;
  events: CalendarEventDto[];
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();

  function eventsForDay(day: number) {
    const d = new Date(year, month, day);
    return events.filter((e) => isSameDay(new Date(e.startsAt), d));
  }

  const selectedEvent = selected ? events.find((e) => e.id === selected) : null;

  return (
    <div>
      {/* Day headers */}
      <div
        className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--ink)", borderTop: "1px solid var(--ink)" }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            className="p-[8px_0] text-center font-mono text-sm tracking-[0.08em] uppercase text-ink-3" style={{ borderRight: "1px solid var(--ink-4)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div
        className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", border: "1px solid var(--ink)", borderTop: "none" }}
      >
        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[80] bg-paper-2" style={{ borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--ink-4)" : undefined, borderBottom: idx < cells.length - 7 ? "1px solid var(--ink-4)" : undefined }}
              />
            );
          }
          const dayEvents = eventsForDay(day);
          const isToday = isSameDay(new Date(year, month, day), today);

          return (
            <div
              key={day}
              className="min-h-[80] p-3 bg-paper align-top" style={{ borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--ink-4)" : undefined, borderBottom: idx < cells.length - 7 ? "1px solid var(--ink-4)" : undefined }}
            >
              <span
                className="inline-block w-[24] h-[24] leading-[24px] text-center font-mono text-base" style={{ background: isToday ? "var(--ink)" : "none", color: isToday ? "var(--paper)" : "var(--ink)", fontWeight: isToday ? 700 : 400 }}
              >
                {day}
              </span>
              {dayEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelected(ev.id === selected ? null : ev.id)}
                  className="block w-full text-left mt-[3] py-1 px-2 font-body text-sm cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap" style={{ background: selected === ev.id ? "var(--ink)" : "var(--red-soft)", color: selected === ev.id ? "var(--paper)" : "var(--ink)", border: "1px solid var(--red)" }}
                >
                  {ev.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Selected event detail */}
      {selectedEvent && (
        <div
          className="mt-8 py-8 px-10 shadow-card bg-paper" style={{ border: "1px solid var(--ink)" }}
        >
          <div className="flex justify-between items-start gap-6">
            <div>
              <p
                className="font-serif text-xl leading-[1.15]"
              >
                {selectedEvent.title}
              </p>
              {selectedEvent.description && (
                <p className="text-base text-ink-3 mt-2">
                  {selectedEvent.description}
                </p>
              )}
              <p
                className="font-mono text-sm text-ink-3 mt-4 tracking-[0.05em]"
              >
                {selectedEvent.allDay
                  ? "All day"
                  : new Date(selectedEvent.startsAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                {selectedEvent.endsAt && !selectedEvent.allDay && (
                  <>
                    {" → "}
                    {new Date(selectedEvent.endsAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                onDelete(selectedEvent.id);
                setSelected(null);
              }}
              disabled={deleting}
              className="bg-transparent py-[6px] px-[14px] font-mono text-sm tracking-[0.05em] uppercase cursor-pointer text-ink" style={{ border: "1px solid var(--ink)" }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
          className="bg-transparent w-[36] h-[36] cursor-pointer font-mono text-md text-ink" style={{ border: "1px solid var(--ink)" }}
        >
          ‹
        </button>
        <h2
          className="font-serif text-2xl tracking-[-0.01em]"
        >
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
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
                  className="bg-transparent cursor-pointer text-ink-3 font-mono text-sm" style={{ border: "none" }}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
