import { redirect } from "next/navigation";

/**
 * Retired. The per-member, per-period contributions view was folded into Shared money: a member's
 * owed-vs-paid over time is now their account activity (the Month/Quarter/Year lens on their ledger
 * Member account). This route redirects so any lingering links keep working.
 */
export default function ContributionsRedirect({ params }: { params: { id: string } }) {
  redirect(`/household/${params.id}`);
}
