"use client";

import { Alert, Btn, Input, SelectField } from "@/components/editorial";
import { useState } from "react";
import { useAddExpenseSplit, useRemoveExpenseSplit } from "@/hooks/use-expenses";
import { getErrorMessage } from "@/lib/error-messages";

import { formatCurrency } from "@/lib/formatting";
import type { HouseholdExpense, ExpenseSplit } from "@/types/household-expense";
import type { MembershipResponse } from "@/types/membership";

/**
 * "Split between" section of the household-expense detail page.
 *
 * Owns the add-split form state and the split mutations (add/remove). The
 * parent passes the expense, the splits, the household members, plus the
 * caller's membership and privilege flag — this component does the rest.
 */
export function ExpenseSplitsSection({
  householdId,
  expenseId,
  expense,
  splits,
  members,
  currentMembership,
  isPrivileged,
}: {
  householdId: string;
  expenseId: string;
  expense: HouseholdExpense;
  splits: ExpenseSplit[];
  members: MembershipResponse[];
  currentMembership: MembershipResponse | null;
  isPrivileged: boolean;
}) {
  const addSplitMutation = useAddExpenseSplit(householdId, expenseId);
  const removeSplitMutation = useRemoveExpenseSplit(householdId, expenseId);
  const [addMembershipId, setAddMembershipId] = useState("");
  const [addAmount, setAddAmount] = useState("");

  const splitTotal = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  const remaining = Math.max(0, Number(expense.amount) - splitTotal);
  const splitUserIds = new Set(
    splits.map((s) => s.userId?.toLowerCase()).filter(Boolean) as string[],
  );
  const eligibleMembers = members.filter(
    (m) => !splitUserIds.has(m.userId?.toLowerCase() ?? ""),
  );
  const currentUserInSplit = !!(
    currentMembership && splitUserIds.has(currentMembership.userId?.toLowerCase() ?? "")
  );
  const canEditSplits = !!currentMembership;

  function handleAddSplit(e: React.FormEvent) {
    e.preventDefault();
    const membershipId = isPrivileged ? addMembershipId : currentMembership?.membershipId;
    const amt = Number(addAmount);
    if (!membershipId || !amt || amt <= 0) return;
    addSplitMutation.mutate(
      { membershipId, amount: amt, currency: expense.currency },
      {
        onSuccess: () => {
          setAddMembershipId("");
          setAddAmount("");
        },
      },
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="ed-section-row">
        <h2 className="ed-h2">
          Split <em>between</em>
        </h2>
        <span className="ed-label-muted">
          {formatCurrency(splitTotal, expense.currency ?? "USD")}
          {" allocated · "}
          {formatCurrency(remaining, expense.currency ?? "USD")}
          {" remaining"}
        </span>
      </div>

      {splits.length === 0 ? (
        <p className="ed-label-muted">No splits yet — the full amount is unallocated.</p>
      ) : (
        <SplitsTable
          splits={splits}
          expense={expense}
          currentMembership={currentMembership}
          isPrivileged={isPrivileged}
          canEditSplits={canEditSplits}
          onRemove={(splitId) => removeSplitMutation.mutate(splitId)}
          removingSplitId={
            removeSplitMutation.isPending ? (removeSplitMutation.variables ?? null) : null
          }
        />
      )}

      {removeSplitMutation.isError && (
        <Alert variant="danger">
          {getErrorMessage(removeSplitMutation.error, "Failed to remove split.")}
        </Alert>
      )}

      {canEditSplits &&
        ((isPrivileged && eligibleMembers.length > 0) ||
          (!isPrivileged && currentMembership && !currentUserInSplit)) && (
          <AddSplitForm
            isPrivileged={isPrivileged}
            currentMembership={currentMembership}
            eligibleMembers={eligibleMembers}
            currency={expense.currency}
            remaining={remaining}
            addMembershipId={addMembershipId}
            setAddMembershipId={setAddMembershipId}
            addAmount={addAmount}
            setAddAmount={setAddAmount}
            isPending={addSplitMutation.isPending}
            error={
              addSplitMutation.isError
                ? getErrorMessage(addSplitMutation.error, "Failed to add split.")
                : null
            }
            onSubmit={handleAddSplit}
          />
        )}
    </section>
  );
}

// ─── Splits table ─────────────────────────────────────────────────────────────

function SplitsTable({
  splits,
  expense,
  currentMembership,
  isPrivileged,
  canEditSplits,
  onRemove,
  removingSplitId,
}: {
  splits: ExpenseSplit[];
  expense: HouseholdExpense;
  currentMembership: MembershipResponse | null;
  isPrivileged: boolean;
  canEditSplits: boolean;
  onRemove: (splitId: string) => void;
  removingSplitId: string | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" aria-label="Expense splits by member">
        <thead>
          <tr className="border-b border-[var(--ink)]">
            <th scope="col" className="ed-kicker pb-[10px] pr-6 text-left font-normal">
              Member
            </th>
            <th scope="col" className="ed-kicker pb-[10px] pr-6 text-right font-normal">
              Share
            </th>
            <th scope="col" className="ed-kicker pb-[10px] pr-6 text-right font-normal">
              Amount
            </th>
            <th scope="col" className="ed-kicker pb-[10px] pr-6 text-left font-normal">
              Status
            </th>
            {canEditSplits && (
              <th scope="col" className="ed-kicker pb-[10px] text-right font-normal">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {splits.map((split) => {
            const pct =
              expense.amount > 0
                ? ((Number(split.amount) / Number(expense.amount)) * 100).toFixed(1)
                : "—";
            const splitFmt = formatCurrency(
              Number(split.amount),
              split.currency ?? expense.currency ?? "USD",
            );
            const isOwnSplit =
              currentMembership?.userId &&
              split.userId?.toLowerCase() === currentMembership.userId.toLowerCase();
            const mayRemove = !split.isClaimed && (isPrivileged || isOwnSplit);
            const isRemoving = removingSplitId === split.splitId;

            return (
              <tr key={split.splitId} className="border-b border-rule-soft">
                <td className="py-[14px] pr-6 font-serif text-[1.0625rem] italic text-ink">
                  {split.displayName ||
                    `Member ${(split.splitId ?? split.userId ?? "").slice(0, 6)}…`}
                </td>
                <td className="whitespace-nowrap py-[14px] pr-6 text-right font-mono text-sm text-ink-3">
                  {pct}%
                </td>
                <td className="whitespace-nowrap py-[14px] pr-6 text-right font-mono text-sm text-ink">
                  {splitFmt}
                </td>
                <td className="whitespace-nowrap py-[14px] pr-6">
                  <SplitStatusPill claimed={split.isClaimed} />
                </td>
                {canEditSplits && (
                  <td className="whitespace-nowrap py-[14px] text-right">
                    {mayRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(split.splitId)}
                        disabled={isRemoving}
                        aria-label={`Remove ${split.displayName || "member"} from this split`}
                        className="cursor-pointer border-none bg-transparent p-0 font-mono text-xs uppercase tracking-[0.08em] text-ink-3 hover:text-red focus:text-red disabled:opacity-50"
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
  );
}

function SplitStatusPill({ claimed }: { claimed: boolean }) {
  if (claimed) {
    return (
      <span
        className="inline-flex items-center gap-[5px] font-mono text-xs uppercase tracking-[0.08em] text-ink-3"
        aria-label="Split claimed"
      >
        <svg
          aria-hidden
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2 6 5 9 10 3" />
        </svg>
        Claimed
      </span>
    );
  }
  return (
    <span
      className="font-mono text-xs uppercase tracking-[0.08em] text-red"
      style={{ border: "1px solid var(--red)", padding: "2px 8px" }}
      aria-label="Split open — not yet claimed"
    >
      Open
    </span>
  );
}

// ─── Add-split form ───────────────────────────────────────────────────────────

function AddSplitForm({
  isPrivileged,
  currentMembership,
  eligibleMembers,
  currency,
  remaining,
  addMembershipId,
  setAddMembershipId,
  addAmount,
  setAddAmount,
  isPending,
  error,
  onSubmit,
}: {
  isPrivileged: boolean;
  currentMembership: MembershipResponse | null;
  eligibleMembers: MembershipResponse[];
  currency: string;
  remaining: number;
  addMembershipId: string;
  setAddMembershipId: (v: string) => void;
  addAmount: string;
  setAddAmount: (v: string) => void;
  isPending: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      aria-label="Add a member to this split"
      className="ed-card ed-card-muted mt-2 flex flex-col gap-4"
    >
      <p className="ed-kicker">Add split</p>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
        {isPrivileged ? (
          <div className="min-w-0 flex-1">
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
          <div className="min-w-0 flex-1">
            <p className="ed-label-muted">
              Add yourself ({currentMembership?.displayName || "you"})
            </p>
          </div>
        )}
        <div className="w-full sm:w-[160px]">
          <Input
            label={`Amount (${currency})`}
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
          disabled={isPending || !addAmount || (isPrivileged && !addMembershipId)}
        >
          {isPending ? "Adding…" : "Add split"}
        </Btn>
      </div>
    </form>
  );
}
