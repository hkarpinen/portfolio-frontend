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
 * <FinanceTabs> — the Terminus `.tabs` strip for the finance desk.
 *
 * Renders inside the page content, right after the `.page-head` (matching the
 * prototype's `page-head → tabs → content` flow) rather than in a separate
 * masthead band. Each finance page drops this in below its head.
 */
export function FinanceTabs() {
  const pathname = usePathname();
  return (
    <nav className="tabs" role="tablist" aria-label="Finance sections">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
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
