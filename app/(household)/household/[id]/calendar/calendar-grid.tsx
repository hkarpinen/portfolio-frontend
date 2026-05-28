"use client";

import { Btn } from "@/components/editorial";
import { useState } from "react";
import type { CalendarEventDto } from "@/lib/api/calendar";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface CalendarGridProps {
  year: number;
  month: number;
  events: CalendarEventDto[];
  onDelete: (id: string) => void;
  deleting: boolean;
}

export function CalendarGrid({ year, month, events, onDelete, deleting }: CalendarGridProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();

  function eventsForDay(day: number) {
    const d = new Date(year, month, day);
    return events.filter((e) => isSameDay(new Date(e.startsAt), d));
  }

  const selectedEvent = selected ? events.find((e) => e.id === selected) : null;

  const MONTHS_LONG = [
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

  return (
    <div>
      {/* Calendar grid — role=grid for keyboard navigation context */}
      <div role="grid" aria-label={`${MONTHS_LONG[month]} ${year} calendar`}>
        {/* Day headers — role=row + columnheader */}
        <div role="row" className="grid grid-cols-7 border-b border-t border-ink">
          {DAYS.map((d) => (
            <div
              key={d}
              role="columnheader"
              aria-label={d}
              className="border-r border-ink-4 p-[8px_0] text-center font-mono text-sm uppercase tracking-[0.08em] text-ink-3"
            >
              <span aria-hidden>{d}</span>
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 border border-t-0 border-ink">
          {cells.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  role="gridcell"
                  aria-label="No date"
                  className={`min-h-40 bg-paper-2${(idx + 1) % 7 !== 0 ? "border-r border-ink-4" : ""}${idx < cells.length - 7 ? "border-b border-ink-4" : ""}`}
                />
              );
            }
            const dayEvents = eventsForDay(day);
            const isToday = isSameDay(new Date(year, month, day), today);
            const dateLabel = `${MONTHS_LONG[month]} ${day}${isToday ? ", today" : ""}${dayEvents.length > 0 ? `, ${dayEvents.length} event${dayEvents.length !== 1 ? "s" : ""}` : ""}`;

            return (
              <div
                key={day}
                role="gridcell"
                aria-label={dateLabel}
                className={`min-h-40 bg-paper p-3 align-top${(idx + 1) % 7 !== 0 ? "border-r border-ink-4" : ""}${idx < cells.length - 7 ? "border-b border-ink-4" : ""}`}
              >
                {/* bg/color/weight are data-driven (isToday); red per design */}
                <span
                  aria-hidden
                  className={`inline-block h-6 w-6 text-center font-mono leading-6 text-base${isToday ? "bg-red font-bold text-paper" : "bg-none font-normal text-ink"}`}
                >
                  {day}
                </span>
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setSelected(ev.id === selected ? null : ev.id)}
                    aria-expanded={selected === ev.id}
                    aria-label={`${ev.title}${ev.allDay ? ", all day" : ""} — click to ${selected === ev.id ? "close" : "view"} details`}
                    className={`mt-1.5 block w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border px-2 py-1 text-left font-mono text-[0.66rem] uppercase tracking-[0.06em] border-red${selected === ev.id ? "bg-ink text-paper" : "bg-red-soft text-ink"}`}
                  >
                    <span aria-hidden>{ev.title}</span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="mt-1 pl-2 font-mono text-[0.66rem] tracking-[0.04em] text-ink-3">
                    +{dayEvents.length - 3} more
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected event detail — aria-live so screen readers catch the expansion */}
      <div aria-live="polite" aria-atomic="true">
        {selectedEvent && (
          <div
            className="mt-8 border border-ink bg-paper px-10 py-8 shadow-card"
            role="region"
            aria-label={`Event detail: ${selectedEvent.title}`}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-serif text-xl leading-[1.15]">{selectedEvent.title}</p>
                {selectedEvent.description && (
                  <p className="mt-2 text-base text-ink-3">{selectedEvent.description}</p>
                )}
                <p className="mt-4 font-mono text-sm tracking-[0.05em] text-ink-3">
                  {selectedEvent.allDay
                    ? "All day"
                    : new Date(selectedEvent.startsAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                  {selectedEvent.endsAt && !selectedEvent.allDay && (
                    <>
                      {" "}
                      {" → "}{" "}
                      {new Date(selectedEvent.endsAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>
              </div>
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => {
                  onDelete(selectedEvent.id);
                  setSelected(null);
                }}
                disabled={deleting}
                aria-label={`Delete event: ${selectedEvent.title}`}
              >
                Delete
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
