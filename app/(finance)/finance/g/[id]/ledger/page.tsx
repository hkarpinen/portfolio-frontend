import { redirect } from "next/navigation";

/** Moved: the household ledger now lives inside the household at /household/[id]/ledger. */
export default function GroupLedgerMoved({ params }: { params: { id: string } }) {
  redirect(`/household/${params.id}/ledger`);
}
