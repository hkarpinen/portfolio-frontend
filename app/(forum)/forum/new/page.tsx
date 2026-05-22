import { requireUser } from "@/lib/auth/session";
import { NewCommunityForm } from "./new-community-form";

export default async function NewCommunityPage() {
  await requireUser();
  return <NewCommunityForm />;
}
