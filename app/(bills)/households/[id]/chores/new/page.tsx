"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateChore } from "@/hooks/use-chores";
import { useHouseholdMembers } from "@/hooks/use-household";
import type { RecurrenceFrequency } from "@/lib/api/chores";

const FREQ_OPTIONS: { value: RecurrenceFrequency | ""; label: string }[] = [
  { value: "", label: "None (one-off)" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "BiWeekly", label: "Bi-weekly" },
  { value: "Monthly", label: "Monthly" },
];

export default function NewChorePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: householdId } = params;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [freq, setFreq] = useState<RecurrenceFrequency | "">("");
  const [error, setError] = useState<string | null>(null);

  const createChore = useCreateChore(householdId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    try {
      await createChore.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate + "T00:00:00Z").toISOString() : undefined,
        recurrenceFrequency: freq || undefined,
      });
      router.push(`/households/${householdId}/chores`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create chore.");
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
      {/* Back */}
      <Link
        href={`/households/${householdId}/chores`}
        style={{
          fontFamily: "var(--ff-mono)",
          fontSize: "var(--ts-meta)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
          textDecoration: "none",
        }}
      >
        ← Chores
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
        New Chore
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Take out the bins"
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input
              style={inputStyle}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Repeats</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={freq}
              onChange={(e) => setFreq(e.target.value as RecurrenceFrequency | "")}
            >
              {FREQ_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: "var(--ts-label)", color: "var(--red)", fontFamily: "var(--ff-mono)" }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
          <button
            type="submit"
            disabled={createChore.isPending}
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              border: "none",
              padding: "12px 32px",
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-label)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: createChore.isPending ? "default" : "pointer",
              opacity: createChore.isPending ? 0.6 : 1,
            }}
          >
            {createChore.isPending ? "Saving…" : "Create Chore"}
          </button>
          <Link
            href={`/households/${householdId}/chores`}
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
