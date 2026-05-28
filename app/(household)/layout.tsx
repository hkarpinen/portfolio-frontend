import type { Metadata } from "next";
import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";
import { RepoFooter } from "@/components/layout/repo-footer";
import { HouseholdMasthead } from "./household-masthead";

/** Authenticated app — household membership and per-user data. Never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Household billing — authenticated. Expenses and Income live in the
 * (finance) route group; this group is households-only.
 *
 * The editorial <HouseholdMasthead /> is wired into <AppShellServer>'s
 * `topBand` slot so its rule pair spans the full scroll-area width (same
 * pattern as the breadcrumb band). Per-page mastheads are no longer
 * needed — the masthead introspects the route.
 */
export default async function BillsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer topBand={<HouseholdMasthead />}>
      {children}
      <RepoFooter repo="portfolio-household" label="portfolio-household" />
    </AppShellServer>
  );
}
