"use client";

import { EmptyState, Icon } from "@/components/editorial";
import { useState } from "react";
import { useDeleteExpense, useExpenses } from "@/hooks/use-expenses";

import type { ExpensePage, Expense } from "@/types/expense";
import { ExpenseRow } from "./expense-row";

export function ExpenseList({ initialData }: { initialData: ExpensePage }) {
  const { data } = useExpenses(initialData);
  // This list backs the "Personal recurring" section — drop one-time entries
  // so they don't double up with the One time this month table below.
  const expenses: Expense[] = (data?.items ?? []).filter((e) => !!e.recurrenceFrequency);
  const deleteExpense = useDeleteExpense();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <EmptyState
        glyph={<Icon name="dollar" size={24} strokeWidth={2} />}
        title="No recurring expenses yet"
        body="Add a phone bill, gym membership, or subscription to start tracking your monthly outgoings."
        cta={{ label: "+ Add expense", href: "/expenses/new" }}
      />
    );
  }

  return (
    <>
      <div aria-live="polite" aria-atomic="false" className="sr-only" role="status">
        {deleteExpense.isPending ? "Removing expense…" : ""}
      </div>
      <div className="ed-modules-grid">
        {expenses.map((expense) => (
          <ExpenseRow
            key={expense.expenseId}
            expense={expense}
            isEditing={editingId === expense.expenseId}
            onEditToggle={() =>
              setEditingId(editingId === expense.expenseId ? null : expense.expenseId)
            }
            onEditDone={() => setEditingId(null)}
            onDelete={() => deleteExpense.mutate(expense.expenseId)}
            isDeleting={deleteExpense.isPending}
          />
        ))}
      </div>
    </>
  );
}
