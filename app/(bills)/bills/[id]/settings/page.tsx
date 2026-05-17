import Link from "next/link";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/server-api-client";
import type { Household, MembershipResponse } from "@/types/finance";
import type { Me as UserProfile } from "@/types/identity";
import { SettingsForm } from "./settings-form";
import { InviteSection } from "./invite-section";
import { MemberActions } from "./member-actions";
import { DangerZone } from "./danger-zone";

interface Props {
  params: { id: string };
}

export default async function HouseholdSettingsPage({ params }: Props) {
  const cookieHeader = cookies().toString();
  const [household, membersRaw, me] = await Promise.all([
    serverFetch<Household>(`/api/households/${params.id}`, cookieHeader),
    serverFetch<MembershipResponse[]>(`/api/households/${params.id}/members`, cookieHeader),
    serverFetch<UserProfile>("/api/identity/profile", cookieHeader),
  ]);

  if (!household) {
    return <div className="p-16 text-red text-base">Household not found.</div>;
  }

  const members = (Array.isArray(membersRaw) ? membersRaw : []) as MembershipResponse[];
  const myUserId = me?.id ?? "";
  const myMembership = members.find((m) => m.userId.toLowerCase() === myUserId.toLowerCase());
  const isOwner = myUserId.toLowerCase() === household.ownerId.toLowerCase();
  const isPrivileged = isOwner || myMembership?.role === "Admin";

  return (
    <div className="page-enter max-w-[560px] mx-auto flex flex-col gap-12" >
      <div>
        <Link href={`/bills/${params.id}`} className="text-ink-3 text-base no-underline">
          ← Back to {household.name}
        </Link>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink mt-3">
          Settings
        </h1>
      </div>

      {isPrivileged && <SettingsForm household={household} />}

      <MemberActions
        householdId={params.id}
        members={members}
        myUserId={myUserId}
        isOwner={isOwner}
        isPrivileged={isPrivileged}
      />

      {isPrivileged && <InviteSection householdId={params.id} />}

      {isOwner && <DangerZone householdId={params.id} members={members} />}
    </div>
  );
}
