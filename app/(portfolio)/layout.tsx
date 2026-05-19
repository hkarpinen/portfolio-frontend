import { AppShellServer } from "@/components/layout/app-shell-server";

/**
 * The portfolio group is public. The admin sub-tree adds
 * `requireRole("Admin")` at its own layout (no double-fetch — getSession
 * is request-scoped via React.cache).
 */
export default async function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <AppShellServer>{children}</AppShellServer>;
}
