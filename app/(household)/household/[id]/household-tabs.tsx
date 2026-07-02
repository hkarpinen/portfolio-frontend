"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

type HouseholdTab = "money" | "calendar" | "chores" | "settings";

const TABS: {
  key: HouseholdTab;
  label: string;
  href: (id: string) => string;
  match: (p: string, id: string) => boolean;
}[] = [
  {
    key: "money",
    label: "Money",
    href: (id) => `/household/${id}`,
    // The Money landing carries the balance, settle-up and shared-expense list;
    // the expense forms (/expenses/*) and the ledger drill-in (/ledger/*) are
    // all part of the household's money.
    match: (p, id) =>
      p === `/household/${id}` ||
      p.startsWith(`/household/${id}/expenses`) ||
      p.startsWith(`/household/${id}/ledger`),
  },
  {
    key: "calendar",
    label: "Calendar",
    href: (id) => `/household/${id}/calendar`,
    match: (p, id) => p.startsWith(`/household/${id}/calendar`),
  },
  {
    key: "chores",
    label: "Chores",
    href: (id) => `/household/${id}/chores`,
    match: (p, id) => p.startsWith(`/household/${id}/chores`),
  },
  {
    key: "settings",
    label: "Settings",
    href: (id) => `/household/${id}/settings`,
    match: (p, id) => p.startsWith(`/household/${id}/settings`),
  },
];

/**
 * <HouseholdTabs> — Terminus `.tabs` strip for a household detail.
 *
 * Renders inside the page content, right after the `.page-head` (the prototype's
 * `page-head → tabs → content` flow) rather than in a separate masthead band.
 * Reads the household id from the route params, so each detail sub-page just
 * drops `<HouseholdTabs />` below its head.
 */
export function HouseholdTabs() {
  const pathname = usePathname() || "";
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  if (!id) return null;
  return (
    <nav className="tabs" role="tablist" aria-label="Household sections">
      {TABS.map((tab) => {
        const active = tab.match(pathname, id);
        return (
          <Link
            key={tab.key}
            href={tab.href(id)}
            role="tab"
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
