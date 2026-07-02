"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Profile", href: "/identity/settings/profile", matchPrefix: "/identity/settings/profile" },
  { label: "Security", href: "/identity/settings/security", matchPrefix: "/identity/settings/security" },
  {
    label: "Notifications",
    href: "/identity/settings/notifications",
    matchPrefix: "/identity/settings/notifications",
  },
  { label: "Sessions", href: "/identity/settings/sessions", matchPrefix: "/identity/settings/sessions" },
  {
    label: "Connections",
    href: "/identity/settings/connections",
    matchPrefix: "/identity/settings/connections",
  },
  { label: "Appearance", href: "/identity/settings/appearance", matchPrefix: "/identity/settings/appearance" },
];

/**
 * <SettingsNav> — Terminus `.tabs` strip for the settings desk.
 *
 * Renders inside the page content, after the head (prototype `page-head →
 * tabs → content` flow), matching every other tabbed page. Was a boxed
 * vertical left-rail in the Editorial layout.
 */
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="tabs" aria-label="Settings sections">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.matchPrefix);
        return (
          <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
