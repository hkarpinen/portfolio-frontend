import { redirect } from "next/navigation";

/** Moved: a household's money now lives inside the household at /household/[id]. */
export default function GroupMoneyMoved({ params }: { params: { id: string } }) {
  redirect(`/household/${params.id}`);
}
