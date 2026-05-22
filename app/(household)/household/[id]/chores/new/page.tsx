"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateChore } from "@/hooks/use-chores";
import { useHouseholdMembers } from "@/hooks/use-household";
import type { RecurrenceFrequency } from "@/lib/api/chores";
import { Btn, Input, Textarea, SelectField } from "@/components/editorial";

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
      router.push(`/household/${householdId}/chores`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create chore.");
    }
  }

  return (
    <div className="page-enter max-w-[560]" >
      {/* Back */}
      <Link
        href={`/household/${householdId}/chores`}
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
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Take out the bins"
          autoFocus
        />

        <Textarea
          label="Description"
          className="min-h-[80]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes…"
        />

        <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <SelectField
            label="Repeats"
            className="cursor-pointer"
            value={freq}
            onChange={(e) => setFreq(e.target.value as RecurrenceFrequency | "")}
          >
            {FREQ_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
        </div>

        {error && (
          <p className="text-base text-red font-mono">
            {error}
          </p>
        )}

        <div className="flex gap-6 pt-4">
          <Btn
            type="submit"
            variant="primary"
            disabled={createChore.isPending}
          >
            {createChore.isPending ? "Saving…" : "Create Chore"}
          </Btn>
          <Link
            href={`/household/${householdId}/chores`}
            className="py-6 px-12 font-mono text-base tracking-[0.05em] uppercase no-underline text-ink" style={{ border: "1px solid var(--ink)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
