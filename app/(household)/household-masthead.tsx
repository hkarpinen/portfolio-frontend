"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { MastheadRow } from "@/components/editorial/masthead-row";
import { Btn } from "@/components/editorial/button";
import { Icon } from "@/components/editorial/icon";
import { useHousehold } from "@/hooks/use-household";

/**
 * <HouseholdMasthead> — layout-level masthead for the (household) route
 * group. Rendered into <AppShellServer>'s `topBand` slot so its rule pair
 * spans the full scroll area (matching the breadcrumb pattern).
 *
 * Three modes, picked from the pathname:
 *   1. List view (`/household`, `/dashboard`)  → desk "Household Desk", no tabs
 *   2. New / Join (`/household/new`, `/household/join`) → desk "Household Desk", no tabs
 *   3. Detail (`/household/[id]/...`)          → desk = household name,
 *                                                 tabs for sub-pages,
 *                                                 action varies per tab
 */

type HouseholdTab = "expenses" | "contributions" | "calendar" | "chores" | "settings";

interface TabDef {
  key: HouseholdTab;
  label: string;
  href: (id: string) => string;
  match: (pathname: string, id: string) => boolean;
}

const HOUSEHOLD_TABS: TabDef[] = [
  {
    key: "expenses",
    label: "Expenses",
    href: (id) => `/household/${id}`,
    // /household/[id] AND /household/[id]/expenses/* both belong to the
    // expenses tab — the index page already lists shared expenses.
    match: (p, id) => p === `/household/${id}` || p.startsWith(`/household/${id}/expenses`),
  },
  {
    key: "contributions", label: "Contributions",
    href: (id) => `/household/${id}/contributions`,
    match: (p, id) => p.startsWith(`/household/${id}/contributions`),
  },
  {
    key: "calendar", label: "Calendar",
    href: (id) => `/household/${id}/calendar`,
    match: (p, id) => p.startsWith(`/household/${id}/calendar`),
  },
  {
    key: "chores", label: "Chores",
    href: (id) => `/household/${id}/chores`,
    match: (p, id) => p.startsWith(`/household/${id}/chores`),
  },
  {
    key: "settings", label: "Settings",
    href: (id) => `/household/${id}/settings`,
    match: (p, id) => p.startsWith(`/household/${id}/settings`),
  },
];

function HouseholdSubNav({ householdId, pathname }: { householdId: string; pathname: string }) {
  return (
    <span role="tablist" aria-label="Household sections">
      {HOUSEHOLD_TABS.map((t) => {
        const active = t.match(pathname, householdId);
        return (
          <Link
            key={t.key}
            href={t.href(householdId)}
            role="tab"
            aria-current={active ? "page" : undefined}
            className="ed-masthead-tab"
          >
            {t.label}
          </Link>
        );
      })}
    </span>
  );
}

/** Action button derived from the active tab. Some tabs have no action. */
function actionForTab(householdId: string, activeTab: HouseholdTab | null): React.ReactNode {
  if (!activeTab) return null;
  switch (activeTab) {
    case "expenses":
      return (
        <Btn href={`/household/${householdId}/expenses/new`} variant="primary" size="sm"
             iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}>
          Add expense
        </Btn>
      );
    case "calendar":
      return (
        <Btn href={`/household/${householdId}/calendar/new`} variant="primary" size="sm"
             iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}>
          Add event
        </Btn>
      );
    case "chores":
      return (
        <Btn href={`/household/${householdId}/chores/new`} variant="primary" size="sm"
             iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}>
          Add chore
        </Btn>
      );
    // contributions + settings have no top-of-page CTA
    default:
      return null;
  }
}

/** Live-fetched household name for the desk label. Falls back to a static
 *  label while the request is in flight. */
function HouseholdDetailMasthead({ householdId, pathname }: { householdId: string; pathname: string }) {
  const { data: household } = useHousehold(householdId);
  const desk = household?.name ? `Household · ${household.name}` : "Household Desk";
  const activeTab = HOUSEHOLD_TABS.find((t) => t.match(pathname, householdId))?.key ?? null;
  return (
    <MastheadRow
      desk={desk}
      subNav={<HouseholdSubNav householdId={householdId} pathname={pathname} />}
      action={actionForTab(householdId, activeTab)}
    />
  );
}

export function HouseholdMasthead() {
  const pathname = usePathname() || "/household";
  const params = useParams<{ id?: string }>();
  // `useParams()` returns the dynamic segment of the matched route. For
  // /household/[id]/* it returns { id: "..." }; for /household it returns
  // undefined for id, so this branches cleanly.
  const householdId = params?.id;

  if (householdId) {
    return <HouseholdDetailMasthead householdId={householdId} pathname={pathname} />;
  }

  // List + new + join + dashboard — no sub-nav, no action (the page itself
  // surfaces the "+ New household" CTA in its hero, since it's a primary
  // landing-pad action rather than a per-tab utility).
  return <MastheadRow desk="Household Desk" />;
}
