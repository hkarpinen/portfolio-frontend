"use client";

import Link from "next/link";
import { useHousehold, useHouseholdMembers } from "@/hooks/use-household";
import { HouseholdBalanceBadge } from "@/components/finance/household-balance-badge";
import { getInitials, memberDisplayName, pluralize } from "@/lib/utils";

type Tab = "expenses" | "contributions" | "calendar" | "chores";

const TAB_DEFS: { key: Tab; label: string; href: (id: string) => string }[] = [
  { key: "expenses", label: "Expenses", href: (id) => `/household/${id}` },
  { key: "contributions", label: "Contributions", href: (id) => `/household/${id}/contributions` },
  { key: "calendar", label: "Calendar", href: (id) => `/household/${id}/calendar` },
  { key: "chores", label: "Chores", href: (id) => `/household/${id}/chores` },
];

const MAX_VISIBLE_AVATARS = 6;

function MemberAvatarChips({
  members,
}: {
  members: { membershipId: string; displayName?: string; userId: string }[];
}) {
  const visible = members.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = members.length - MAX_VISIBLE_AVATARS;

  return (
    <div
      className="mt-2 flex items-center gap-1"
      role="list"
      aria-label={`${members.length} household ${pluralize("member", members.length)}`}
    >
      {visible.map((m) => (
        <span
          key={m.membershipId}
          role="listitem"
          aria-label={memberDisplayName(m)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-2 font-mono text-[0.6rem] uppercase tracking-[0.04em] text-ink-3"
          style={{ border: "1px solid var(--ink-3)" }}
        >
          <span aria-hidden>{getInitials(m.displayName)}</span>
        </span>
      ))}
      {overflow > 0 && (
        <span
          role="listitem"
          aria-label={`${overflow} more ${pluralize("member", overflow)} not shown`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-2 font-mono text-[0.6rem] tracking-[0.04em] text-ink-3"
          style={{ border: "1px solid var(--ink-3)" }}
        >
          <span aria-hidden>+{overflow}</span>
        </span>
      )}
    </div>
  );
}

/**
 * Shared header + section tabs for household sub-pages (contributions,
 * calendar, chores). The household name is rendered as plain text — never
 * via dangerouslySetInnerHTML — since it is user-controlled.
 *
 * SYS-1 (handoff8): includes member-avatar chips and a debt/settlement badge
 * driven by `useHouseholdBalances` (see HouseholdBalanceBadge).
 */
export function HouseholdChrome({
  householdId,
  activeTab,
  action,
}: {
  householdId: string;
  activeTab: Tab;
  action?: React.ReactNode;
}) {
  const { data: household } = useHousehold(householdId);
  const { data: membersRaw } = useHouseholdMembers(householdId);
  const members = membersRaw ?? [];

  return (
    <div className="flex flex-col gap-8">
      <Link href="/household" className="ed-label-muted no-underline hover:text-red">
        ← All households
      </Link>

      <header className="ed-section-head">
        <p className="ed-kicker">Household</p>
        <div className="ed-section-head-row">
          <div className="min-w-0 flex-1">
            <h1 className="ed-h1">{household?.name ?? "Household"}</h1>
            {household && <p className="ed-label-muted mt-1">{household.currencyCode}</p>}
            {members.length > 0 && (
              <MemberAvatarChips
                members={
                  members as { membershipId: string; displayName?: string; userId: string }[]
                }
              />
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <HouseholdBalanceBadge householdId={householdId} variant="header" />
            {action && <div className="flex shrink-0 flex-wrap items-center gap-3">{action}</div>}
          </div>
        </div>
      </header>

      <nav aria-label="Household sections" className="ed-tabs-list">
        {TAB_DEFS.map((t) => (
          <Link
            key={t.key}
            href={t.href(householdId)}
            className="ed-tab"
            aria-current={t.key === activeTab ? "page" : undefined}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
