"use client";

export const TABS = ["Profile", "Security", "Notifications", "Appearance", "Connections"] as const;
export type SettingsTab = (typeof TABS)[number];

export const TAB_HREFS: Record<SettingsTab, string> = {
  Profile: "/settings/profile",
  Security: "/settings/security",
  Notifications: "/settings/notifications",
  Appearance: "/settings/appearance",
  Connections: "/settings/connections",
};

export function SettingsTabs({ active }: { active: SettingsTab }) {
  return (
    <div className="border-ink-b mb-7 flex gap-2">
      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <a
            key={tab}
            href={TAB_HREFS[tab]}
            className={`mb-[-1px] px-8 py-5 text-md no-underline transition-colors duration-150 ${isActive ? "border-b-[3px] border-red font-semibold text-red" : "border-b-2 border-transparent font-normal text-ink-3"}`}
          >
            {tab}
          </a>
        );
      })}
    </div>
  );
}
