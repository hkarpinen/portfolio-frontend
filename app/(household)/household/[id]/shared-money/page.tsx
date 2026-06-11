import { redirect } from "next/navigation";

/** Moved: a household's money is now the household landing at /household/[id]. */
export default function SharedMoneyMoved({ params }: { params: { id: string } }) {
  redirect(`/household/${params.id}`);
}
