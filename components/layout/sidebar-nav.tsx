"use client";

import Link from "next/link";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useLogout } from "@/hooks/use-identity";
import { Icon, type IconName } from "@/components/editorial/icon";
import { getInitials } from "@/lib/utils";

/**
 * <Sidebar> — main app navigation (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-sidebar*` / `.ed-avatar*`
 * classes. No inline styles.
 */

// ── Nav config ────────────────────────────────────────────────────────────────
export const NAV_PORTFOLIO = [
  { label: "About", desc: "Portfolio", href: "/about", icon: "about" as const, exactMatch: false },
  {
    label: "Contact",
    desc: "Say hello",
    href: "/contact",
    icon: "mail" as const,
    exactMatch: false,
  },
];

export const NAV_ACCOUNT = [
  {
    label: "Household",
    desc: "Household & Chores",
    href: "/household",
    icon: "household" as const,
    exactMatch: false,
    extraPaths: ["/dashboard"],
  },
  {
    label: "Finance",
    desc: "Expenses & Income",
    href: "/expenses",
    icon: "expenses" as const,
    exactMatch: false,
    extraPaths: ["/income"],
  },
  { label: "Forum", desc: "Community", href: "/forum", icon: "forum" as const, exactMatch: false },
];

export const NAV_UTILITIES = [
  {
    label: "Weather",
    desc: "Live conditions",
    href: "/weather",
    icon: "weather" as const,
    exactMatch: false,
  },
  {
    label: "Convert",
    desc: "Unit conversion",
    href: "/convert",
    icon: "math" as const,
    exactMatch: false,
  },
  {
    label: "Notifications",
    desc: "Your inbox",
    href: "/notifications",
    icon: "bell" as const,
    exactMatch: false,
  },
  {
    label: "Settings",
    desc: "Profile & account",
    href: "/settings/profile",
    icon: "settings" as const,
    exactMatch: false,
    extraPaths: ["/settings"],
  },
];

/** @deprecated Use NAV_PORTFOLIO / NAV_ACCOUNT / NAV_UTILITIES */
export const NAV_ITEMS = NAV_PORTFOLIO;
export const NAV_OFFICE = NAV_UTILITIES.filter((i) => i.label === "Settings");

export function isActive(href: string, pathname: string, exact: boolean, extraPaths?: string[]) {
  if (exact ? pathname === href : pathname.startsWith(href)) return true;
  return extraPaths?.some((p) => pathname.startsWith(p)) ?? false;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "ed-avatar-sm",
  md: "ed-avatar-md",
  lg: "ed-avatar-lg",
  xl: "ed-avatar-xl",
};

export function Avatar({
  name,
  url,
  size = "md",
}: {
  name: string | null;
  url: string | null;
  size?: AvatarSize;
}) {
  const initials = getInitials(name);
  return (
    <span className={`ed-avatar ${SIZE_CLASS[size]}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" />
      ) : (
        initials
      )}
    </span>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────
type NavItemData = {
  label: string;
  desc: string;
  href: string;
  icon: IconName;
  exactMatch: boolean;
  extraPaths?: string[];
};

function NavItem({
  item,
  pathname,
  collapsed,
}: {
  item: NavItemData;
  pathname: string;
  collapsed: boolean;
}) {
  const active = isActive(item.href, pathname, item.exactMatch, item.extraPaths);

  const link = (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className="ed-sidebar-item"
    >
      <span className="ed-sidebar-item-icon">
        <Icon name={item.icon} size={22} strokeWidth={active ? 2 : 1.5} />
      </span>
      <span className="ed-sidebar-item-labels">
        <span className="ed-sidebar-item-primary">{item.label}</span>
        <span className="ed-sidebar-item-secondary">{item.desc}</span>
      </span>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side="right" sideOffset={8} className="ed-tooltip">
            {item.label}
            <Tooltip.Arrow className="ed-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }
  return link;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar({
  displayName,
  avatarUrl,
  pathname,
  role,
}: {
  displayName: string | null;
  avatarUrl: string | null;
  pathname: string;
  role?: string | null;
}) {
  const logout = useLogout();

  return (
    <Tooltip.Provider delayDuration={300}>
      <aside aria-label="Main navigation" className="ed-sidebar">
        {/* Brand lives in the global top bar; sidebar is nav-only. */}

        {/* Nav */}
        <nav aria-label="Sections" className="ed-sidebar-nav">
          <p className="ed-sidebar-group-h">Portfolio</p>
          {NAV_PORTFOLIO.map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} collapsed={false} />
          ))}

          <p className="ed-sidebar-group-h">Account</p>
          {NAV_ACCOUNT.map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} collapsed={false} />
          ))}

          <p className="ed-sidebar-group-h">Utilities</p>
          {NAV_UTILITIES.map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} collapsed={false} />
          ))}

          {role === "Admin" && (
            <NavItem
              item={{
                label: "Admin",
                desc: "Moderation",
                href: "/admin",
                icon: "shield" as IconName,
                exactMatch: false,
              }}
              pathname={pathname}
              collapsed={false}
            />
          )}
        </nav>

        {/* Footer */}
        <div className="ed-sidebar-foot">
          {displayName && (
            <div className="ed-sidebar-foot-user">
              <Avatar name={displayName} url={avatarUrl} size="md" />
              <div className="ed-sidebar-foot-who">
                <span className="ed-sidebar-foot-name">{displayName}</span>
                <button onClick={logout} aria-label="Sign out" className="ed-sidebar-foot-signout">
                  Sign out ↗
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </Tooltip.Provider>
  );
}
