"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useChores, useCompleteChore, useDeleteChore } from "@/hooks/use-chores";
import { useHouseholdMembers } from "@/hooks/use-household";
import { EmptyState } from "@/components/editorial/empty-state";
import { Icon } from "@/components/editorial/icon";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { DepartmentHead } from "@/components/editorial/department-head";
import { choresHeadline } from "@/lib/household/editorial-copy";
import type { ChoreDto } from "@/lib/api/chores";

const FREQ_LABEL: Record<string, string> = {
  Daily: "Daily",
  Weekly: "Weekly",
  BiWeekly: "Bi-weekly",
  Monthly: "Monthly",
};

function formatDue(iso?: string): { text: string; overdue: boolean; srText: string } {
  if (!iso) return { text: "—", overdue: false, srText: "No due date" };
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const days = Math.round((startOf(d).getTime() - startOf(now).getTime()) / 86_400_000);
  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days < 0) return { text: dateStr, overdue: true, srText: `Overdue — was due ${dateStr}` };
  if (days === 0) return { text: "Today", overdue: false, srText: "Due today" };
  if (days === 1) return { text: "Tomorrow", overdue: false, srText: "Due tomorrow" };
  return { text: dateStr, overdue: false, srText: `Due ${dateStr}` };
}

function ChoreRow({
  chore, members, onComplete, onDelete, completing, deleting,
}: {
  chore: ChoreDto;
  members: { userId: string; displayName?: string; username: string }[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  completing: boolean;
  deleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const assignee = members.find((m) => m.userId === chore.assignedToUserId);
  const done = !!chore.completedAt;
  const due = formatDue(chore.dueDate);

  return (
    <tr className={`border-b border-[var(--rule-soft)] group${due.overdue ? "" : ""}`}>
      <td className="py-[14px] pr-4 w-[36px]">
        <button
          onClick={() => onComplete(chore.id)}
          disabled={completing || done}
          aria-label={done ? `${chore.title}: completed` : `Mark "${chore.title}" as complete`}
          aria-pressed={done}
          className={`w-5 h-5 flex items-center justify-center border-[1.5px] border-ink ${done ? "bg-ink text-paper" : "bg-paper text-transparent cursor-pointer"}`}
        >
          {done && <Icon name="check" size={12} strokeWidth={2.5} aria-hidden />}
        </button>
      </td>
      <td className="py-[14px] pr-6">
        <span className={`font-serif italic text-[1.0625rem] ${done ? "line-through text-ink-3" : "text-ink"}`}>
          {chore.title}
          {done && <span className="sr-only"> (completed)</span>}
        </span>
      </td>
      <td className="py-[14px] pr-6 ed-label-muted whitespace-nowrap">
        {assignee ? (assignee.displayName ?? assignee.username) : "Anyone"}
      </td>
      <td className={`py-[14px] pr-6 font-mono text-xs tracking-[0.04em] whitespace-nowrap ${due.overdue ? "text-red font-semibold" : "text-ink-3"}`}>
        {/* Color alone never conveys overdue — the word "Overdue" is in the sr-text */}
        <span aria-label={due.srText}>
          {due.overdue && <span className="sr-only">Overdue: </span>}
          {due.text}
        </span>
        {due.overdue && <span aria-hidden className="ml-[5px] font-mono text-[0.65rem] tracking-[0.06em] text-red">OVERDUE</span>}
      </td>
      <td className="py-[14px] whitespace-nowrap">
        <div className="flex items-center justify-between gap-4">
          <span className="ed-label-muted">
            {chore.recurrenceFrequency ? FREQ_LABEL[chore.recurrenceFrequency] ?? chore.recurrenceFrequency : "One-off"}
          </span>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity font-mono text-xs tracking-[0.08em] text-ink-3 hover:text-red focus:text-red cursor-pointer border-none bg-transparent p-0"
              aria-label={`Delete chore: ${chore.title}`}
            >
              Delete
            </button>
          ) : (
            <span className="flex items-center gap-2">
              <button
                onClick={() => { onDelete(chore.id); setConfirmDelete(false); }}
                disabled={deleting}
                className="font-mono text-xs tracking-[0.08em] text-red cursor-pointer border-none bg-transparent p-0"
                aria-label={`Confirm delete: ${chore.title}`}
              >
                {deleting ? "…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-mono text-xs tracking-[0.08em] text-ink-3 cursor-pointer border-none bg-transparent p-0"
              >
                Cancel
              </button>
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function ChoresPage() {
  const { id: householdId } = useParams<{ id: string }>();
  const [showAll, setShowAll] = useState(true);
  const choresQuery = useChores(householdId, !showAll);
  const membersQuery = useHouseholdMembers(householdId);
  const complete = useCompleteChore(householdId);
  const del = useDeleteChore(householdId);

  const chores = choresQuery.data ?? [];
  const overdueCount = chores.filter((c) => {
    if (c.completedAt || !c.dueDate) return false;
    return new Date(c.dueDate) < new Date();
  }).length;

  const members = (membersQuery.data ?? []).map((m) => ({
    userId: (m as any).userId as string,
    displayName: (m as any).displayName as string | undefined,
    username: (m as any).username as string,
  }));

  return (
    <div className="page-enter flex flex-col gap-6">
      <EditorialPageHead
        kicker="Chores · This household"
        title={choresHeadline({ overdue: overdueCount, total: chores.length })}
        deck="Assigned chores, schedules, and what's overdue. Check the box to mark one done."
      />

      <section className="flex flex-col gap-5">
        <DepartmentHead
          kicker={showAll ? "All chores" : "Active chores"}
          count={`${chores.length} chore${chores.length === 1 ? "" : "s"}${overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}`}
          title="The <em>chore list</em>"
        />
        <div className="flex items-center justify-end -mt-2">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="ed-label-muted hover:text-red bg-transparent border-none cursor-pointer p-0"
            aria-pressed={!showAll}
          >
            {showAll ? "Active only" : "Show all"}
          </button>
        </div>

      {choresQuery.isLoading ? (
        <p className="ed-label-muted" aria-live="polite">Loading chores…</p>
      ) : chores.length === 0 ? (
        <EmptyState
          glyph={<Icon name="check" size={24} strokeWidth={1.5} />}
          title="No chores yet"
          body="Add a chore and assign it to a household member."
          cta={{ label: "+ Add chore", href: `/household/${householdId}/chores/new` }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" aria-label="Household chores">
            <thead>
              <tr className="border-b border-[var(--ink)]">
                <th scope="col" className="pb-[10px] w-[36px]">
                  <span className="sr-only">Complete</span>
                </th>
                <th scope="col" className="text-left ed-kicker pb-[10px] pr-6 font-normal">Chore</th>
                <th scope="col" className="text-left ed-kicker pb-[10px] pr-6 font-normal">Assigned to</th>
                <th scope="col" className="text-left ed-kicker pb-[10px] pr-6 font-normal">Due</th>
                <th scope="col" className="text-left ed-kicker pb-[10px] font-normal">Repeats</th>
              </tr>
            </thead>
            <tbody>
              {chores.map((chore) => (
                <ChoreRow
                  key={chore.id}
                  chore={chore}
                  members={members}
                  onComplete={(id) => complete.mutate(id)}
                  onDelete={(id) => del.mutate(id)}
                  completing={complete.isPending && complete.variables === chore.id}
                  deleting={del.isPending && del.variables === chore.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      </section>
    </div>
  );
}
