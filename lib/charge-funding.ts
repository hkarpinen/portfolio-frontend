import type { HouseholdExpense } from "@/types/household-expense";
import type { MembershipResponse } from "@/types/membership";
import { idsEqual, memberDisplayName } from "@/lib/utils";

/**
 * The funding model is a per-charge choice: a member fronted the bill (PayerMember — others pay
 * them back) or it came from the shared pot (GroupCash — everyone pays in). One place derives the
 * payer + the settle/funding wording so the detail card, the splits section, and the vendor panel
 * can't word "Shared pot" / "Pay X back" three slightly different ways.
 */
export interface ChargeFunding {
  /** The member who fronted the bill, when this is a PayerMember charge (else undefined). */
  payerMember: MembershipResponse | undefined;
  /** The payer's display name, or null when pooled / unknown. */
  payerName: string | null;
  /** True when the bill is funded from the shared pot (GroupCash). */
  isPooled: boolean;
  /** Who paid the vendor — "Shared pot" or the payer's name (or "—" when unknown). */
  fundingLabel: string;
}

export function deriveChargeFunding(
  expense: Pick<HouseholdExpense, "fundingSource" | "payerUserId">,
  members: MembershipResponse[],
): ChargeFunding {
  const isPooled = expense.fundingSource === "GroupCash";
  const payerMember = expense.payerUserId
    ? members.find((m) => idsEqual(m.userId, expense.payerUserId))
    : undefined;
  const payerName = payerMember ? memberDisplayName(payerMember) : null;
  const fundingLabel = isPooled ? "Shared pot" : (payerName ?? "—");
  return { payerMember, payerName, isPooled, fundingLabel };
}
