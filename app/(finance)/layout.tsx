import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";
import { RepoFooter } from "@/components/layout/repo-footer";
import { FinanceMasthead } from "./finance-masthead";

/**
 * Finance route group layout.
 *
 * Renders the editorial <FinanceMasthead /> into <AppShellServer>'s
 * `topBand` slot so its rule pair spans the full scroll-area width (same
 * pattern as the breadcrumb band). Pages inside this group render only
 * their editorial page head + content — no masthead per page.
 */
export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer topBand={<FinanceMasthead />}>
      {children}
      <RepoFooter repo="portfolio-finance" label="portfolio-finance" />
    </AppShellServer>
  );
}
