"use client";

import { Btn, Icon, Input, SectionHeader, SelectField, Textarea } from "@/components/editorial";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateChore } from "@/hooks/use-chores";
import { useHousehold } from "@/hooks/use-household";
import { getErrorMessage } from "@/lib/error-messages";

import { parseUnion } from "@/lib/parse-enum";

const FREQ_VALUES = ["", "Daily", "Weekly", "BiWeekly", "Monthly"] as const;
type FreqValue = (typeof FREQ_VALUES)[number]; // RecurrenceFrequency | ""

const FREQ_OPTIONS: { value: FreqValue; label: string }[] = [
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
  const [freq, setFreq] = useState<FreqValue>("");

  const { data: household } = useHousehold(householdId);
  const createChore = useCreateChore(householdId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return; // submit is disabled below; defensive guard
    createChore.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate + "T00:00:00Z").toISOString() : undefined,
        recurrenceFrequency: freq || undefined,
      },
      { onSuccess: () => router.push(`/household/${householdId}/chores`) },
    );
  }

  return (
    <div className="page-enter flex max-w-[640px] flex-col gap-8">
      <Link
        href={`/household/${householdId}/chores`}
        className="ed-label-muted no-underline hover:text-red"
      >
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

        <div className="grid grid-cols-2 gap-8">
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
            onChange={(e) => setFreq(parseUnion(FREQ_VALUES, e.target.value, ""))}
          >
            {FREQ_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
        </div>

        {createChore.isError && (
          <p role="alert" className="font-mono text-base text-red">
            {getErrorMessage(createChore.error, "Failed to create chore.")}
          </p>
        )}

        <div className="flex gap-3">
          <Btn
            type="submit"
            variant="primary"
            size="lg"
            disabled={createChore.isPending || !title.trim()}
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            {createChore.isPending ? "Saving…" : "Create chore"}
          </Btn>
          <Btn href={`/household/${householdId}/chores`} variant="secondary" size="lg">
            Cancel
          </Btn>
        </div>
      </form>
    </div>
  );
}
