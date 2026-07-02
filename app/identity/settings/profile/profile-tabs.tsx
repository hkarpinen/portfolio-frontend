"use client";

import Link from "next/link";

const PROFILE_TABS = ["Account", "Forum Profile"] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

const PROFILE_TAB_HREFS: Record<ProfileTab, string> = {
  Account: "/identity/settings/profile/account",
  "Forum Profile": "/identity/settings/profile/forum",
};

export function ProfileTabs({ active }: { active: ProfileTab }) {
  return (
    <nav aria-label="Profile sections" className="tabs">
      {PROFILE_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <Link
            key={tab}
            href={PROFILE_TAB_HREFS[tab]}
            aria-current={isActive ? "page" : undefined}
          >
            {tab}
          </Link>
        );
      })}
    </nav>
  );
}
