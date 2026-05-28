"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Expenses", href: "/expenses" },
  { label: "Income", href: "/income" },
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
        const active = pathname.startsWith(tab.href);
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
