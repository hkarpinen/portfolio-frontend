"use client";

import { SettingsTabs } from "../settings-tabs";
import { PasswordSection } from "./password-section";
import { TwoFactorSection } from "./two-factor-section";
import { ActiveSessionsSection } from "./active-sessions-section";
import { DangerZoneSection } from "./danger-zone-section";

export default function SecuritySettingsPage() {
  return (
    <div className="page-enter max-w-[620px] mx-auto py-16 px-12">
      <div className="mb-[28px]">
        <h1 className="font-serif text-4xl leading-none tracking-snug font-bold text-ink">Settings</h1>
        <p className="text-base text-ink-3 mt-2">Manage your account, security, and preferences</p>
      </div>

      <SettingsTabs active="Security" />

      <div className="flex flex-col gap-8">
        <PasswordSection />
        <TwoFactorSection />
        <ActiveSessionsSection />
        <DangerZoneSection />
      </div>
    </div>
  );
}
