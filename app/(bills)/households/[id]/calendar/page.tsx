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
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          borderBottom: "1px solid var(--ink)",
          borderTop: "1px solid var(--ink)",
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              padding: "8px 0",
              textAlign: "center",
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
              borderRight: "1px solid var(--ink-4)",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          border: "1px solid var(--ink)",
          borderTop: "none",
        }}
      >
        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                style={{
                  minHeight: 80,
                  background: "var(--paper-2)",
                  borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--ink-4)" : undefined,
                  borderBottom: idx < cells.length - 7 ? "1px solid var(--ink-4)" : undefined,
                }}
              />
            );
          }
          const dayEvents = eventsForDay(day);
          const isToday = isSameDay(new Date(year, month, day), today);

          return (
            <div
              key={day}
              style={{
                minHeight: 80,
                padding: "6px",
                borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--ink-4)" : undefined,
                borderBottom: idx < cells.length - 7 ? "1px solid var(--ink-4)" : undefined,
                background: "var(--paper)",
                verticalAlign: "top",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 24,
                  height: 24,
                  lineHeight: "24px",
                  textAlign: "center",
                  fontFamily: "var(--ff-mono)",
                  fontSize: "var(--ts-label)",
                  background: isToday ? "var(--ink)" : "none",
                  color: isToday ? "var(--paper)" : "var(--ink)",
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {day}
              </span>
              {dayEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelected(ev.id === selected ? null : ev.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    marginTop: 3,
                    padding: "2px 4px",
                    background: selected === ev.id ? "var(--ink)" : "var(--red-soft)",
                    color: selected === ev.id ? "var(--paper)" : "var(--ink)",
                    border: "1px solid var(--red)",
                    fontFamily: "var(--ff-body)",
                    fontSize: "var(--ts-meta)",
                    cursor: "pointer",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
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
          style={{
            marginTop: 16,
            border: "1px solid var(--ink)",
            padding: "16px 20px",
            boxShadow: "var(--shadow-card)",
            background: "var(--paper)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <p
                style={{
                  fontFamily: "var(--ff-serif)",
                  fontSize: "var(--ts-sub)",
                  lineHeight: "var(--lh-snug)",
                }}
              >
                {selectedEvent.title}
              </p>
              {selectedEvent.description && (
                <p style={{ fontSize: "var(--ts-label)", color: "var(--ink-3)", marginTop: 4 }}>
                  {selectedEvent.description}
                </p>
              )}
              <p
                style={{
                  fontFamily: "var(--ff-mono)",
                  fontSize: "var(--ts-meta)",
                  color: "var(--ink-3)",
                  marginTop: 8,
                  letterSpacing: "0.05em",
                }}
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
              style={{
                background: "none",
                border: "1px solid var(--ink)",
                padding: "6px 14px",
                fontFamily: "var(--ff-mono)",
                fontSize: "var(--ts-meta)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                color: "var(--ink)",
              }}
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
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "2px solid var(--ink)",
          paddingBottom: "16px",
        }}
      >
        <div>
          <Link
            href={`/households/${householdId}`}
            style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
              textDecoration: "none",
            }}
          >
            ← Household
          </Link>
          <h1
            style={{
              fontFamily: "var(--ff-serif)",
              fontSize: "var(--ts-h2)",
              lineHeight: "var(--lh-display)",
              marginTop: "4px",
            }}
          >
            Calendar
          </h1>
        </div>
        <Link
          href={`/households/${householdId}/calendar/new`}
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "10px 20px",
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-label)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          + New Event
        </Link>
      </div>

      {/* Month navigator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: "none",
            border: "1px solid var(--ink)",
            width: 36,
            height: 36,
            cursor: "pointer",
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-body)",
            color: "var(--ink)",
          }}
        >
          ‹
        </button>
        <h2
          style={{
            fontFamily: "var(--ff-serif)",
            fontSize: "var(--ts-card-h)",
            letterSpacing: "-0.01em",
          }}
        >
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          style={{
            background: "none",
            border: "1px solid var(--ink)",
            width: 36,
            height: 36,
            cursor: "pointer",
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-body)",
            color: "var(--ink)",
          }}
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      {eventsQuery.isLoading ? (
        <p
          style={{
            textAlign: "center",
            padding: "48px 0",
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-label)",
            color: "var(--ink-3)",
          }}
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
        <div style={{ borderTop: "1px solid var(--ink-4)", paddingTop: 16 }}>
          <p
            style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
              marginBottom: 12,
            }}
          >
            {events.length} event{events.length !== 1 ? "s" : ""} this month
          </p>
          {events
            .slice()
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
            .map((ev) => (
              <div
                key={ev.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--ink-4)",
                  padding: "10px 0",
                  gap: 12,
                }}
              >
                <div>
                  <p style={{ fontFamily: "var(--ff-serif)", fontSize: "var(--ts-body)" }}>
                    {ev.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--ff-mono)",
                      fontSize: "var(--ts-meta)",
                      color: "var(--ink-3)",
                      marginTop: 2,
                    }}
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
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-3)",
                    fontFamily: "var(--ff-mono)",
                    fontSize: "var(--ts-meta)",
                  }}
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
