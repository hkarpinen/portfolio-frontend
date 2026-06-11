"use client";

import { Alert, Btn, Icon, Input, SelectField } from "@/components/editorial";
import { useState } from "react";
import {
  useAddExpenseSplit,
  useAssignHouseholdAllocation,
  useRemoveExpenseSplit,
  usePayHouseholdExpense,
  useUnpayHouseholdExpense,
} from "@/hooks/use-expenses";
import { getErrorMessage } from "@/lib/error-messages";

import { formatCurrency } from "@/lib/formatting";
import { idsEqual, memberDisplayName } from "@/lib/utils";
import { deriveChargeFunding } from "@/lib/charge-funding";
import type { HouseholdExpense, ExpenseSplit } from "@/types/household-expense";
import type { MembershipResponse } from "@/types/membership";
import {
  eligibleSplitMembers,
  splitAllocation,
  splitShareLabel,
} from "./expense-detail-derivations";

/**
 * "Split between" section of the household-expense detail page.
 *
 * Owns the add-split form state and the split mutations (add/remove). The
 * parent passes the expense, the splits, the household members, plus the
 * caller's membership and privilege flag — this component does the rest.
 */
export function ExpenseSplitsSection({
  householdId,
  chargeId,
  expense,
  splits,
  members,
  currentMembership,
  isPrivileged,
}: {
  householdId: string;
  chargeId: string;
  expense: HouseholdExpense;
  splits: ExpenseSplit[];
  members: MembershipResponse[];
  currentMembership: MembershipResponse | null;
  isPrivileged: boolean;
}) {
  const addSplitMutation = useAddExpenseSplit(householdId, chargeId);
  const assignMutation = useAssignHouseholdAllocation(householdId, chargeId);
  const removeSplitMutation = useRemoveExpenseSplit(householdId, chargeId);
  const payMutation = usePayHouseholdExpense(householdId, chargeId);
  const unpayMutation = useUnpayHouseholdExpense(householdId, chargeId);
  const occurrenceDate = expense.currentOccurrenceDate ?? new Date().toISOString();

  // The funding model is a per-charge choice: a member fronted the bill (PayerMember — others pay
  // them back) or it came from the shared pot (GroupCash — everyone pays in). Drives the wording of
  // the settle action and the section note.
  const { isPooled, payerName } = deriveChargeFunding(expense, members);
  const markPaidLabel = isPooled
    ? "Pay into pot"
    : payerName
      ? `Pay ${payerName} back`
      : "Mark my share paid";

  const fundingNote = isPooled
    ? "Each member pays their share into the household pot; the owner settles with the vendor once everyone's in."
    : `Each member pays ${payerName ?? "the member who fronted the bill"} back for their share.`;

  const [addUserId, setAddUserId] = useState("");
  const [addAmount, setAddAmount] = useState("");

  const { allocated: splitTotal, remaining } = splitAllocation(splits, Number(expense.amount));
  const { eligibleMembers, currentUserInSplit } = eligibleSplitMembers(
    splits,
    members,
    currentMembership,
  );
  const canEditSplits = !!currentMembership;

  function handleAddSplit(e: React.FormEvent) {
    e.preventDefault();
    // Finance keys allocation actors on the identity userId. A privileged member may add a split
    // for any member (target userId from the dropdown); a regular member only for themselves.
    const userId = isPrivileged ? addUserId : currentMembership?.userId;
    const amt = Number(addAmount);
    if (!userId || !amt || amt <= 0) return;

    const onSuccess = () => {
      setAddUserId("");
      setAddAmount("");
    };
    const body = { userId, amount: amt, currency: expense.currency };

    // Your OWN share goes straight to finance (synchronous). Assigning ANOTHER member's share is
    // role-gated, so it routes through the household service, which authorizes (Owner/Admin) and
    // emits an event finance applies a moment later — no service-to-service call.
    if (userId === currentMembership?.userId) {
      addSplitMutation.mutate(body, { onSuccess });
    } else {
      assignMutation.mutate(body, { onSuccess });
    }
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

      {fundingNote && <p className="ed-label-muted -mt-1">{fundingNote}</p>}

      {splits.length === 0 ? (
        <p className="ed-label-muted">No splits yet — the full amount is unallocated.</p>
      ) : (
        <SplitsTable
          splits={splits}
          expense={expense}
          currentMembership={currentMembership}
          isPrivileged={isPrivileged}
          canEditSplits={canEditSplits}
          onRemove={(allocationId) => removeSplitMutation.mutate(allocationId)}
          removingSplitId={
            removeSplitMutation.isPending ? (removeSplitMutation.variables ?? null) : null
          }
          onMarkMinePaid={() => payMutation.mutate(occurrenceDate)}
          isMarkingPaid={payMutation.isPending}
          markPaidLabel={markPaidLabel}
          onUnpayMine={() => unpayMutation.mutate(occurrenceDate)}
          isUnpaying={unpayMutation.isPending}
        />
      )}

      {removeSplitMutation.isError && (
        <Alert variant="danger">
          {getErrorMessage(removeSplitMutation.error, "Failed to remove split.")}
        </Alert>
      )}

      {payMutation.isError && (
        <Alert variant="danger">
          {getErrorMessage(payMutation.error, "Failed to mark your share paid.")}
        </Alert>
      )}

      {unpayMutation.isError && (
        <Alert variant="danger">
          {getErrorMessage(unpayMutation.error, "Failed to undo your payment.")}
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
            addUserId={addUserId}
            setAddUserId={setAddUserId}
            addAmount={addAmount}
            setAddAmount={setAddAmount}
            isPending={addSplitMutation.isPending || assignMutation.isPending}
            error={
              addSplitMutation.isError
                ? getErrorMessage(addSplitMutation.error, "Failed to add split.")
                : assignMutation.isError
                  ? getErrorMessage(assignMutation.error, "You can only set another member's split if you're an owner or admin.")
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
  onMarkMinePaid,
  isMarkingPaid,
  markPaidLabel,
  onUnpayMine,
  isUnpaying,
}: {
  splits: ExpenseSplit[];
  expense: HouseholdExpense;
  currentMembership: MembershipResponse | null;
  isPrivileged: boolean;
  canEditSplits: boolean;
  onRemove: (allocationId: string) => void;
  removingSplitId: string | null;
  onMarkMinePaid: () => void;
  isMarkingPaid: boolean;
  markPaidLabel: string;
  onUnpayMine: () => void;
  isUnpaying: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" aria-label="Expense splits by member">
        <thead>
          <tr className="border-b border-[var(--ink)]">
            <th scope="col" className="ed-kicker pb-5 pr-6 text-left font-normal">
              Member
            </th>
            <th scope="col" className="ed-kicker pb-5 pr-6 text-right font-normal">
              Share
            </th>
            <th scope="col" className="ed-kicker pb-5 pr-6 text-right font-normal">
              Amount
            </th>
            <th scope="col" className="ed-kicker pb-5 pr-6 text-left font-normal">
              Status
            </th>
            {canEditSplits && (
              <th scope="col" className="ed-kicker pb-5 text-right font-normal">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {splits.map((split) => {
            const pct = splitShareLabel(split, expense);
            const splitFmt = formatCurrency(
              Number(split.amount),
              split.currency ?? expense.currency ?? "USD",
            );
            const isOwnSplit = idsEqual(split.userId, currentMembership?.userId);
            const mayRemove = !split.isPaid && (isPrivileged || isOwnSplit);
            const isRemoving = removingSplitId === split.allocationId;
            // On a "a member paid" (PayerMember) charge, the payer fronted the bill — their own
            // share is covered by paying the vendor, so there is nothing to settle. They must never
            // see a "Pay … back" action for it (you can't pay yourself back). Pooled charges have no
            // fronted share: everyone owes the pot.
            const isPayerFrontedShare =
              expense.fundingSource !== "GroupCash" &&
              idsEqual(split.userId, expense.payerUserId);

            return (
              <tr key={split.allocationId} className="border-b border-rule-soft">
                <td className="py-7 pr-6 font-serif text-[1.0625rem] italic text-ink">
                  {memberDisplayName(split, split.allocationId ?? split.userId)}
                </td>
                <td className="whitespace-nowrap py-7 pr-6 text-right font-mono text-sm text-ink-3">
                  {pct}
                </td>
                <td className="whitespace-nowrap py-7 pr-6 text-right font-mono text-sm text-ink">
                  {splitFmt}
                </td>
                <td className="whitespace-nowrap py-7 pr-6">
                  {isPayerFrontedShare ? (
                    // The payer fronted the bill, so they never settle their own share. But their
                    // outlay is only captured in the ledger once the vendor payment is recorded
                    // (Dr Vendor Payable / Cr Member:payer). Only claim "Fronted" once that's true;
                    // until then the bill simply hasn't been recorded as paid yet — show Awaiting,
                    // not a (nonsensical) "pay yourself back" action.
                    expense.vendorPaid ? (
                      <span
                        className="inline-flex items-center gap-[5px] font-mono text-xs uppercase tracking-[0.08em] text-ink-3"
                        aria-label={
                          isOwnSplit
                            ? "You fronted this bill — your share is covered"
                            : "Fronted by the payer — covered"
                        }
                      >
                        <Icon name="check" size={11} strokeWidth={2.5} aria-hidden />
                        Fronted{isOwnSplit ? " · you" : ""}
                      </span>
                    ) : (
                      <span
                        className="font-mono text-xs uppercase tracking-[0.08em] text-ink-3"
                        aria-label="Awaiting — the vendor payment isn't recorded yet"
                      >
                        Awaiting payment
                      </span>
                    )
                  ) : isOwnSplit && !split.isPaid ? (
                    <Btn
                      variant="primary"
                      size="sm"
                      onClick={onMarkMinePaid}
                      disabled={isMarkingPaid}
                      aria-label={markPaidLabel}
                    >
                      {isMarkingPaid ? "Marking…" : markPaidLabel}
                    </Btn>
                  ) : isOwnSplit && split.isPaid ? (
                    <button
                      type="button"
                      onClick={onUnpayMine}
                      disabled={isUnpaying}
                      aria-label="Undo — mark your share unpaid"
                      className="inline-flex cursor-pointer items-center gap-[5px] border-none bg-transparent p-0 font-mono text-xs uppercase tracking-[0.08em] text-ink-3 hover:text-red focus:text-red disabled:opacity-50"
                    >
                      <Icon name="check" size={11} strokeWidth={2.5} aria-hidden />
                      {isUnpaying ? "Undoing…" : "Paid · you (undo)"}
                    </button>
                  ) : (
                    <SplitStatusPill claimed={split.isPaid} mine={isOwnSplit} />
                  )}
                </td>
                {canEditSplits && (
                  <td className="whitespace-nowrap py-7 text-right">
                    {mayRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(split.allocationId)}
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

function SplitStatusPill({ claimed, mine = false }: { claimed: boolean; mine?: boolean }) {
  if (claimed) {
    return (
      <span
        className="inline-flex items-center gap-[5px] font-mono text-xs uppercase tracking-[0.08em] text-ink-3"
        aria-label={mine ? "Your share is paid" : "Paid"}
      >
        <Icon name="check" size={11} strokeWidth={2.5} aria-hidden />
        Paid{mine ? " · you" : ""}
      </span>
    );
  }
  return (
    <span
      className="font-mono text-xs uppercase tracking-[0.08em] text-red"
      style={{ border: "1px solid var(--red)", padding: "2px 8px" }}
      aria-label="Open — not yet paid"
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
  addUserId,
  setAddUserId,
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
  addUserId: string;
  setAddUserId: (v: string) => void;
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
              value={addUserId}
              onChange={(e) => setAddUserId(e.target.value)}
              required
            >
              <option value="">Select member…</option>
              {eligibleMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {memberDisplayName(m)} ({m.role})
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
          disabled={isPending || !addAmount || (isPrivileged && !addUserId)}
        >
          {isPending ? "Adding…" : "Add split"}
        </Btn>
      </div>
    </form>
  );
}
