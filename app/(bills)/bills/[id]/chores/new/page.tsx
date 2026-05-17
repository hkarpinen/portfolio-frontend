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
      router.push(`/bills/${householdId}/chores`);
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
    <div className="page-enter max-w-[560]" >
      {/* Back */}
      <Link
        href={`/bills/${householdId}/chores`}
        className="font-mono text-sm tracking-[0.08em] uppercase text-ink-3 no-underline"
      >
        ← Chores
      </Link>

      <h1
        className="font-serif text-4xl leading-none mt-4 mb-[28] pb-8" style={{ borderBottom: "2px solid var(--ink)" }}
      >
        New Chore
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
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
            className="min-h-[80]" style={{ ...inputStyle, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes…"
          />
        </div>

        <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
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
              className="cursor-pointer" style={{ ...inputStyle }}
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
          <p className="text-base text-red font-mono">
            {error}
          </p>
        )}

        <div className="flex gap-6 pt-4">
          <button
            type="submit"
            disabled={createChore.isPending}
            className="bg-ink text-paper py-6 px-16 font-mono text-base tracking-[0.05em] uppercase" style={{ border: "none", cursor: createChore.isPending ? "default" : "pointer", opacity: createChore.isPending ? 0.6 : 1 }}
          >
            {createChore.isPending ? "Saving…" : "Create Chore"}
          </button>
          <Link
            href={`/bills/${householdId}/chores`}
            className="py-6 px-12 font-mono text-base tracking-[0.05em] uppercase no-underline text-ink" style={{ border: "1px solid var(--ink)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
