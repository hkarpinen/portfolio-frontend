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
    <nav aria-label="Profile sections" className="border-ink-b mb-[28px] flex gap-2">
      {PROFILE_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <Link
            key={tab}
            href={PROFILE_TAB_HREFS[tab]}
            aria-current={isActive ? "page" : undefined}
            className={`mb-[-1px] px-8 py-5 text-md no-underline transition-colors duration-150 ${isActive ? "border-b-[3px] border-red font-semibold text-red" : "border-b-2 border-transparent font-normal text-ink-3"}`}
          >
            {tab}
          </Link>
        );
      })}
    </nav>
  );
}
