"use client";

import { EmptyState } from "@/components/editorial";
import { useExpenses } from "@/hooks/use-expenses";

import type { ExpensePage, Expense } from "@/types/expense";
import { ExpenseTable } from "./expense-table";

export function ExpenseList({ initialData }: { initialData: ExpensePage }) {
  const { data } = useExpenses(initialData);
  // This list backs the "Personal recurring" section — drop one-time entries
  // so they don't double up with the One time this month table below.
  const expenses: Expense[] = (data?.items ?? []).filter((e) => !!e.recurrenceFrequency);

  return (
    <ExpenseTable
      expenses={expenses}
      empty={
        // Consistent with the Shared and One-time sections (the masthead
        // carries the "Add expense" action).
        <EmptyState
          kicker="// RECURRING_EMPTY"
          title="No recurring personal bills yet"
          body="Bills you owe on a schedule will show up here once you add one."
        />
      }
    />
  );
}
