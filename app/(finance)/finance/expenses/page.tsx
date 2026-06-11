import { redirect } from "next/navigation";

/** Merged: personal expenses now live on the Money home at /finance/overview, alongside the
 *  where-you-stand lede and the cross-household net positions. The add form stays at ./new. */
export default function ExpensesMerged() {
  redirect("/finance/overview");
}
