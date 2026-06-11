"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  // "Money" is the merged home (where you stand + net positions + bills). It owns the legacy
  // /finance/expenses subtree too, so the add-expense form (/finance/expenses/new) keeps it active.
  {
    label: "Money",
    href: "/finance/overview",
    match: (p: string) => p.startsWith("/finance/overview") || p.startsWith("/finance/expenses"),
  },
  { label: "Income", href: "/finance/income", match: (p: string) => p.startsWith("/finance/income") },
] as const;

/**
 * <PersonalFinanceMastheadTabs> — compact inline variant for the masthead.
 *
 * Renders the same tabs styled to fit inside the masthead row: mono kicker
 * sizing, hard-stamp active state (paper-on-ink), tight padding. Use as
 * <MastheadRow subNav={<PersonalFinanceMastheadTabs />} />.
 */
export function PersonalFinanceMastheadTabs() {
  const pathname = usePathname();
  return (
    <span role="tablist" aria-label="Personal finance sub-desks">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-current={active ? "page" : undefined}
            className="ed-masthead-tab"
          >
            {tab.label}
          </Link>
        );
      })}
    </span>
  );
}
