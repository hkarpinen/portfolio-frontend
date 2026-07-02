"use client";

import { Btn, ConfirmDeleteDialog, EmptyState, Icon, SectionHeader } from "@/components/editorial";
import { HouseholdTabs } from "../household-tabs";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useChores, useCompleteChore, useDeleteChore } from "@/hooks/use-chores";
import { useHouseholdMembers } from "@/hooks/use-household";

import { choresHeadline } from "@/lib/household/editorial-copy";
import type { ChoreDto } from "@/lib/api/chores";
import { formatChoreDueDate, overdueChoreCount } from "./chores-derivations";

function ChoreRow({
  chore,
  members,
  onComplete,
  onDeleteClick,
  completing,
  deleting,
}: {
  chore: ChoreDto;
  members: { userId: string; displayName?: string; username: string }[];
  onComplete: (id: string) => void;
  onDeleteClick: (id: string) => void;
  completing: boolean;
  deleting: boolean;
}) {
  const assignee = members.find((m) => m.userId === chore.assignedToUserId);
  const done = !!chore.completedAt;
  const due = formatChoreDueDate(chore.dueDate);

  // Terminus .badge mapping: Done -> green, Overdue -> red, Due today -> amber,
  // otherwise Pending -> default (no modifier).
  const status: { label: string; cls: string } = done
    ? { label: "Done", cls: "green" }
    : due.overdue
      ? { label: "Overdue", cls: "red" }
      : due.text === "Today"
        ? { label: "Due today", cls: "amber" }
        : { label: "Pending", cls: "" };

  return (
    <tr className="group">
      <td>
        <span className={`row-title ${done ? "line-through opacity-60" : ""}`}>
          {chore.title}
          {done && <span className="sr-only"> (completed)</span>}
        </span>
        <p className="ed-hint mt-0.5 sm:hidden">
          {assignee ? (assignee.displayName ?? assignee.username) : "Anyone"} ·{" "}
          <span aria-label={due.srText}>{due.text}</span>
        </p>
      </td>
      <td className="muted hidden sm:table-cell">
        {assignee ? (assignee.displayName ?? assignee.username) : "Anyone"}
      </td>
      <td className="muted hidden sm:table-cell">
        <span aria-label={due.srText}>{due.text}</span>
      </td>
      <td>
        <span className={`badge ${status.cls}`.trim()}>{status.label}</span>
      </td>
      <td className="right">
        <div className="flex items-center justify-end gap-2">
          {/* ${I.check} — mark complete */}
          <button
            onClick={() => onComplete(chore.id)}
            disabled={completing || done}
            aria-label={done ? `${chore.title}: completed` : `Mark "${chore.title}" as complete`}
            aria-pressed={done}
            className={`flex h-7 w-7 items-center justify-center border border-border ${done ? "bg-accent text-paper" : "cursor-pointer bg-transparent text-ink-3 hover:text-accent"}`}
            title="Mark complete"
          >
            <Icon name="check" size={13} strokeWidth={2.5} aria-hidden />
          </button>
          <button
            onClick={() => onDeleteClick(chore.id)}
            disabled={deleting}
            className="ed-icon-btn opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
            aria-label={`Delete chore: ${chore.title}`}
            title="Delete"
          >
            <Icon name="trash" size={14} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ChoresPage() {
  const { id: householdId } = useParams<{ id: string }>();
  const [showAll, setShowAll] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const choresQuery = useChores(householdId, !showAll);
  const membersQuery = useHouseholdMembers(householdId);
  const complete = useCompleteChore(householdId);
  const del = useDeleteChore(householdId);

  const chores = choresQuery.data ?? [];
  const overdueCount = overdueChoreCount(chores);

  // Terminus .stats figures, derived from the real chore list.
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const activeCount = chores.filter((c) => !c.completedAt).length;
  const doneTodayCount = chores.filter(
    (c) => c.completedAt && new Date(c.completedAt).getTime() >= todayStart,
  ).length;
  const unassignedCount = chores.filter((c) => !c.completedAt && !c.assignedToUserId).length;

  const members = (membersQuery.data ?? []).map((m) => ({
    userId: (m as any).userId as string,
    displayName: (m as any).displayName as string | undefined,
    username: (m as any).username as string,
  }));

  const targetChore = chores.find((c) => c.id === deleteTarget);

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    del.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="page-enter">
      <SectionHeader
        kicker="// CHORES"
        title={choresHeadline({ overdue: overdueCount, total: chores.length })}
        subtitle="Assigned chores, schedules, and what's overdue. Check the box to mark one done."
      />

      <HouseholdTabs />

      {/* .stats — Active / Done today / Overdue / Unassigned, from real chore data */}
      <div className="stats" style={{ marginTop: 22 }}>
        <div className="stat">
          <div className="label">Active</div>
          <div className="val amber">{activeCount}</div>
          <div className="delta">this week</div>
        </div>
        <div className="stat">
          <div className="label">Done today</div>
          <div className="val green">{doneTodayCount}</div>
        </div>
        <div className="stat">
          <div className="label">Overdue</div>
          <div className="val red">{overdueCount}</div>
        </div>
        <div className="stat">
          <div className="label">Unassigned</div>
          <div className="val">{unassignedCount}</div>
        </div>
      </div>

      {/* .section-h — // CHORES + show-all toggle + Add */}
      <div className="section-h">
        <h2>{showAll ? "// ALL_CHORES" : "// ACTIVE_CHORES"}</h2>
        <div className="actions">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="ed-label-muted cursor-pointer border-none bg-transparent p-0 hover:text-red"
            aria-pressed={!showAll}
          >
            {showAll ? "Active only" : "Show all"}
          </button>
          <Btn
            href={`/household/${householdId}/chores/new`}
            variant="primary"
            size="sm"
            iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}
          >
            Add
          </Btn>
        </div>
      </div>

      <section className="flex flex-col gap-5">
        {choresQuery.isLoading ? (
          <p className="ed-label-muted" aria-live="polite">
            Loading chores…
          </p>
        ) : chores.length === 0 ? (
          <EmptyState
            glyph={<Icon name="check" size={24} strokeWidth={1.5} />}
            title="No chores yet"
            body="Add a chore and assign it to a household member."
            cta={{ label: "+ Add chore", href: `/household/${householdId}/chores/new` }}
          />
        ) : (
          <div className="table-wrap">
            <table className="table" aria-label="Household chores">
              <thead>
                <tr>
                  <th scope="col">Chore</th>
                  <th scope="col" className="hidden sm:table-cell">
                    Assigned
                  </th>
                  <th scope="col" className="hidden sm:table-cell">
                    Due
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col" className="right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {chores.map((chore) => (
                  <ChoreRow
                    key={chore.id}
                    chore={chore}
                    members={members}
                    onComplete={(id) => complete.mutate(id)}
                    onDeleteClick={(id) => setDeleteTarget(id)}
                    completing={complete.isPending && complete.variables === chore.id}
                    deleting={del.isPending && del.variables === chore.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteTarget(null);
        }}
        title={`Delete "${targetChore?.title ?? "chore"}"?`}
        body="This chore will be permanently removed."
        isPending={del.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
