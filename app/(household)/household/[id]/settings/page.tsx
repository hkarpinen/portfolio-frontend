import Link from "next/link";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/server-api-client";
import type { Household } from "@/types/household";
import type { MembershipResponse } from "@/types/membership";
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
    return <div className="p-16 text-base text-red">Household not found.</div>;
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
      <Link
        href={`/household/${params.id}`}
        className="ed-label-muted self-start no-underline hover:text-red"
      >
        ← Back to household
      </Link>

      <EditorialPageHead
        kicker="Household · Settings"
        title={`Settings for <em>${safeName}</em>`}
        deck="General, members and roles, invite codes, and the danger zone."
      />

      {/* 2-column settings layout: left nav + right content */}
      <div className="flex items-start gap-10">
        {/* Left sidebar nav */}
        <nav
          aria-label="Settings sections"
          className="sticky top-8 hidden w-[180px] shrink-0 flex-col gap-1 sm:flex"
        >
          {NAV_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#settings-${s.id}`}
              className="border-l-2 border-transparent py-2 pl-3 pr-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 no-underline transition-colors hover:border-red hover:text-red"
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Right content pane */}
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          {/* General */}
          <section id="settings-general" className="flex scroll-mt-8 flex-col gap-4">
            <h2 className="ed-h3">General</h2>
            {isPrivileged && <SettingsForm household={household} />}
            {!isPrivileged && (
              <p className="ed-label-muted">
                Only admins and the owner can edit household settings.
              </p>
            )}
          </section>

          {/* Members & roles */}
          <section id="settings-members" className="flex scroll-mt-8 flex-col gap-4">
            <h2 className="ed-h3">
              Members &amp; <em>roles</em>
            </h2>
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
            <section id="settings-invites" className="flex scroll-mt-8 flex-col gap-4">
              <h2 className="ed-h3">
                Invite <em>codes</em>
              </h2>
              <InviteSection householdId={params.id} />
            </section>
          )}

          {/* Danger zone */}
          <section id="settings-danger" className="flex scroll-mt-8 flex-col gap-4">
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
