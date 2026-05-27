"use client";

import { usePathname } from "next/navigation";
import { MastheadRow } from "@/components/editorial/masthead-row";
import { Btn } from "@/components/editorial/button";
import { Icon } from "@/components/editorial/icon";
import { PersonalFinanceMastheadTabs } from "./personal-finance-sub-nav";

/**
 * <FinanceMasthead> — layout-level masthead for the finance route group.
 *
 * Rendered by `(finance)/layout.tsx` into <AppShellServer>'s `topBand` slot
 * so its rule pair spans the full scroll area (matching the breadcrumb
 * band pattern) — pages themselves don't render a masthead.
 *
 * The desk label, sub-nav, and action button are all derived from the
 * pathname so the per-route copy stays out of the page files.
 */

interface DeskMeta {
  desk: string;
  actionHref: string;
  actionLabel: string;
}

function deskFor(pathname: string): DeskMeta {
  if (pathname.startsWith("/income")) {
    return {
      desk: "Income Desk",
      actionHref: "/income/new",
      actionLabel: "Add income source",
    };
  }
  // Default to the expenses desk for any /expenses/* path.
  return {
    desk: "Personal Finance Desk",
    actionHref: "/expenses/new",
    actionLabel: "Add expense",
  };
}

export function FinanceMasthead() {
  const pathname = usePathname() || "/expenses";
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
