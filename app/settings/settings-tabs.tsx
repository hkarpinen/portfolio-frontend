"use client";

export const TABS = ["Profile", "Security", "Notifications", "Connections"] as const;
export type SettingsTab = (typeof TABS)[number];

export const TAB_HREFS: Record<SettingsTab, string> = {
  Profile:       "/settings/profile",
  Security:      "/settings/security",
  Notifications: "/settings/notifications",
  Connections:   "/settings/connections",
};

export function SettingsTabs({ active }: { active: SettingsTab }) {
  return (
    <div className="mb-[28px] flex gap-2" style={{ borderBottom: "1.5px solid var(--ink)" }}>
      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <a
            key={tab}
            href={TAB_HREFS[tab]}
            className="py-5 px-8 text-md mb-[-1px] no-underline"
            style={{ fontWeight: isActive ? 600 : 400, color: isActive ? "var(--red)" : "var(--ink-3)", borderBottom: isActive ? "3px solid var(--red)" : "2px solid transparent", transition: "color 150ms" }}
          >
            {tab}
          </a>
        );
      })}
    </div>
  );
}
