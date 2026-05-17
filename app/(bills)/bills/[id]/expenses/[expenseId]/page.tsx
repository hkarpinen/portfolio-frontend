"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/lib/api-client";
import { useHouseholdExpenseDetail, useAddExpenseSplit, useRemoveExpenseSplit, useUpdateHouseholdExpense } from "@/hooks/use-expenses";
import { useMe } from "@/hooks/use-identity";
import { useHouseholdMembers } from "@/hooks/use-household";
import { Btn } from "@/components/editorial";
import type { HouseholdExpenseDetailResponse } from "@/types/finance";

const splitSchema = z.object({
  membershipId: z.string().optional(),
  amount: z.string().min(1).refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
});

type FormData = z.infer<typeof splitSchema>;

const editBillSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().min(1).refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
  currency: z.string().min(1),
  category: z.string().min(1),
  dueDate: z.string().min(1),
  recurrenceFrequency: z.string().optional(),
  description: z.string().optional(),
});

type EditBillData = z.infer<typeof editBillSchema>;

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: color ? `oklch(from ${color} l c h / 0.06)` : "var(--paper-2)",
      border: `1px solid ${color ? `oklch(from ${color} l c h / 0.3)` : "var(--ink-3)"}`,
      padding: "16px 20px",
    } as React.CSSProperties}>
      <p className="text-sm text-ink-3 uppercase tracking-[0.06em] font-medium">{label}</p>
      <p className="font-serif font-extrabold text-2xl tracking-[-0.025em] mt-2" style={{ color: color ?? "var(--text)" }}>{value}</p>
    </div>
  );
}

