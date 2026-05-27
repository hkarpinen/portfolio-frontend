"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import {
  useHouseholdExpenseDetail,
  useDeleteHouseholdExpense,
  useAddExpenseSplit,
  useRemoveExpenseSplit,
} from "@/hooks/use-expenses";
import { useMe } from "@/hooks/use-identity";
import { useHousehold, useHouseholdMembers } from "@/hooks/use-household";
import { ExpenseEditForm } from "./expense-edit-form";
import { Alert, Btn, Input, SelectField } from "@/components/editorial";
import { formatCurrency, formatFullDate } from "@/lib/formatting";

// TODO(handoff8): activity sidebar — no activity hook exists; omitted per instructions

export default function ExpensePage() {
  const { id, expenseId } = useParams<{ id: string; expenseId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: page, isLoading, error: fetchError } = useHouseholdExpenseDetail(id, expenseId);
  const { data: me } = useMe();
  // `?edit=1` from the household list's row-level Edit link auto-opens the
  // form so the user lands directly in edit mode.
  const [editOpen, setEditOpen] = useState(() => searchParams.get("edit") === "1");
  useEffect(() => {
    if (searchParams.get("edit") === "1") setEditOpen(true);
  }, [searchParams]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { data: householdMembers } = useHouseholdMembers(id);
  const { data: household } = useHousehold(id);
  const deleteMutation = useDeleteHouseholdExpense(id);
  const addSplitMutation = useAddExpenseSplit(id, expenseId);
  const removeSplitMutation = useRemoveExpenseSplit(id, expenseId);
  const [addMembershipId, setAddMembershipId] = useState("");
  const [addAmount, setAddAmount] = useState("");

  const expense = page?.expense;
  const splits = page?.splits ?? [];
  const members = householdMembers ?? [];
  const currentMembership = members.find(
    (m) => me?.id && m.userId?.toLowerCase() === me.id.toLowerCase()
  ) ?? null;
  // Ownership lives on the household entity (`ownerId`), separate from the
  // membership row's role — the owner's membership isn't always labelled
  // "Owner". Mirror the household page's `isOwner || role === "Admin"` check
  // so the owner sees Edit/Delete here too.
  const isOwner = !!(
    me?.id && household?.ownerId &&
    me.id.toLowerCase() === household.ownerId.toLowerCase()
  );
  const isPrivileged =
    isOwner ||
    currentMembership?.role === "Owner" ||
    currentMembership?.role === "Admin";

  function handleDelete() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    deleteMutation.mutate(expenseId, {
      onSuccess: () => router.push(`/household/${id}`),
    });
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-[200px]">
      <div className="w-16 h-16 border-2 border-ink-4 animate-spin border-t-[var(--ink)]" />
    </div>
  );

  if (fetchError) return (
    <Alert variant="danger">
      {fetchError instanceof ApiError ? fetchError.message : "Failed to load expense."}
    </Alert>
  );

  if (!expense) return null;

  const amountFmt = formatCurrency(Number(expense.amount), expense.currency ?? "USD");

  const dateFmt = formatFullDate(expense.dueDate);

  return (
    <div className="page-enter max-w-[800px] flex flex-col gap-10">
      {/* Back link */}
      <Link href={`/household/${id}`} className="ed-label-muted no-underline hover:text-red">← Back to household</Link>

      {/* Header row */}
      <header className="ed-section-head">
        <p className="ed-kicker">Expense</p>
        <div className="ed-section-head-row">
          <div className="flex-1 min-w-0">
            <h1 className="ed-h1">{expense.title}</h1>
            {expense.description && <p className="ed-deck mt-2">{expense.description}</p>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isPrivileged && (
              <>
                <Btn variant="secondary" size="sm" onClick={() => setEditOpen((v) => !v)}>
                  {editOpen ? "Cancel" : "Edit"}
                </Btn>
                {deleteConfirm ? (
                  <>
                    <Btn
                      variant="danger"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={handleDelete}
                    >
                      {deleteMutation.isPending ? "Deleting…" : "Confirm delete"}
                    </Btn>
                    <Btn variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)}>
                      Cancel
                    </Btn>
                  </>
                ) : (
                  <Btn variant="danger" size="sm" onClick={handleDelete}>
                    Delete
                  </Btn>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {deleteMutation.isError && (
        <Alert variant="danger">
          {deleteMutation.error instanceof ApiError ? deleteMutation.error.message : "Failed to delete expense."}
        </Alert>
      )}

      {editOpen && isPrivileged && (
        <ExpenseEditForm
          expense={expense}
          householdId={id}
          expenseId={expenseId}
          onClose={() => setEditOpen(false)}
        />
      )}

      {/* 2-column metadata card */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--rule)] border border-rule"
        aria-label="Expense details"
      >
        <div className="bg-paper p-5 flex flex-col gap-1">
          <p className="ed-kicker text-ink-3">Amount</p>
          <p className="font-serif font-bold text-[1.5rem] leading-none text-red">{amountFmt}</p>
        </div>
        <div className="bg-paper p-5 flex flex-col gap-1">
          <p className="ed-kicker text-ink-3">Date</p>
          <p className="font-mono text-sm text-ink">{dateFmt}</p>
        </div>
        <div className="bg-paper p-5 flex flex-col gap-1">
          <p className="ed-kicker text-ink-3">Payer</p>
          {/* TODO(handoff8): wire to payer — HouseholdExpense has no payerId field yet */}
          <p className="font-mono text-sm text-ink-3">—</p>
        </div>
        <div className="bg-paper p-5 flex flex-col gap-1">
          <p className="ed-kicker text-ink-3">Category</p>
          {expense.category ? (
            <span className="font-mono text-xs tracking-[0.08em] uppercase text-ink-3">
              {String(expense.category)}
            </span>
          ) : (
            <span className="font-mono text-sm text-ink-3">—</span>
          )}
        </div>
      </div>

      {/* Split between table */}
      {(() => {
        const splitTotal = splits.reduce((sum, s) => sum + Number(s.amount), 0);
        const remaining = Math.max(0, Number(expense.amount) - splitTotal);
        // Match splits to members by userId (splits carry userId, not membershipId).
        const splitUserIds = new Set(
          splits.map((s) => s.userId?.toLowerCase()).filter(Boolean) as string[]
        );
        const eligibleMembers = members.filter(
          (m) => !splitUserIds.has(m.userId?.toLowerCase() ?? "")
        );
        const currentUserInSplit = !!(
          currentMembership && splitUserIds.has(currentMembership.userId?.toLowerCase() ?? "")
        );
        // Anyone who is currently a member can edit splits.
        const canEditSplits = !!currentMembership;

        const handleAddSplit = (e: React.FormEvent) => {
          e.preventDefault();
          const membershipId = isPrivileged
            ? addMembershipId
            : currentMembership?.membershipId;
          const amt = Number(addAmount);
          if (!membershipId || !amt || amt <= 0) return;
          addSplitMutation.mutate(
            { membershipId, amount: amt, currency: expense.currency },
            {
              onSuccess: () => {
                setAddMembershipId("");
                setAddAmount("");
              },
            }
          );
        };

        return (
          <section className="flex flex-col gap-4">
            <div className="ed-section-row">
              <h2 className="ed-h2">Split <em>between</em></h2>
              <span className="ed-label-muted">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: expense.currency ?? "USD" }).format(splitTotal)}
                {" allocated · "}
                {new Intl.NumberFormat("en-US", { style: "currency", currency: expense.currency ?? "USD" }).format(remaining)}
                {" remaining"}
              </span>
            </div>

            {splits.length === 0 ? (
              <p className="ed-label-muted">No splits yet — the full amount is unallocated.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" aria-label="Expense splits by member">
                  <thead>
                    <tr className="border-b border-ink">
                      <th scope="col" className="text-left ed-kicker pb-[10px] pr-6 font-normal">Member</th>
                      <th scope="col" className="text-right ed-kicker pb-[10px] pr-6 font-normal">Share</th>
                      <th scope="col" className="text-right ed-kicker pb-[10px] pr-6 font-normal">Amount</th>
                      <th scope="col" className="text-left ed-kicker pb-[10px] pr-6 font-normal">Status</th>
                      {canEditSplits && (
                        <th scope="col" className="text-right ed-kicker pb-[10px] font-normal">
                          <span className="sr-only">Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {splits.map((split) => {
                      const pct = expense.amount > 0
                        ? ((Number(split.amount) / Number(expense.amount)) * 100).toFixed(1)
                        : "—";
                      const splitFmt = formatCurrency(Number(split.amount), split.currency ?? expense.currency ?? "USD");
                      // A member can remove their own split; privileged users can
                      // remove any non-claimed split.
                      const isOwnSplit =
                        currentMembership?.userId &&
                        split.userId?.toLowerCase() === currentMembership.userId.toLowerCase();
                      const mayRemove = !split.isClaimed && (isPrivileged || isOwnSplit);
                      const isRemoving = removeSplitMutation.isPending && removeSplitMutation.variables === split.splitId;

                      return (
                        <tr key={split.splitId} className="border-b border-rule-soft">
                          <td className="py-[14px] pr-6 font-serif italic text-ink text-[1.0625rem]">
                            {split.displayName || `Member ${(split.splitId ?? split.userId ?? "").slice(0, 6)}…`}
                          </td>
                          <td className="py-[14px] pr-6 text-right font-mono text-sm text-ink-3 whitespace-nowrap">
                            {pct}%
                          </td>
                          <td className="py-[14px] pr-6 text-right font-mono text-sm text-ink whitespace-nowrap">
                            {splitFmt}
                          </td>
                          <td className="py-[14px] pr-6 whitespace-nowrap">
                            {split.isClaimed ? (
                              <span
                                className="inline-flex items-center gap-[5px] font-mono text-xs tracking-[0.08em] uppercase text-ink-3"
                                aria-label="Split claimed"
                              >
                                {/* Check mark provides shape-based indicator in addition to text */}
                                <svg aria-hidden width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>
                                Claimed
                              </span>
                            ) : (
                              <span
                                className="font-mono text-xs tracking-[0.08em] uppercase text-red"
                                style={{ border: "1px solid var(--red)", padding: "2px 8px" }}
                                aria-label="Split open — not yet claimed"
                              >
                                Open
                              </span>
                            )}
                          </td>
                          {canEditSplits && (
                            <td className="py-[14px] text-right whitespace-nowrap">
                              {mayRemove && (
                                <button
                                  type="button"
                                  onClick={() => removeSplitMutation.mutate(split.splitId)}
                                  disabled={isRemoving}
                                  aria-label={`Remove ${split.displayName || "member"} from this split`}
                                  className="font-mono text-xs tracking-[0.08em] uppercase text-ink-3 hover:text-red focus:text-red bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
                                >
                                  {isRemoving ? "Removing…" : "Remove"}
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {removeSplitMutation.isError && (
              <Alert variant="danger">
                {removeSplitMutation.error instanceof ApiError ? removeSplitMutation.error.message : "Failed to remove split."}
              </Alert>
            )}

            {/* Add-split editor — appears once eligible members exist (or always for
                non-privileged member adding their own share if they're not already on
                the split). */}
            {canEditSplits && (
              (isPrivileged && eligibleMembers.length > 0) ||
              (!isPrivileged && currentMembership && !currentUserInSplit)
            ) && (
              <form
                onSubmit={handleAddSplit}
                aria-label="Add a member to this split"
                className="ed-card ed-card-muted flex flex-col gap-4 mt-2"
              >
                <p className="ed-kicker">Add split</p>
                {addSplitMutation.isError && (
                  <Alert variant="danger">
                    {addSplitMutation.error instanceof ApiError ? addSplitMutation.error.message : "Failed to add split."}
                  </Alert>
                )}
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-3">
                  {isPrivileged ? (
                    <div className="flex-1 min-w-0">
                      <SelectField
                        label="Member"
                        value={addMembershipId}
                        onChange={(e) => setAddMembershipId(e.target.value)}
                        required
                      >
                        <option value="">Select member…</option>
                        {eligibleMembers.map((m) => (
                          <option key={m.membershipId} value={m.membershipId}>
                            {m.displayName || `${m.userId.slice(0, 8)}…`} ({m.role})
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="ed-label-muted">
                        Add yourself ({currentMembership?.displayName || "you"})
                      </p>
                    </div>
                  )}
                  <div className="w-full sm:w-[160px]">
                    <Input
                      label={`Amount (${expense.currency})`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder={remaining > 0 ? remaining.toFixed(2) : "0.00"}
                      required
                    />
                  </div>
                  <Btn
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={
                      addSplitMutation.isPending ||
                      !addAmount ||
                      (isPrivileged && !addMembershipId)
                    }
                  >
                    {addSplitMutation.isPending ? "Adding…" : "Add split"}
                  </Btn>
                </div>
              </form>
            )}
          </section>
        );
      })()}
    </div>
  );
}
