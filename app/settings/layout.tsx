import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";

/**
 * The entire `/settings/*` tree is authenticated. The shell is rendered here
 * AFTER `requireUser()` so anonymous visitors are redirected to /login
 * BEFORE any UI is composed.
 */
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <AppShellServer>{children}</AppShellServer>;
}
