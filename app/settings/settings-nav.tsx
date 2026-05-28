"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Profile", href: "/settings/profile", matchPrefix: "/settings/profile" },
  { label: "Account & security", href: "/settings/security", matchPrefix: "/settings/security" },
  {
    label: "Notifications",
    href: "/settings/notifications",
    matchPrefix: "/settings/notifications",
  },
  { label: "Sessions", href: "/settings/sessions", matchPrefix: "/settings/sessions" },
  {
    label: "Connected accounts",
    href: "/settings/connections",
    matchPrefix: "/settings/connections",
  },
  { label: "Appearance", href: "/settings/appearance", matchPrefix: "/settings/appearance" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="ed-settings-nav" aria-label="Settings sections">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.matchPrefix);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`ed-settings-nav-item${active ? "active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/settings/security#danger"
        className="ed-settings-nav-item ed-settings-nav-delete"
      >
        Delete account
      </Link>
    </nav>
  );
}
