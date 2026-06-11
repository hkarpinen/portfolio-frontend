"use client";

import { Btn, Icon, MastheadRow } from "@/components/editorial";
import { usePathname } from "next/navigation";

import { PersonalFinanceMastheadTabs } from "./personal-finance-sub-nav";

/**
 * <FinanceMasthead> — layout-level masthead for the Money route group.
 *
 * Rendered by `(finance)/layout.tsx` into <AppShellServer>'s `topBand` slot so its rule pair spans
 * the full scroll area — pages don't render a masthead. Desk/sub-nav/action derive from the path.
 *
 * Money is the personal, cross-household desk (Overview/Expenses/Income). A single household's money
 * lives inside the household at `/household/[id]` — not here — so this masthead is personal-only.
 */

interface DeskMeta {
  desk: string;
  actionHref: string;
  actionLabel: string;
}

function deskFor(pathname: string): DeskMeta {
  if (pathname.startsWith("/finance/income")) {
    return { desk: "Income Desk", actionHref: "/finance/income/new", actionLabel: "Add income source" };
  }
  return { desk: "Money Desk", actionHref: "/finance/expenses/new", actionLabel: "Add expense" };
}

export function FinanceMasthead() {
  const pathname = usePathname() || "/finance/overview";
  const { desk, actionHref, actionLabel } = deskFor(pathname);
  return (
    <MastheadRow
      desk={desk}
      subNav={<PersonalFinanceMastheadTabs />}
      action={
        <Btn
          href={actionHref}
          variant="primary"
          size="sm"
          iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}
        >
          {actionLabel}
        </Btn>
      }
    />
  );
}
