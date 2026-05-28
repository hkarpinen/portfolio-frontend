"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Expenses", href: "/expenses" },
  { label: "Income", href: "/income" },
] as const;

/**
 * <PersonalFinanceSubNav> — standalone tab strip.
 *
 * Used on legacy pages that still render their sub-nav as its own strip
 * under the page header. Editorial finance pages instead pass
 * <PersonalFinanceMastheadTabs /> into <MastheadRow>'s `subNav` slot so
 * the tabs ride the masthead instead of occupying their own band.
 */
export function PersonalFinanceSubNav() {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Personal finance"
      className="ed-tabs-list mx-auto mb-8 w-full max-w-[var(--content-max)]"
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-current={active ? "page" : undefined}
            className="ed-tab"
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

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
