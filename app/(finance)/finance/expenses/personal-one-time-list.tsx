"use client";

import { EmptyState } from "@/components/editorial";

import type { Expense } from "@/types/expense";
import { ExpenseTable } from "./expense-table";

/**
 * Backs the "One time this month" section. Renders the same `ExpenseTable` as
 * Personal recurring — the parent does the (non-recurring) filtering so this
 * stays a thin wrapper that only supplies the section's empty state.
 */
export function PersonalOneTimeList({ expenses }: { expenses: Expense[] }) {
  return (
    <ExpenseTable
      expenses={expenses}
      empty={
        <EmptyState
          kicker="// ONE_TIME_EMPTY"
          title="No one-time expenses posted this month"
          body="Non-recurring outlays you post to this month will appear here."
        />
      }
    />
  );
}
