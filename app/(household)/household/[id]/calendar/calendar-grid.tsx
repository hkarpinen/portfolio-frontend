"use client";

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

  return (
    <div>
      {/* Day headers */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--ink)", borderTop: "1px solid var(--ink)" }}>
        {DAYS.map((d) => (
          <div key={d} className="p-[8px_0] text-center font-mono text-sm tracking-[0.08em] uppercase text-ink-3" style={{ borderRight: "1px solid var(--ink-4)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", border: "1px solid var(--ink)", borderTop: "none" }}>
        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[80] bg-paper-2"
                style={{ borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--ink-4)" : undefined, borderBottom: idx < cells.length - 7 ? "1px solid var(--ink-4)" : undefined }}
              />
            );
          }
          const dayEvents = eventsForDay(day);
          const isToday = isSameDay(new Date(year, month, day), today);

          return (
            <div
              key={day}
              className="min-h-[80] p-3 bg-paper align-top"
              style={{ borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--ink-4)" : undefined, borderBottom: idx < cells.length - 7 ? "1px solid var(--ink-4)" : undefined }}
            >
              <span
                className="inline-block w-[24] h-[24] leading-[24px] text-center font-mono text-base"
                style={{ background: isToday ? "var(--ink)" : "none", color: isToday ? "var(--paper)" : "var(--ink)", fontWeight: isToday ? 700 : 400 }}
              >
                {day}
              </span>
              {dayEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelected(ev.id === selected ? null : ev.id)}
                  className="block w-full text-left mt-[3] py-1 px-2 font-body text-sm cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ background: selected === ev.id ? "var(--ink)" : "var(--red-soft)", color: selected === ev.id ? "var(--paper)" : "var(--ink)", border: "1px solid var(--red)" }}
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
        <div className="mt-8 py-8 px-10 shadow-card bg-paper" style={{ border: "1px solid var(--ink)" }}>
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
            <button
              onClick={() => { onDelete(selectedEvent.id); setSelected(null); }}
              disabled={deleting}
              className="bg-transparent py-[6px] px-[14px] font-mono text-sm tracking-[0.05em] uppercase cursor-pointer text-ink"
              style={{ border: "1px solid var(--ink)" }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
