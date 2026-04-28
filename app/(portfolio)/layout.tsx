import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";

/**
 * The portfolio group is authenticated. The admin sub-tree adds
 * `requireRole("Admin")` at its own layout (no double-fetch — getSession
 * is request-scoped via React.cache).
 */
export default async function PortfolioLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <AppShellServer>{children}</AppShellServer>;
}
