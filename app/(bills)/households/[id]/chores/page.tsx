"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useChores, useCompleteChore, useDeleteChore } from "@/hooks/use-chores";
import { useHouseholdMembers } from "@/hooks/use-household";
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
      style={{
        borderBottom: "1px solid var(--ink-4)",
        padding: "16px 0",
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
      }}
    >
      {/* Complete checkbox */}
      <button
        onClick={() => onComplete(chore.id)}
        disabled={completing || !!chore.completedAt}
        title="Mark complete"
        style={{
          width: 20,
          height: 20,
          border: "2px solid var(--ink)",
          background: chore.completedAt ? "var(--ink)" : "var(--paper)",
          cursor: chore.completedAt ? "default" : "pointer",
          flexShrink: 0,
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {chore.completedAt && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2" stroke="var(--paper)" strokeWidth="1.8" strokeLinecap="square" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--ff-serif)",
            fontSize: "var(--ts-lead)",
            lineHeight: "var(--lh-snug)",
            textDecoration: chore.completedAt ? "line-through" : "none",
            color: chore.completedAt ? "var(--ink-3)" : "var(--ink)",
          }}
        >
          {chore.title}
        </p>
        {chore.description && (
          <p style={{ fontSize: "var(--ts-label)", color: "var(--ink-3)", marginTop: 2 }}>
            {chore.description}
          </p>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: 6,
            fontSize: "var(--ts-meta)",
            color: "var(--ink-3)",
          }}
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
            <span style={{ color: "var(--ink-3)" }}>
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
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--ink-3)",
          fontSize: "var(--ts-label)",
          padding: "2px 6px",
          lineHeight: 1,
        }}
      >
        ✕
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
      className="page-enter"
      style={{ display: "flex", flexDirection: "column", gap: "28px" }}
    >
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
              fontSize: "var(--ts-meta)",
              color: "var(--ink-3)",
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "var(--ff-mono)",
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
            Chores
          </h1>
          {overdue.length > 0 && (
            <p style={{ fontSize: "var(--ts-label)", color: "var(--red)", marginTop: 4 }}>
              {overdue.length} overdue
            </p>
          )}
        </div>
        <Link
          href={`/households/${householdId}/chores/new`}
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
          + New Chore
        </Link>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          border: "1px solid var(--ink)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {[
          { label: "Active", value: active.length },
          { label: "Overdue", value: overdue.length, red: overdue.length > 0 },
          { label: "Completed", value: completed.length },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: "16px",
              borderLeft: i > 0 ? "1px solid var(--ink)" : undefined,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--ff-serif)",
                fontSize: "var(--ts-numeral)",
                lineHeight: 1,
                color: s.red ? "var(--red)" : "var(--ink)",
              }}
            >
              {s.value}
            </p>
            <p
              style={{
                fontFamily: "var(--ff-mono)",
                fontSize: "var(--ts-meta)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink-3)",
                marginTop: 4,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chore list */}
      <div style={{ border: "1px solid var(--ink)", padding: "0 20px", boxShadow: "var(--shadow-card)" }}>
        {choresQuery.isLoading && (
          <p style={{ padding: "32px 0", textAlign: "center", color: "var(--ink-3)", fontFamily: "var(--ff-mono)", fontSize: "var(--ts-label)" }}>
            Loading…
          </p>
        )}
        {!choresQuery.isLoading && chores.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--ff-serif)", fontSize: "var(--ts-sub)", color: "var(--ink-3)" }}>
              No chores yet.
            </p>
            <p style={{ fontSize: "var(--ts-label)", color: "var(--ink-3)", marginTop: 8 }}>
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
            completing={complete.isPending}
            deleting={del.isPending}
          />
        ))}
      </div>

      {/* Toggle active/all */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => setShowAll((v) => !v)}
          style={{
            background: "none",
            border: "1px solid var(--ink)",
            padding: "8px 24px",
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-label)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer",
            color: "var(--ink)",
          }}
        >
          {showAll ? "Show Active Only" : "Show All (incl. Completed)"}
        </button>
      </div>
    </div>
  );
}
