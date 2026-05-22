"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { useHouseholdExpenseDetail } from "@/hooks/use-expenses";
import { useMe } from "@/hooks/use-identity";
import { useHouseholdMembers } from "@/hooks/use-household";
import { ExpenseEditForm } from "./expense-edit-form";
import { ExpenseSplits } from "./expense-splits";
import { Alert } from "@/components/editorial";

export default function ExpensePage() {
  const { id, expenseId } = useParams<{ id: string; expenseId: string }>();
  const { data: page, isLoading, error: fetchError } = useHouseholdExpenseDetail(id, expenseId);
  const { data: me } = useMe();
  const [editOpen, setEditOpen] = useState(false);
  const { data: householdMembers } = useHouseholdMembers(id);

  const expense = page?.expense;
  const splits = page?.splits ?? [];
  const members = householdMembers ?? [];
  const currentMembership = members.find(
    (m) => me?.id && m.userId?.toLowerCase() === me.id.toLowerCase()
  ) ?? null;
  const isPrivileged = currentMembership?.role === "Owner" || currentMembership?.role === "Admin";

  if (isLoading) return (
    <div className="flex justify-center items-center h-[200px]">
      <div className="w-16 h-16" style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  if (fetchError) return (
    <Alert variant="danger">
      {fetchError instanceof ApiError ? fetchError.message : "Failed to load expense."}
    </Alert>
  );

  if (!expense) return null;

  return (
    <div className="page-enter max-w-[720px] flex flex-col gap-12">
      {/* Header */}
      <div>
        <Link href={`/bills/${id}`} className="text-base text-ink-3 no-underline inline-flex items-center gap-2">
          ← Household
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink mb-2">{expense.title}</h1>
            <p className="text-base text-ink-3">
              Due {new Date(expense.dueDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              {expense.recurrenceFrequency && ` · ${expense.recurrenceFrequency}`}
              {expense.category != null && ` · ${String(expense.category)}`}
            </p>
            {expense.description && <p className="text-base text-ink-2 mt-3 leading-[1.6]">{expense.description}</p>}
          </div>
          {isPrivileged && (
            <button
              onClick={() => setEditOpen((v) => !v)}
              className="py-[6px] px-[14px] shrink-0 text-base font-semibold text-ink-2 cursor-pointer mt-2 border-ink"
              style={{ background: editOpen ? "var(--paper-3)" : "var(--paper-2)" }}
            >
              {editOpen ? "Cancel" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {editOpen && isPrivileged && (
        <ExpenseEditForm
          expense={expense}
          householdId={id}
          expenseId={expenseId}
          onClose={() => setEditOpen(false)}
        />
      )}

      <ExpenseSplits
        expense={expense}
        splits={splits}
        members={members}
        isPrivileged={isPrivileged}
        currentMembership={currentMembership}
        householdId={id}
        expenseId={expenseId}
      />
    </div>
  );
}
