"use client";

import { useState } from "react";
import type { CalendarEventDto } from "@/lib/api/calendar";
import { Btn } from "@/components/editorial/button";

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
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  return (
    <div>
      {/* Calendar grid — role=grid for keyboard navigation context */}
      <div
        role="grid"
        aria-label={`${MONTHS_LONG[month]} ${year} calendar`}
      >
        {/* Day headers — role=row + columnheader */}
        <div role="row" className="grid grid-cols-7 border-t border-b border-ink">
          {DAYS.map((d) => (
            <div
              key={d}
              role="columnheader"
              aria-label={d}
              className="p-[8px_0] text-center font-mono text-sm tracking-[0.08em] uppercase text-ink-3 border-r border-ink-4"
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
                  className={`min-h-[80px] bg-paper-2${(idx + 1) % 7 !== 0 ? " border-r border-ink-4" : ""}${idx < cells.length - 7 ? " border-b border-ink-4" : ""}`}
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
                className={`min-h-[80px] p-3 bg-paper align-top${(idx + 1) % 7 !== 0 ? " border-r border-ink-4" : ""}${idx < cells.length - 7 ? " border-b border-ink-4" : ""}`}
              >
                {/* bg/color/weight are data-driven (isToday); red per design */}
                <span
                  aria-hidden
                  className={`inline-block w-6 h-6 leading-6 text-center font-mono text-base${isToday ? " bg-red text-paper font-bold" : " bg-none text-ink font-normal"}`}
                >
                  {day}
                </span>
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setSelected(ev.id === selected ? null : ev.id)}
                    aria-expanded={selected === ev.id}
                    aria-label={`${ev.title}${ev.allDay ? ", all day" : ""} — click to ${selected === ev.id ? "close" : "view"} details`}
                    className={`block w-full text-left mt-[3px] py-[2px] px-2 font-mono text-[0.66rem] tracking-[0.06em] uppercase cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border border-red${selected === ev.id ? " bg-ink text-paper" : " bg-red-soft text-ink"}`}
                  >
                    <span aria-hidden>{ev.title}</span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="font-mono text-[0.66rem] tracking-[0.04em] text-ink-3 mt-[2px] pl-2">
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
          <div className="mt-8 py-8 px-10 shadow-card bg-paper border border-ink" role="region" aria-label={`Event detail: ${selectedEvent.title}`}>
            <div className="flex justify-between items-start gap-6">
              <div>
                <p className="font-serif text-xl leading-[1.15]">{selectedEvent.title}</p>
                {selectedEvent.description && (
                  <p className="text-base text-ink-3 mt-2">{selectedEvent.description}</p>
                )}
                <p className="font-mono text-sm text-ink-3 mt-4 tracking-[0.05em]">
                  {selectedEvent.allDay
                    ? "All day"
                    : new Date(selectedEvent.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  {selectedEvent.endsAt && !selectedEvent.allDay && (
                    <> {" → "} {new Date(selectedEvent.endsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</>
                  )}
                </p>
              </div>
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => { onDelete(selectedEvent.id); setSelected(null); }}
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
