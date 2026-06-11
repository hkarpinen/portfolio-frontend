import { redirect } from "next/navigation";

/** Moved: account statements now live inside the household at /household/[id]/ledger/[accountId]. */
export default function GroupAccountStatementMoved({
  params,
}: {
  params: { id: string; accountId: string };
}) {
  redirect(`/household/${params.id}/ledger/${params.accountId}`);
}
