import type { MembershipResponse } from "@/types/membership";
import { memberDisplayName } from "@/lib/utils";

/**
 * Member-equity accounts in the group ledger are coded `3000:{userId-without-dashes}`.
 * One place owns that convention — the ledger views, the account-statement drill-in, and the
 * household-money summary all reimplemented it before; keep it here so the code prefix and the
 * name-resolution map can never drift apart.
 */
const MEMBER_PREFIX = "3000:";

/** Is this a member-equity account (vs. the Cash pot, an expense category, etc.)? */
export function isMemberAccount(code: string): boolean {
  return code.startsWith(MEMBER_PREFIX);
}

/** The dash-stripped identity userId encoded in a member account's code, or null if it isn't one. */
export function memberIdFromCode(code: string): string | null {
  return isMemberAccount(code) ? code.slice(MEMBER_PREFIX.length) : null;
}

/** The account code for a member, given their (dashed) identity userId. */
export function memberAccountCode(userId: string): string {
  return `${MEMBER_PREFIX}${userId.replaceAll("-", "")}`;
}

/**
 * Display name for a ledger account: member accounts resolve to the member's display name (the
 * stored account name is opaque), everything else falls back to the account's own name.
 */
export function resolveAccountName(
  account: { code: string; name: string },
  members: MembershipResponse[],
): string {
  const memberId = memberIdFromCode(account.code);
  if (memberId === null) return account.name;
  const match = members.find((m) => m.userId.replaceAll("-", "") === memberId);
  return match ? memberDisplayName(match) : account.name;
}
