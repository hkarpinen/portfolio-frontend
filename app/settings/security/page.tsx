"use client";

import { EmailSection } from "./email-section";
import { PasswordSection } from "./password-section";
import { TwoFactorSection } from "./two-factor-section";
import { DangerZoneSection } from "./danger-zone-section";

export default function SecuritySettingsPage() {
  return (
    <div className="page-enter flex flex-col gap-8">
      <EmailSection />
      <PasswordSection />
      <TwoFactorSection />
      <DangerZoneSection />
    </div>
  );
}
