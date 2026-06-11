"use client";

import { Btn, Icon } from "@/components/editorial";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import type { CalendarEventDto } from "@/lib/api/calendar";
import { MONTH_NAMES, pluralize } from "@/lib/utils";
import { eventCalendarDate } from "./date-helpers";

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

// Visual style branched on event kind. Bill entries get a calm green tint
// so they don't compete with the red "today" marker; member events get a
// neutral ink tint. Selected state is filled-ink for both kinds.
function eventChipClass(kind: CalendarEventDto["kind"], selected: boolean): string {
  if (selected) return "bg-ink text-paper border-ink";
  if (kind === "FinanceBill") return "bg-green-soft text-ink border-green";
  return "bg-paper-3 text-ink border-ink-4";
}

export function CalendarGrid({ year, month, events, onDelete, deleting }: CalendarGridProps) {
  const { id: householdId } = useParams<{ id: string }>();
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
    return events.filter((e) => isSameDay(eventCalendarDate(e), d));
  }

  const selectedEvent = selected ? events.find((e) => e.id === selected) : null;

  return (
    <div>
      <div role="grid" aria-label={`${MONTH_NAMES[month]} ${year} calendar`}>
        {/* Day-of-week header row */}
        <div role="row" className="grid grid-cols-7 border-b border-t border-[var(--ink)]">
          {DAYS.map((d) => (
            <div
              key={d}
              role="columnheader"
              aria-label={d}
              className="border-r border-[var(--ink-4)] py-2 text-center font-mono text-sm uppercase tracking-[0.08em] text-ink-3 last:border-r-0"
            >
              <span aria-hidden>{d}</span>
            </div>
          ))}
        </div>

        {/* Day cells. The previous version concatenated layout classes into
         * a single template literal without separators, collapsing
         * `bg-paper-2border-r` into one invalid Tailwind utility — Tailwind
         * silently dropped both, which made cells lose their borders and
         * events lose their chip styling. The clsx-style join below keeps
         * each utility intact. */}
        <div className="grid grid-cols-7 border border-t-0 border-[var(--ink)]">
          {cells.map((day, idx) => {
            const isLastColumn = (idx + 1) % 7 === 0;
            const isLastRow = idx >= cells.length - 7;
            const cellBorder = [
              !isLastColumn && "border-r border-[var(--ink-4)]",
              !isLastRow && "border-b border-[var(--ink-4)]",
            ]
              .filter(Boolean)
              .join(" ");

            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  role="gridcell"
                  aria-label="No date"
                  className={`min-h-32 bg-paper-2 ${cellBorder}`}
                />
              );
            }

            const dayEvents = eventsForDay(day);
            const cellDate = new Date(year, month, day);
            const isToday = isSameDay(cellDate, today);
            const dateLabel = `${MONTH_NAMES[month]} ${day}${isToday ? ", today" : ""}${dayEvents.length > 0 ? `, ${dayEvents.length} ${pluralize("event", dayEvents.length)}` : ""}`;

            return (
              <div
                key={day}
                role="gridcell"
                aria-label={dateLabel}
                className={`flex min-h-32 flex-col gap-1 bg-paper p-2 align-top ${cellBorder}`}
              >
                <span
                  aria-hidden
                  className={
                    isToday
                      ? "inline-flex h-7 w-7 items-center justify-center self-start bg-red font-mono text-sm font-bold leading-none text-paper"
                      : "inline-flex h-7 w-7 items-center justify-center self-start font-mono text-sm font-normal leading-none text-ink"
                  }
                >
                  {day}
                </span>

                {dayEvents.slice(0, 3).map((ev) => {
                  const isSelected = selected === ev.id;
                  const chip = eventChipClass(ev.kind, isSelected);
                  const label =
                    ev.kind === "FinanceBill"
                      ? `${ev.title}, bill — opens expense detail`
                      : `${ev.title}${ev.allDay ? ", all day" : ""} — click to ${isSelected ? "close" : "view"} details`;
                  const inner = (
                    <span className="flex items-center gap-1">
                      {ev.kind === "FinanceBill" && (
                        <span aria-hidden className="font-bold leading-none">$</span>
                      )}
                      <span aria-hidden className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {ev.title}
                      </span>
                    </span>
                  );

                  // Bills link to the expense detail; member events open the
                  // in-page detail panel.
                  return ev.kind === "FinanceBill" && ev.linkedExpenseId ? (
                    <Link
                      key={ev.id}
                      href={`/household/${householdId}/expenses/${ev.linkedExpenseId}`}
                      aria-label={label}
                      className={`block w-full overflow-hidden border px-2 py-1 text-left font-mono text-xs tracking-[0.04em] no-underline ${chip}`}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      key={ev.id}
                      onClick={() => setSelected(isSelected ? null : ev.id)}
                      aria-expanded={isSelected}
                      aria-label={label}
                      className={`block w-full cursor-pointer overflow-hidden border px-2 py-1 text-left font-mono text-xs tracking-[0.04em] ${chip}`}
                    >
                      {inner}
                    </button>
                  );
                })}

                {dayEvents.length > 3 && (
                  <p className="mt-0.5 pl-2 font-mono text-[0.66rem] tracking-[0.04em] text-ink-3">
                    +{dayEvents.length - 3} more
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected-event detail panel — only used for member events. Bills
       * navigate away to the expense detail page instead of opening here. */}
      <div aria-live="polite" aria-atomic="true">
        {selectedEvent && selectedEvent.kind === "Member" && (
          <div
            className="mt-8 border border-[var(--ink)] bg-paper px-10 py-8 shadow-card"
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
                      <Icon
                        name="arrowRight"
                        size={13}
                        strokeWidth={2}
                        className="mx-1 inline-block align-middle"
                      />
                      {new Date(selectedEvent.endsAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Btn
                  href={`/household/${householdId}/calendar/${selectedEvent.id}/edit`}
                  variant="primary"
                  size="sm"
                  aria-label={`Edit event: ${selectedEvent.title}`}
                >
                  Edit
                </Btn>
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
                  <Icon name="x" size={12} strokeWidth={2.5} aria-hidden />
                  <span className="ml-1">Delete</span>
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
