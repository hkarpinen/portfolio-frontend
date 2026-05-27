import { AppShellServer } from "@/components/layout/app-shell-server";
import { requireUser } from "@/lib/auth/session";
import { SettingsNav } from "./settings-nav";
import { SettingsMasthead } from "./settings-masthead";
import { SettingsPageHead } from "./settings-page-head";

/**
 * Settings layout — editorialized.
 *
 * The masthead band (`topBand`) replaces the old `ed-settings-head` block;
 * the route-aware <SettingsPageHead /> renders inside the page so each
 * sub-page gets its own kicker, headline, and deck without a per-page
 * code change. The left-rail <SettingsNav /> survives because the 6+
 * settings sections don't fit cleanly as masthead tabs.
 */
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <AppShellServer topBand={<SettingsMasthead />}>
      <div className="ed-settings-page">
        <SettingsPageHead />
        <div className="ed-settings-body">
          <SettingsNav />
          <div className="ed-settings-content">
            {children}
          </div>
        </div>
      </div>
    </AppShellServer>
  );
}
