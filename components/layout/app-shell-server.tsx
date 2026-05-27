import { getSession } from "@/lib/auth/session";
import { AppShell } from "./app-shell";

/**
 * Server-rendered application shell.
 *
 * Resolves the current session via the canonical `getSession()` (which calls
 * the backend `/api/identity/me`). No JWT decoding, no fallbacks: if the
 * backend says we're anonymous, we're anonymous. The shell renders a public
 * appearance in that case.
 *
 * Real authorization lives in route-group layouts (`requireUser`,
 * `requireRole`, membership checks); this component is shell + UX only.
 *
 * `getSession()` is wrapped in React.cache, so a layout calling
 * `requireUser()` followed by this shell calling `getSession()` results in
 * exactly one upstream `/me` call per request.
 */
export async function AppShellServer({
  children,
  subnav,
  topBand,
}: {
  children: React.ReactNode;
  subnav?: React.ReactNode;
  /**
   * Optional full-width page band rendered between the breadcrumb and the
   * page content — same horizontal-rule treatment as <PageBreadcrumbs>. Used
   * by editorial pages to render their <MastheadRow> as a band whose rules
   * span the scroll area, not just the content column.
   */
  topBand?: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AppShell
      displayName={session?.displayName ?? null}
      avatarUrl={session?.avatarUrl ?? null}
      role={session?.role ?? null}
      subnav={subnav}
      topBand={topBand}
    >
      {children}
    </AppShell>
  );
}
