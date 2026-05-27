"use client";

import Link from "next/link";

const PROFILE_TABS = ["Account", "Forum Profile"] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

const PROFILE_TAB_HREFS: Record<ProfileTab, string> = {
  Account: "/settings/profile/account",
  "Forum Profile": "/settings/profile/forum",
};

export function ProfileTabs({ active }: { active: ProfileTab }) {
  return (
    <nav aria-label="Profile sections" className="mb-[28px] flex gap-2 border-ink-b">
      {PROFILE_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <Link
            key={tab}
            href={PROFILE_TAB_HREFS[tab]}
            aria-current={isActive ? "page" : undefined}
            className={`py-5 px-8 text-md mb-[-1px] no-underline transition-colors duration-150 ${isActive ? "font-semibold text-red border-b-[3px] border-red" : "font-normal text-ink-3 border-b-2 border-transparent"}`}
          >
            {tab}
          </Link>
        );
      })}
    </nav>
  );
}
