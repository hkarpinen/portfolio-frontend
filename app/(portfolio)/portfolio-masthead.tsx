"use client";

import { MastheadRow } from "@/components/editorial";
import { usePathname } from "next/navigation";

/**
 * <PortfolioMasthead> — layout-level masthead for the (portfolio) group.
 * Picks the desk label per route. Public — no action buttons.
 */

function deskFor(pathname: string): string {
  if (pathname.startsWith("/admin")) return "Admin Desk";
  if (pathname.startsWith("/contact")) return "Contact Desk";
  if (pathname.startsWith("/about")) return "About Desk";
  return "Portfolio Desk";
}

export function PortfolioMasthead() {
  const pathname = usePathname() || "/";
  return <MastheadRow desk={deskFor(pathname)} />;
}
