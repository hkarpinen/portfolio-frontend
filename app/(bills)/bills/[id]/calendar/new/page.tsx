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
      router.push(`/bills/${householdId}/calendar`);
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
    <div className="page-enter max-w-[560]" >
      <Link
        href={`/bills/${householdId}/calendar`}
        className="font-mono text-sm tracking-[0.08em] uppercase text-ink-3 no-underline"
      >
        ← Calendar
      </Link>

      <h1
        className="font-serif text-4xl leading-none mt-4 mb-[28] pb-8" style={{ borderBottom: "2px solid var(--ink)" }}
      >
        New Event
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
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
            className="min-h-[80]" style={{ ...inputStyle, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes…"
          />
        </div>

        {/* All-day toggle */}
        <div className="flex items-center gap-5">
          <input
            id="allday"
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="w-[16] h-[16] cursor-pointer" style={{ accentColor: "var(--ink)" }}
          />
          <label
            htmlFor="allday"
            className="font-mono text-base tracking-[0.05em] cursor-pointer"
          >
            All-day event
          </label>
        </div>

        <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
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
            className="text-base text-red font-mono"
          >
            {error}
          </p>
        )}

        <div className="flex gap-6 pt-4">
          <button
            type="submit"
            disabled={createEvent.isPending}
            className="bg-ink text-paper py-6 px-16 font-mono text-base tracking-[0.05em] uppercase" style={{ border: "none", cursor: createEvent.isPending ? "default" : "pointer", opacity: createEvent.isPending ? 0.6 : 1 }}
          >
            {createEvent.isPending ? "Saving…" : "Create Event"}
          </button>
          <Link
            href={`/bills/${householdId}/calendar`}
            className="py-6 px-12 font-mono text-base tracking-[0.05em] uppercase no-underline text-ink" style={{ border: "1px solid var(--ink)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
