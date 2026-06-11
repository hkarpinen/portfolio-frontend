import { redirect } from "next/navigation";

export default function ProfilePage() {
  redirect("/identity/settings/profile/account");
}
