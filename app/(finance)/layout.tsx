import type { Metadata } from "next";
import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";
import { RepoFooter } from "@/components/layout/repo-footer";

/** Authenticated app — contains user financial data. Never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Finance route group layout.
 *
 * No masthead band — each finance page renders the prototype flow itself:
 * `.page-head` → `<FinanceTabs />` (`.tabs` strip) → content.
 */
export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer>
      {children}
      <RepoFooter repo="portfolio-finance" label="portfolio-finance" />
    </AppShellServer>
  );
}
