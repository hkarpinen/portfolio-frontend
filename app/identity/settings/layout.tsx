import type { Metadata } from "next";
import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";
import { SettingsNav } from "./settings-nav";
import { SettingsPageHead } from "./settings-page-head";

/** Per-user settings pages — never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Settings layout — Terminus prototype flow: route-aware `.page-head`
 * (<SettingsPageHead />) → horizontal `.tabs` strip (<SettingsNav />) →
 * content. No masthead band, no left rail.
 */
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer>
      <div className="ed-settings-page">
        <SettingsPageHead />
        <SettingsNav />
        <div className="ed-settings-content">{children}</div>
      </div>
    </AppShellServer>
  );
}
