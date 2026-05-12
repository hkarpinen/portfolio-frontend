import { AppShellServer } from "@/components/layout/app-shell-server";
import { FinanceSubNav } from "./finance-sub-nav";
import { requireUser } from "@/lib/auth/session";

/**
 * Finance is end-to-end authenticated. Guard at the route group, not in
 * middleware. `requireUser()` redirects anonymous visitors to /login.
 */
export default async function BillsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer subnav={<FinanceSubNav />}>
      {children}
    </AppShellServer>
  );
}
