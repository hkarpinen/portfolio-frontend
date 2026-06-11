"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Profile", href: "/identity/settings/profile", matchPrefix: "/identity/settings/profile" },
  { label: "Account & security", href: "/identity/settings/security", matchPrefix: "/identity/settings/security" },
  {
    label: "Notifications",
    href: "/identity/settings/notifications",
    matchPrefix: "/identity/settings/notifications",
  },
  { label: "Sessions", href: "/identity/settings/sessions", matchPrefix: "/identity/settings/sessions" },
  {
    label: "Connected accounts",
    href: "/identity/settings/connections",
    matchPrefix: "/identity/settings/connections",
  },
  { label: "Appearance", href: "/identity/settings/appearance", matchPrefix: "/identity/settings/appearance" },
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
        href="/identity/settings/security#danger"
        className="ed-settings-nav-item ed-settings-nav-delete"
      >
        Delete account
      </Link>
    </nav>
  );
}
