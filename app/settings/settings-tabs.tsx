"use client";

export const TABS = ["Profile", "Security", "Notifications", "Appearance", "Connections"] as const;
export type SettingsTab = (typeof TABS)[number];

export const TAB_HREFS: Record<SettingsTab, string> = {
  Profile:       "/settings/profile",
  Security:      "/settings/security",
  Notifications: "/settings/notifications",
  Appearance:    "/settings/appearance",
  Connections:   "/settings/connections",
};

export function SettingsTabs({ active }: { active: SettingsTab }) {
  return (
    <div className="mb-7 flex gap-2 border-ink-b">
      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <a
            key={tab}
            href={TAB_HREFS[tab]}
            className={`py-5 px-8 text-md mb-[-1px] no-underline transition-colors duration-150 ${isActive ? "font-semibold text-red border-b-[3px] border-red" : "font-normal text-ink-3 border-b-2 border-transparent"}`}
          >
            {tab}
          </a>
        );
      })}
    </div>
  );
}
