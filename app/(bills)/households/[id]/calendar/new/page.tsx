"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateCalendarEvent } from "@/hooks/use-calendar";

export default function NewCalendarEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: householdId } = params;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCreateCalendarEvent(householdId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("Title is required."); return; }
    if (!startsAt) { setError("Start date is required."); return; }

    const startsAtIso = allDay
      ? new Date(startsAt + "T00:00:00Z").toISOString()
      : new Date(startsAt).toISOString();
    const endsAtIso = endsAt
      ? allDay
        ? new Date(endsAt + "T23:59:59Z").toISOString()
        : new Date(endsAt).toISOString()
      : undefined;

    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: startsAtIso,
        endsAt: endsAtIso,
        allDay,
      });
      router.push(`/households/${householdId}/calendar`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create event.");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--ink)",
    background: "var(--paper)",
    color: "var(--ink)",
    fontFamily: "var(--ff-body)",
    fontSize: "var(--ts-body)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--ff-mono)",
    fontSize: "var(--ts-meta)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--ink-3)",
    marginBottom: 6,
  };

  return (
    <div className="page-enter" style={{ maxWidth: 560 }}>
      <Link
        href={`/households/${householdId}/calendar`}
        style={{
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--ts-meta)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
          textDecoration: "none",
        }}
      >
        ← Calendar
      </Link>

      <h1
        style={{
          fontFamily: "var(--ff-serif)",
          fontSize: "var(--ts-h2)",
          lineHeight: "var(--lh-display)",
          marginTop: 8,
          marginBottom: 28,
          borderBottom: "2px solid var(--ink)",
          paddingBottom: 16,
        }}
      >
        New Event
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. House inspection"
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes…"
          />
        </div>

        {/* All-day toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            id="allday"
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--ink)" }}
          />
          <label
            htmlFor="allday"
            style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-label)",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            All-day event
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>
              {allDay ? "Date *" : "Starts At *"}
            </label>
            <input
              style={inputStyle}
              type={allDay ? "date" : "datetime-local"}
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>
              {allDay ? "End Date" : "Ends At"}
            </label>
            <input
              style={inputStyle}
              type={allDay ? "date" : "datetime-local"}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p
            style={{
              fontSize: "var(--ts-label)",
              color: "var(--red)",
              fontFamily: "var(--ff-mono)",
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
          <button
            type="submit"
            disabled={createEvent.isPending}
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              border: "none",
              padding: "12px 32px",
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-label)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: createEvent.isPending ? "default" : "pointer",
              opacity: createEvent.isPending ? 0.6 : 1,
            }}
          >
            {createEvent.isPending ? "Saving…" : "Create Event"}
          </button>
          <Link
            href={`/households/${householdId}/calendar`}
            style={{
              border: "1px solid var(--ink)",
              padding: "12px 24px",
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-label)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
