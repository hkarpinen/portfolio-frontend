"use client";

const PROFILE_TABS = ["Account", "Forum Profile"] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

const PROFILE_TAB_HREFS: Record<ProfileTab, string> = {
  Account: "/settings/profile/account",
  "Forum Profile": "/settings/profile/forum",
};

export function ProfileTabs({ active }: { active: ProfileTab }) {
  return (
    <div className="mb-[28px] flex gap-2" style={{ borderBottom: "1.5px solid var(--ink)" }}>
      {PROFILE_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <a
            key={tab}
            href={PROFILE_TAB_HREFS[tab]}
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
