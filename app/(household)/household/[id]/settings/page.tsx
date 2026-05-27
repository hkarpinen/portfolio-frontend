import Link from "next/link";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/server-api-client";
import type { Household, MembershipResponse } from "@/types/finance";
import type { Me as UserProfile } from "@/types/identity";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { SettingsForm } from "./settings-form";
import { InviteSection } from "./invite-section";
import { MemberActions } from "./member-actions";
import { DangerZone } from "./danger-zone";
import { LeaveHousehold } from "./leave-household";

interface Props {
  params: { id: string };
}

const NAV_SECTIONS = [
  { id: "general", label: "General" },
  { id: "members", label: "Members & roles" },
  { id: "invites", label: "Invite codes" },
  { id: "danger", label: "Danger zone" },
];

export default async function HouseholdSettingsPage({ params }: Props) {
  const cookieHeader = cookies().toString();
  const [household, membersRaw, me] = await Promise.all([
    serverFetch<Household>(`/api/households/${params.id}`, cookieHeader),
    serverFetch<MembershipResponse[]>(`/api/households/${params.id}/members`, cookieHeader),
    serverFetch<UserProfile>("/api/identity/me", cookieHeader),
  ]);

  if (!household) {
    return <div className="p-16 text-red text-base">Household not found.</div>;
  }

  const members = (Array.isArray(membersRaw) ? membersRaw : []) as MembershipResponse[];
  const myUserId = me?.id ?? "";
  const myMembership = members.find((m) => m.userId.toLowerCase() === myUserId.toLowerCase());
  const isOwner = myUserId.toLowerCase() === household.ownerId.toLowerCase();
  const isPrivileged = isOwner || myMembership?.role === "Admin";
  const canLeave = !isOwner && !!myMembership;

  // Strip any stray HTML before interpolating the household name into the
  // headline (which uses dangerouslySetInnerHTML for the red-italic accent).
  const safeName = household.name.replace(/[<>&]/g, "");

  return (
    <div className="page-enter flex flex-col gap-6">
      <Link href={`/household/${params.id}`} className="ed-label-muted no-underline hover:text-red self-start">← Back to household</Link>

      <EditorialPageHead
        kicker="Household · Settings"
        title={`Settings for <em>${safeName}</em>`}
        deck="General, members and roles, invite codes, and the danger zone."
      />

      {/* 2-column settings layout: left nav + right content */}
      <div className="flex gap-10 items-start">
        {/* Left sidebar nav */}
        <nav
          aria-label="Settings sections"
          className="shrink-0 hidden sm:flex flex-col gap-1 w-[180px] sticky top-8"
        >
          {NAV_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#settings-${s.id}`}
              className="font-mono text-[0.72rem] tracking-[0.1em] uppercase text-ink-3 hover:text-red no-underline py-2 pr-3 pl-3 border-l-2 border-transparent hover:border-red transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Right content pane */}
        <div className="flex-1 min-w-0 flex flex-col gap-10">
          {/* General */}
          <section id="settings-general" className="flex flex-col gap-4 scroll-mt-8">
            <h2 className="ed-h3">General</h2>
            {isPrivileged && <SettingsForm household={household} />}
            {!isPrivileged && (
              <p className="ed-label-muted">Only admins and the owner can edit household settings.</p>
            )}
          </section>

          {/* Members & roles */}
          <section id="settings-members" className="flex flex-col gap-4 scroll-mt-8">
            <h2 className="ed-h3">Members &amp; <em>roles</em></h2>
            <MemberActions
              householdId={params.id}
              members={members}
              myUserId={myUserId}
              isOwner={isOwner}
              isPrivileged={isPrivileged}
            />
          </section>

          {/* Invite codes */}
          {isPrivileged && (
            <section id="settings-invites" className="flex flex-col gap-4 scroll-mt-8">
              <h2 className="ed-h3">Invite <em>codes</em></h2>
              <InviteSection householdId={params.id} />
            </section>
          )}

          {/* Danger zone */}
          <section id="settings-danger" className="flex flex-col gap-4 scroll-mt-8">
            <h2 className="ed-h3 text-red">Danger zone</h2>
            {canLeave && myMembership && (
              <LeaveHousehold householdId={params.id} membershipId={myMembership.membershipId} />
            )}
            {isOwner && <DangerZone householdId={params.id} members={members} />}
          </section>
        </div>
      </div>
    </div>
  );
}
