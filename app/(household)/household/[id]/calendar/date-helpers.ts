/**
 * All-day calendar events carry a date semantic, not a moment. The backend
 * stores them as `YYYY-MM-DDT00:00:00Z` — interpret that with local-time
 * getters and a viewer west of UTC sees the previous day. The helpers below
 * canonicalise "what date is this event on" by pulling UTC components for
 * all-day events and local components for timed events (which really are
 * moments and should follow the viewer's clock).
 *
 * Symptom this prevents: pick Tuesday as the start of a weekly all-day
 * event, the cell on Monday lights up instead. Bill mirrors hit the same
 * trap because finance emits due-dates at midnight UTC.
 */
export function eventCalendarDate(ev: { startsAt: string; allDay: boolean }): Date {
  const d = new Date(ev.startsAt);
  return ev.allDay
    ? new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    : d;
}

const pad = (n: number) => n.toString().padStart(2, "0");

/** Format an ISO timestamp as `YYYY-MM-DD` for HTML `<input type="date">`. */
export function isoToDateInput(iso: string, allDay: boolean): string {
  const d = new Date(iso);
  if (allDay) {
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
