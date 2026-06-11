"use client";

import { EmptyDispatch } from "@/components/editorial";

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
        <EmptyDispatch>
          No one-time expenses <em>posted</em> this month
        </EmptyDispatch>
      }
    />
  );
}
