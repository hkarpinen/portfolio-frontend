import { AppShellServer } from "@/components/layout/app-shell-server";
import { BillsSubNav } from "./bills-sub-nav";
import { requireUser } from "@/lib/auth/session";

/**
 * Bills is end-to-end authenticated. Guard at the route group, not in
 * middleware. `requireUser()` redirects anonymous visitors to /login.
 */
export default async function BillsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer subnav={<BillsSubNav />}>
      {children}
    </AppShellServer>
  );
}
