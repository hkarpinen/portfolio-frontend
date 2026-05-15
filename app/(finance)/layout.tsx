import { AppShellServer } from "@/components/layout/app-shell-server";
import { PersonalFinanceSubNav } from "./personal-finance-sub-nav";
import { requireUser } from "@/lib/auth/session";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer subnav={<PersonalFinanceSubNav />}>
      {children}
    </AppShellServer>
  );
}
