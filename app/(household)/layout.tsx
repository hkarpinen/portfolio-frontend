import type { Metadata } from "next";
import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";
import { RepoFooter } from "@/components/layout/repo-footer";

/** Authenticated app — household membership and per-user data. Never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Household billing — authenticated. Expenses and Income live in the
 * (finance) route group; this group is households-only.
 *
 * No masthead band — household detail sub-pages render the prototype flow
 * themselves: `.page-head` → `<HouseholdTabs />` (`.tabs` strip) → content.
 */
export default async function BillsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer>
      {children}
      <RepoFooter repo="portfolio-household" label="portfolio-household" />
    </AppShellServer>
  );
}
