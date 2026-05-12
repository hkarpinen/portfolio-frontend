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
    serverFetch<Household>(`/api/finance/households/${params.id}`, cookieHeader),
    serverFetch<MembershipResponse[]>(`/api/finance/households/${params.id}/members`, cookieHeader),
    serverFetch<UserProfile>("/api/identity/profile", cookieHeader),
  ]);

  if (!household) {
    return <div style={{ padding: "32px", color: "var(--danger)", fontSize: "13px" }}>Household not found.</div>;
  }

  const members = (Array.isArray(membersRaw) ? membersRaw : []) as MembershipResponse[];
  const myUserId = me?.id ?? "";
  const myMembership = members.find((m) => m.userId.toLowerCase() === myUserId.toLowerCase());
  const isOwner = myUserId.toLowerCase() === household.ownerId.toLowerCase();
  const isPrivileged = isOwner || myMembership?.role === "Admin";

  return (
    <div className="page-enter" style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <Link href={`/households/${params.id}`} style={{ color: "var(--text-3)", fontSize: "12px", textDecoration: "none" }}>
          ← Back to {household.name}
        </Link>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", marginTop: "6px" }}>
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
