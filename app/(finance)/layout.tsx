import { AppShellServer } from "@/components/layout/app-shell-server";
import { PersonalFinanceSubNav } from "./personal-finance-sub-nav";
import { requireUser } from "@/lib/auth/session";
import { RepoFooter } from "@/components/layout/repo-footer";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer subnav={<PersonalFinanceSubNav />}>
      {children}
      <RepoFooter repo="portfolio-finance" label="portfolio-finance" />
    </AppShellServer>
  );
}