export default function ExpensePage({ params }: { params: { id: string; expenseId: string } }) {
  const { data: page, isLoading, error: fetchError } = useHouseholdExpenseDetail(params.id, params.expenseId);
  const { data: me } = useMe();
  const [editOpen, setEditOpen] = useState(false);

  const { data: householdMembers } = useHouseholdMembers(params.id);

  const expense = page?.expense;
  const splits = page?.splits ?? [];
  const members = householdMembers ?? [];
  const currentMembership = members.find(
    (m) => me?.id && m.userId?.toLowerCase() === me.id.toLowerCase()
  ) ?? null;
  const isPrivileged = currentMembership?.role === "Owner" || currentMembership?.role === "Admin";

  const addExpenseSplitMutation = useAddExpenseSplit(params.id, params.expenseId);
  const removeSplitMutation = useRemoveExpenseSplit(params.id, params.expenseId);
  const updateExpenseMutation = useUpdateHouseholdExpense(params.id, params.expenseId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(splitSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
  } = useForm<EditBillData>({
    resolver: zodResolver(editBillSchema),
    values: expense ? {
      title: expense.title,
      amount: String(expense.amount),
      currency: expense.currency,
      category: String(expense.category),
      dueDate: expense.dueDate ? new Date(expense.dueDate).toISOString().slice(0, 10) : "",
      recurrenceFrequency: expense.recurrenceFrequency ?? "",
      description: expense.description ?? "",
    } : undefined,
  });

  const onEditBill = (data: EditBillData) => {
    updateExpenseMutation.mutate(
      {
        title: data.title,
        amount: Number(data.amount),
        currency: data.currency,
        category: data.category,
        dueDate: data.dueDate,
        recurrenceFrequency: data.recurrenceFrequency || undefined,
        description: data.description || undefined,
      },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  const onAddSplit = (data: FormData) => {
    const membershipId = isPrivileged ? data.membershipId : currentMembership?.membershipId;
    if (!membershipId) return;
    addExpenseSplitMutation.mutate(
      { membershipId, amount: Number(data.amount), currency: expense?.currency ?? "USD" },
      { onSuccess: () => reset() }
    );
  };

  const splitTotal = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  const remaining = expense ? Number(expense.amount) - splitTotal : 0;

  if (isLoading) return (
    <div className="flex justify-center items-center h-[200px]">
      <div className="w-16 h-16 "  style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  if (fetchError) return (
    <div className="bg-[rgba(178,42,26,0.10)] p-8 text-red text-md" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>{fetchError instanceof ApiError ? fetchError.message : "Failed to load expense."}</div>
  );

  if (!expense) return null;

  return (
    <div  className="page-enter max-w-[720px] flex flex-col gap-12">
      {/* Header */}
      <div>
        <Link href={`/bills/${params.id}`} className="text-base text-ink-3 no-underline inline-flex items-center gap-2">
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
              className="py-[6px] px-[14px] shrink-0 text-base font-semibold text-ink-2 cursor-pointer mt-2" style={{ background: editOpen ? "var(--paper-3)" : "var(--paper-2)", border: "1.5px solid var(--ink)" }}
            >
              {editOpen ? "Cancel" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editOpen && isPrivileged && (
        <div className="bg-paper p-12" style={{ border: "1.5px solid var(--ink)" }}>
          <h2 className="font-serif font-bold text-md text-ink mb-8">
            Edit Expense
          </h2>
          <form onSubmit={handleSubmitEdit(onEditBill)} className="flex flex-col gap-6">
            {updateExpenseMutation.isError && (
              <div className="py-[10px] px-[14px] bg-[rgba(178,42,26,0.10)] text-base text-red" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
                {updateExpenseMutation.error instanceof ApiError ? updateExpenseMutation.error.message : "Something went wrong."}
              </div>
            )}
            <div className="form-grid-2">
              <div className="flex flex-col gap-3" style={{ gridColumn: "1 / -1" }}>
                <label className="text-base font-medium text-ink-2">Title</label>
                <input {...registerEdit("title")} className="h-[38px] bg-paper-2 p-[0_12px] text-base text-ink outline-none" style={{ border: `1px solid ${editErrors.title ? "var(--danger)" : "var(--ink-3)"}` }} />
                {editErrors.title && <span className="text-sm text-red">{editErrors.title.message}</span>}
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-base font-medium text-ink-2">Amount</label>
                <input type="number" step="0.01" {...registerEdit("amount")} className="h-[38px] bg-paper-2 p-[0_12px] text-base text-ink outline-none" style={{ border: `1px solid ${editErrors.amount ? "var(--danger)" : "var(--ink-3)"}` }} />
                {editErrors.amount && <span className="text-sm text-red">{editErrors.amount.message}</span>}
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-base font-medium text-ink-2">Currency</label>
                <input {...registerEdit("currency")} placeholder="USD" className="h-[38px] bg-paper-2 p-[0_12px] text-base text-ink outline-none" style={{ border: "1.5px solid var(--ink)" }} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-base font-medium text-ink-2">Category</label>
                <select {...registerEdit("category")} className="h-[38px] bg-paper-2 p-[0_12px] text-base text-ink outline-none" style={{ border: "1.5px solid var(--ink)" }}>
                  {["Rent","Utilities","Groceries","Transportation","Entertainment","Healthcare","Insurance","Subscriptions","Internet","Phone","Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-base font-medium text-ink-2">Due Date</label>
                <input type="date" {...registerEdit("dueDate")} className="h-[38px] bg-paper-2 p-[0_12px] text-base text-ink outline-none" style={{ border: "1.5px solid var(--ink)" }} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-base font-medium text-ink-2">Recurrence</label>
                <select {...registerEdit("recurrenceFrequency")} className="h-[38px] bg-paper-2 p-[0_12px] text-base text-ink outline-none" style={{ border: "1.5px solid var(--ink)" }}>
                  <option value="">None</option>
                  {["Daily","Weekly","Biweekly","Monthly","Quarterly","Yearly"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3" style={{ gridColumn: "1 / -1" }}>
                <label className="text-base font-medium text-ink-2">Description</label>
                <textarea {...registerEdit("description")} rows={2} className="bg-paper-2 py-4 px-6 text-base text-ink outline-none" style={{ border: "1.5px solid var(--ink)", resize: "vertical" }} />
              </div>
            </div>
            <button
              type="submit"
              disabled={updateExpenseMutation.isPending}
              className="self-end py-4 px-10 text-base font-semibold font-serif" style={{ background: updateExpenseMutation.isPending ? "var(--paper-3)" : "var(--red)", color: updateExpenseMutation.isPending ? "var(--text-3)" : "#fff", border: "none", cursor: updateExpenseMutation.isPending ? "not-allowed" : "pointer" }}
            >
              {updateExpenseMutation.isPending ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid-3">
        <StatCard label="Total" value={`${expense.currency} ${Number(expense.amount).toFixed(2)}`} />
        <StatCard label="Allocated" value={`${expense.currency} ${splitTotal.toFixed(2)}`} color={splitTotal > 0 ? "var(--success)" : undefined} />
        <StatCard
          label="Unallocated"
          value={`${expense.currency} ${remaining.toFixed(2)}`}
          color={remaining > 0.001 ? "var(--warning)" : "var(--success)"}
        />
      </div>

      {/* Progress bar */}
      {expense.amount > 0 && (
        <div className="bg-paper py-8 px-10" style={{ border: "1.5px solid var(--ink)" }}>
          <div className="flex justify-between mb-4">
            <span className="text-base text-ink-3">Allocation progress</span>
            <span className="text-base font-semibold text-ink">
              {((splitTotal / Number(expense.amount)) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-paper-3 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ background: remaining > 0.001 ? "var(--warning)" : "var(--success)", width: `${Math.min((splitTotal / Number(expense.amount)) * 100, 100)}%`, transition: "width 500ms cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
        </div>
      )}

      {/* Splits */}
      <div>
        <h2 className="font-serif font-bold text-lg text-ink mb-6">Splits</h2>

        {splits.length === 0 ? (
          <div className="bg-paper p-16 text-center mb-8" style={{ border: "1.5px solid var(--ink)" }}>
            <p className="text-base text-ink-3">No splits yet — the full amount is unallocated.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-8">
            {splits.map((split) => {
              const initials = (split.displayName ?? "?").slice(0, 2).toUpperCase();
              const isRemoving = removeSplitMutation.isPending && removeSplitMutation.variables === split.splitId;
              return (
                <div key={split.splitId} className="bg-paper py-6 px-8 flex items-center justify-between" style={{ border: "1.5px solid var(--ink)", opacity: isRemoving ? 0.5 : 1, transition: "opacity 150ms" }}>
                  <div className="flex items-center gap-5">
                    <span className="w-16 h-16 bg-[rgba(178,42,26,0.10)] text-red flex items-center justify-center text-sm font-bold font-serif">{initials}</span>
                    <div>
                      <p className="text-base font-medium text-ink">
                        {split.displayName || `${(split.splitId ?? split.userId ?? "").slice(0, 8)}…`}
                      </p>
                      <p className="text-sm text-ink-3">
                        {split.role}{split.isClaimed ? " · Claimed" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-serif font-bold text-md text-ink">{split.currency} {Number(split.amount).toFixed(2)}</span>
                    {split.isClaimed ? (
                      <span className="py-1 px-4 bg-[rgba(61,107,43,0.10)] text-green text-sm font-mono">Claimed</span>
                    ) : (
                      <button
                        onClick={() => removeSplitMutation.mutate(split.splitId)}
                        disabled={isRemoving}
                        className="py-2 px-5 bg-[rgba(178,42,26,0.10)] text-red text-sm font-medium" style={{ border: "1px solid oklch(62% 0.21 22 / 0.25)", cursor: isRemoving ? "not-allowed" : "pointer", transition: "background 110ms" }}
                      >
                        {isRemoving ? "Removing…" : "Remove"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add split form */}
        <div className="bg-paper p-10" style={{ border: "1.5px solid var(--ink)" }}>
          <h3 className="font-serif font-bold text-md text-ink mb-8">Add Split</h3>

          {!currentMembership ? (
            <p className="text-base text-ink-3">You are not a member of this household.</p>
          ) : (
            <form onSubmit={handleSubmit(onAddSplit)} className="flex flex-col gap-6">
              {addExpenseSplitMutation.isError && (
                <div className="py-[10px] px-[14px] bg-[rgba(178,42,26,0.10)] text-base text-red" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
                  {addExpenseSplitMutation.error instanceof ApiError
                    ? addExpenseSplitMutation.error.message
                    : "Something went wrong."}
                </div>
              )}

              {isPrivileged && (
                <div className="flex flex-col gap-3">
                  <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
                    Member
                  </label>
                  <select
                    {...register("membershipId")}
                    className="h-[38px] bg-paper-2 p-[0_12px] text-base text-ink outline-none" style={{ border: "1.5px solid var(--ink)" }}
                  >
                    <option value="">Select member</option>
                    {members.map((m) => (
                      <option key={m.membershipId} value={m.membershipId}>
                        {m.displayName || `${m.userId.slice(0, 8)}…`} ({m.role})
                      </option>
                    ))}
                  </select>
                  {errors.membershipId && <span className="text-sm text-red">{errors.membershipId.message}</span>}
                </div>
              )}

              {!isPrivileged && (
                <p className="text-base text-ink-3">
                  Split will be added for you ({currentMembership.role}).
                </p>
              )}

              <div className="flex flex-col gap-3">
                <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
                  Amount ({expense.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount")}
                  placeholder={remaining > 0 ? remaining.toFixed(2) : "0.00"}
                  className="h-[38px] bg-paper-2 p-[0_12px] text-base text-ink outline-none" style={{ border: `1px solid ${errors.amount ? "var(--danger)" : "var(--ink-3)"}` }}
                />
                {errors.amount && <span className="text-sm text-red">{errors.amount.message}</span>}
              </div>

              <Btn
                type="submit"
                disabled={addExpenseSplitMutation.isPending}
                variant="primary"
              >
                {addExpenseSplitMutation.isPending ? "Adding…" : "Add Split"}
              </Btn>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
