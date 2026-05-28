import { formatShortDate } from "@/lib/formatting";
import type { ChoreDto } from "@/lib/api/chores";

/**
 * Pure helpers for the chores page. Date math (overdue / today / tomorrow /
 * dated) and the active-overdue count live here so the page itself is JSX
 * and presentation state.
 */

/**
 * Render a chore due date as a short, human label plus a flag for the
 * "overdue" styling branch. `now` is pluggable so SSR and the hydration
 * step agree on which side of midnight a chore lives.
 */
export function formatChoreDueDate(
  iso: string | null | undefined,
  now: Date = new Date(),
): { text: string; overdue: boolean; srText: string } {
  if (!iso) return { text: "—", overdue: false, srText: "No due date" };
  const due = new Date(iso);
  // Compare at midnight-of-day so "due today" doesn't flip based on
  // wall-clock hour. Same convention as the existing inline call site.
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const days = Math.round((startOf(due).getTime() - startOf(now).getTime()) / 86_400_000);
  const dateStr = formatShortDate(due);
  if (days < 0) return { text: dateStr, overdue: true, srText: `Overdue — was due ${dateStr}` };
  if (days === 0) return { text: "Today", overdue: false, srText: "Due today" };
  if (days === 1) return { text: "Tomorrow", overdue: false, srText: "Due tomorrow" };
  return { text: dateStr, overdue: false, srText: `Due ${dateStr}` };
}

/** Count chores that are open (not completed) and past their due date. */
export function overdueChoreCount(chores: ChoreDto[], now: Date = new Date()): number {
  const cutoff = now.getTime();
  let n = 0;
  for (const c of chores) {
    if (c.completedAt || !c.dueDate) continue;
    if (new Date(c.dueDate).getTime() < cutoff) n++;
  }
  return n;
}
