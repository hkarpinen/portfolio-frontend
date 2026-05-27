"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateChore } from "@/hooks/use-chores";
import { useHousehold, useHouseholdMembers } from "@/hooks/use-household";
import type { RecurrenceFrequency } from "@/lib/api/chores";
import { Btn, Input, Textarea, SelectField, Icon, SectionHeader } from "@/components/editorial";

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

  const { data: household } = useHousehold(householdId);
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
    <div className="page-enter max-w-[640px] flex flex-col gap-8">
      <Link href={`/household/${householdId}/chores`} className="ed-label-muted no-underline hover:text-red">
        ← {household?.name ? `${household.name} · Chores` : "Chores"}
      </Link>

      <SectionHeader kicker="New chore" title="New <em>chore</em>" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Take out the bins"
          autoFocus
        />

        <Textarea
          label="Description"
          className="min-h-[80px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes…"
        />

        <div className="grid gap-8 grid-cols-2">
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
          <p role="alert" className="text-base text-red font-mono">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Btn
            type="submit"
            variant="primary"
            size="lg"
            disabled={createChore.isPending}
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            {createChore.isPending ? "Saving…" : "Create chore"}
          </Btn>
          <Btn href={`/household/${householdId}/chores`} variant="secondary" size="lg">Cancel</Btn>
        </div>
      </form>
    </div>
  );
}
