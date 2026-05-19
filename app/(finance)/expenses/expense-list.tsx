"use client";

import { useState } from "react";
import { useDeleteExpense, useExpenses } from "@/hooks/use-expenses";
import type { ExpensePage } from "@/types/finance";
import type { Expense } from "@/types/finance";
import { ExpenseRow } from "./expense-row";
import { Icon } from "@/components/editorial/icon";

export { CATEGORY_COLORS, CATEGORY_ICONS } from "./expense-row";

export function ExpenseList({ initialData }: { initialData: ExpensePage }) {
  const { data } = useExpenses(initialData);
  const expenses: Expense[] = data?.items ?? [];
  const deleteExpense = useDeleteExpense();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="bg-paper py-24 px-12 text-center flex flex-col items-center gap-5 mb-12 shadow-stamp border-ink">
        <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center">
          <Icon name="dollar" size={24} strokeWidth={2} />
        </div>
        <p className="font-serif font-bold text-md text-ink">No personal expenses yet</p>
        <p className="text-base text-ink-3">Add your recurring expenses below.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mb-12">
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.expenseId}
          expense={expense}
          isEditing={editingId === expense.expenseId}
          onEditToggle={() => setEditingId(editingId === expense.expenseId ? null : expense.expenseId)}
          onEditDone={() => setEditingId(null)}
          onDelete={() => deleteExpense.mutate(expense.expenseId)}
          isDeleting={deleteExpense.isPending}
        />
      ))}
    </div>
  );
}
