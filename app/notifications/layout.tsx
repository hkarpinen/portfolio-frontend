import type { Metadata } from "next";
import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";
import { RepoFooter } from "@/components/layout/repo-footer";
import { NotificationsMasthead } from "./notifications-masthead";

/** Per-user notifications inbox — never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function NotificationsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer topBand={<NotificationsMasthead />}>
      {children}
      <RepoFooter repo="portfolio-notifications" label="portfolio-notifications" />
    </AppShellServer>
  );
}
