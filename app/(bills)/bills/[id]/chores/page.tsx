"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useChores, useCompleteChore, useDeleteChore } from "@/hooks/use-chores";
import { useHouseholdMembers } from "@/hooks/use-household";
import { Icon } from "@/components/editorial/icon";
import type { ChoreDto } from "@/lib/api/chores";

const FREQ_LABEL: Record<string, string> = {
  Daily: "Daily",
  Weekly: "Weekly",
  BiWeekly: "Bi-weekly",
  Monthly: "Monthly",
};

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ChoreRow({
  chore,
  members,
  onComplete,
  onDelete,
  completing,
  deleting,
}: {
  chore: ChoreDto;
  members: { userId: string; displayName?: string; username: string }[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  completing: boolean;
  deleting: boolean;
}) {
  const assignee = members.find((m) => m.userId === chore.assignedToUserId);
  const isOverdue =
    chore.dueDate && !chore.completedAt && new Date(chore.dueDate) < new Date();

  return (
    <div
      className="p-[16px_0] flex items-start gap-[14px]" style={{ borderBottom: "1px solid var(--ink-4)" }}
    >
      {/* Complete checkbox */}
      <button
        onClick={() => onComplete(chore.id)}
        disabled={completing || !!chore.completedAt}
        title="Mark complete"
        className="w-[20] h-[20] shrink-0 mt-1 flex items-center justify-center" style={{ border: "2px solid var(--ink)", background: chore.completedAt ? "var(--ink)" : "var(--paper)", cursor: chore.completedAt ? "default" : "pointer" }}
      >
        {chore.completedAt && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2" stroke="var(--paper)" strokeWidth="1.8" strokeLinecap="square" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="font-serif text-lg leading-[1.15]" style={{ textDecoration: chore.completedAt ? "line-through" : "none", color: chore.completedAt ? "var(--ink-3)" : "var(--ink)" }}
        >
          {chore.title}
        </p>
        {chore.description && (
          <p className="text-base text-ink-3 mt-1">
            {chore.description}
          </p>
        )}
        <div
          className="flex flex-wrap gap-5 mt-3 text-sm text-ink-3"
        >
          {chore.dueDate && (
            <span style={{ color: isOverdue ? "var(--red)" : "var(--ink-3)" }}>
              {isOverdue ? "Overdue · " : "Due "}
              {formatDate(chore.dueDate)}
            </span>
          )}
          {chore.recurrenceFrequency && (
            <span>↻ {FREQ_LABEL[chore.recurrenceFrequency]}</span>
          )}
          {assignee && (
            <span>
              → {assignee.displayName ?? assignee.username}
            </span>
          )}
          {chore.completedAt && (
            <span className="text-ink-3">
              Completed {formatDate(chore.completedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(chore.id)}
        disabled={deleting}
        title="Delete chore"
        aria-label="Delete chore"
        className="bg-transparent cursor-pointer text-ink-3 text-base py-1 px-3 leading-none" style={{ border: "none" }}
      >
        <Icon name="x" size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default function ChoresPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: householdId } = params;

  const [showAll, setShowAll] = useState(false);
  const choresQuery = useChores(householdId, !showAll);
  const membersQuery = useHouseholdMembers(householdId);
  const complete = useCompleteChore(householdId);
  const del = useDeleteChore(householdId);

  const chores = choresQuery.data ?? [];
  const members = (membersQuery.data ?? []).map((m) => ({
    userId: (m as any).userId as string,
    displayName: (m as any).displayName as string | undefined,
    username: (m as any).username as string,
  }));

  const active = chores.filter((c) => c.isActive);
  const completed = chores.filter((c) => !c.isActive);
  const overdue = active.filter(
    (c) => c.dueDate && new Date(c.dueDate) < new Date()
  );

  return (
    <div
      className="page-enter flex flex-col gap-[28px]"
      
    >
      {/* Header */}
      <div
        className="flex items-start justify-between flex-wrap gap-6 pb-8" style={{ borderBottom: "2px solid var(--ink)" }}
      >
        <div>
          <Link
            href={`/bills/${householdId}`}
            className="text-sm text-ink-3 no-underline uppercase tracking-[0.08em] font-mono"
          >
            ← Household
          </Link>
          <h1
            className="font-serif text-4xl leading-none mt-2"
          >
            Chores
          </h1>
          {overdue.length > 0 && (
            <p className="text-base text-red mt-2">
              {overdue.length} overdue
            </p>
          )}
        </div>
        <Link
          href={`/bills/${householdId}/chores/new`}
          className="bg-ink text-paper py-5 px-10 font-mono text-base tracking-[0.05em] uppercase no-underline inline-block"
        >
          + New Chore
        </Link>
      </div>

      {/* Stats row */}
      <div
        className="grid shadow-card" style={{ gridTemplateColumns: "repeat(3, 1fr)", border: "1px solid var(--ink)" }}
      >
        {[
          { label: "Active", value: active.length },
          { label: "Overdue", value: overdue.length, red: overdue.length > 0 },
          { label: "Completed", value: completed.length },
        ].map((s, i) => (
          <div
            key={s.label}
            className="p-8 text-center" style={{ borderLeft: i > 0 ? "1px solid var(--ink)" : undefined }}
          >
            <p
              className="font-serif text-5xl leading-none" style={{ color: s.red ? "var(--red)" : "var(--ink)" }}
            >
              {s.value}
            </p>
            <p
              className="font-mono text-sm tracking-[0.08em] uppercase text-ink-3 mt-2"
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chore list */}
      <div className="p-[0_20px] shadow-card" style={{ border: "1px solid var(--ink)" }}>
        {choresQuery.isLoading && (
          <p className="p-[32px_0] text-center text-ink-3 font-mono text-base">
            Loading…
          </p>
        )}
        {!choresQuery.isLoading && chores.length === 0 && (
          <div className="p-[48px_0] text-center">
            <p className="font-serif text-xl text-ink-3">
              No chores yet.
            </p>
            <p className="text-base text-ink-3 mt-4">
              Add one to get started.
            </p>
          </div>
        )}
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
      </div>

      {/* Toggle active/all */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAll((v) => !v)}
          className="bg-transparent py-4 px-12 font-mono text-base tracking-[0.05em] uppercase cursor-pointer text-ink" style={{ border: "1px solid var(--ink)" }}
        >
          {showAll ? "Show Active Only" : "Show All (incl. Completed)"}
        </button>
      </div>
    </div>
  );
}
