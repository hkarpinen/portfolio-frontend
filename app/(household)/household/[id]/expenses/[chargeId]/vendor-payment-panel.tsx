"use client";

import { Btn, Icon } from "@/components/editorial";
import { useMarkVendorPaid, useMarkVendorUnpaid } from "@/hooks/use-expenses";
import { getErrorMessage } from "@/lib/error-messages";
import { deriveChargeFunding } from "@/lib/charge-funding";
import type { HouseholdExpense } from "@/types/household-expense";
import type { MembershipResponse } from "@/types/membership";

/**
 * The bill's vendor-payment state. The flow depends on the charge's funding model:
 *
 * - **GroupCash (collect-first):** members pay their shares into the shared household account
 *   (the Split-between section); once every share is in, the bill's **owner** pays the vendor from
 *   that pot. The "Pay the vendor" action is gated on all shares being in.
 * - **PayerMember (front-and-reimburse):** a member already fronted the vendor from their own
 *   pocket, so recording the vendor payment is the FIRST step — never gated on others — and it
 *   covers the payer's own share. The others reimburse the payer afterward. This is why a charge
 *   whose only split is the payer's own must still be markable: there is nothing to "collect" first.
 */
export function VendorPaymentPanel({
  householdId,
  chargeId,
  expense,
  members,
  isOwner,
  paidCount,
  totalCount,
}: {
  householdId: string;
  chargeId: string;
  expense: HouseholdExpense;
  members: MembershipResponse[];
  /** Is the current user the bill's owner (only they can record the vendor payment)? */
  isOwner: boolean;
  /** Shares settled / total shares — only meaningful for the collect-first (GroupCash) model. */
  paidCount: number;
  totalCount: number;
}) {
  const occurrenceDate = expense.currentOccurrenceDate ?? expense.dueDate;
  const markPaid = useMarkVendorPaid(householdId, chargeId);
  const markUnpaid = useMarkVendorUnpaid(householdId, chargeId);

  const { isPooled, payerName } = deriveChargeFunding(expense, members);
  const allSharesPaid = totalCount > 0 && paidCount >= totalCount;
  // Collect-first only: pooled charges wait until every share is in the pot. Front-and-reimburse
  // charges were already paid to the vendor by the payer, so the owner records it at any time.
  const canPayVendor = isPooled ? allSharesPaid : true;

  if (expense.vendorPaid) {
    return (
      <section className="flex flex-col gap-2 border border-rule-soft bg-paper-2 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 font-serif text-base text-ink">
            <Icon name="check" size={14} strokeWidth={2.5} />{" "}
            {isPooled
              ? "Paid to the vendor from the household account"
              : "Paid to the vendor — fronted by a member"}
          </p>
          {isOwner && (
            <button
              type="button"
              onClick={() => markUnpaid.mutate(occurrenceDate)}
              disabled={markUnpaid.isPending}
              className="ed-label-muted inline-flex items-center gap-1 hover:text-red disabled:opacity-50"
            >
              {markUnpaid.isPending ? "Undoing…" : "Undo"}
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 border border-ink bg-paper p-5">
      <div>
        <p className="ed-kicker text-red">Not yet paid to the vendor</p>
        {isPooled ? (
          <>
            <p className="font-serif text-lg font-bold text-ink">
              {paidCount} of {totalCount || "—"} shares paid in
            </p>
            <p className="ed-hint mt-1">
              Members pay their shares into the household account below. Once all shares are in, the
              bill&rsquo;s owner pays the vendor from there.
            </p>
          </>
        ) : (
          <>
            <p className="font-serif text-lg font-bold text-ink">
              {payerName ? `Fronted by ${payerName}` : "Fronted by a member"}
            </p>
            <p className="ed-hint mt-1">
              This bill was paid to the vendor from a member&rsquo;s own pocket. Recording the vendor
              payment covers the payer&rsquo;s own share; everyone else then reimburses them below.
            </p>
          </>
        )}
      </div>

      {markPaid.isError && (
        <p className="ed-label-muted text-red">
          {getErrorMessage(markPaid.error, "Couldn’t mark it paid — try again.")}
        </p>
      )}

      {isOwner ? (
        <Btn
          variant="primary"
          onClick={() => markPaid.mutate(occurrenceDate)}
          disabled={markPaid.isPending || !canPayVendor}
          iconLeft={<Icon name="check" size={13} strokeWidth={2.5} />}
        >
          {markPaid.isPending
            ? "Marking…"
            : isPooled
              ? allSharesPaid
                ? "Pay the vendor"
                : `Pay the vendor (waiting on ${totalCount - paidCount})`
              : "Mark paid to the vendor"}
        </Btn>
      ) : (
        <p className="ed-label-muted">
          {isPooled
            ? "The bill’s owner pays the vendor once all shares are in."
            : "The member who fronted the bill records the vendor payment."}
        </p>
      )}
    </section>
  );
}
