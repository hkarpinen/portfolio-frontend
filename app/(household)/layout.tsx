import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";

/**
 * Household billing — authenticated. Expenses and Income live in the
 * (finance) route group; this group is households-only.
 */
export default async function BillsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer>
      {children}
    </AppShellServer>
  );
}
