"use client";

import Link from "next/link";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useLogout } from "@/hooks/use-identity";
import { Icon, type IconName } from "@/components/editorial/icon";
import { getInitials } from "@/lib/utils";

// ── Nav config ────────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: "Front Page",        desc: "Overview",           href: "/",              icon: "home" as const,      exactMatch: true },
  { label: "About the Author",  desc: "Portfolio",          href: "/about",         icon: "about" as const,     exactMatch: false },
  { label: "The Ledger",        desc: "Household & Chores", href: "/bills",         icon: "household" as const, exactMatch: false, extraPaths: ["/dashboard"] },
  { label: "Finance",           desc: "Expenses & Income",  href: "/expenses",      icon: "expenses" as const,  exactMatch: false, extraPaths: ["/income"] },
  { label: "Letters",           desc: "Community Forum",    href: "/forum",         icon: "forum" as const,     exactMatch: false },
  { label: "Geography",          desc: "Weather & Maps",     href: "/weather",       icon: "weather" as const,   exactMatch: false },
  { label: "Math",               desc: "Unit Conversion",    href: "/math",          icon: "math" as const,      exactMatch: false },
];
export const NAV_OFFICE = [
  { label: "Subscription",      desc: "Settings",           href: "/settings/profile", icon: "settings" as const, exactMatch: false },
];

export function isActive(href: string, pathname: string, exact: boolean, extraPaths?: string[]) {
  if (exact ? pathname === href : pathname.startsWith(href)) return true;
  return extraPaths?.some(p => pathname.startsWith(p)) ?? false;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, url, size = 36 }: { name: string | null; url: string | null; size?: number }) {
  const initials = getInitials(name);
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="object-cover block border-ink" style={{ width: size, height: size}} />
    );
  }
  return (
    <span className="bg-paper-3 flex items-center justify-center font-mono font-bold text-ink tracking-[0.04em] shrink-0 border-ink" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────
type NavItemData = { label: string; desc: string; href: string; icon: string; exactMatch: boolean; extraPaths?: string[] };

export function NavItem({ item, pathname, collapsed }: { item: NavItemData; pathname: string; collapsed: boolean }) {
  const active = isActive(item.href, pathname, item.exactMatch, item.extraPaths);

  const link = (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className="flex gap-6 w-full cursor-pointer no-underline"
      style={{ alignItems: collapsed ? "center" : "flex-start", padding: collapsed ? "12px 0" : "12px 16px", background: active ? "var(--ink)" : "transparent", borderTop: "1px solid var(--ink)", color: active ? "var(--paper)" : "var(--ink)", transition: "all 140ms", justifyContent: collapsed ? "center" : "flex-start" }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--paper)"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span className="shrink-0" style={{ strokeWidth: active ? 2 : 1.5 }}>
        <Icon name={item.icon as IconName} size={15} strokeWidth={active ? 2 : 1.5} />
      </span>
      {!collapsed && (
        <span className="flex flex-col gap-2 min-w-0">
          <span className="font-serif italic text-xl leading-none" style={{ color: active ? "var(--paper)" : "var(--ink)" }}>{item.label}</span>
          <span className="font-mono text-sm uppercase tracking-[0.18em] mt-2" style={{ color: active ? "rgba(241,234,219,0.7)" : "var(--ink-3)" }}>{item.desc}</span>
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side="right" sideOffset={8} className="bg-ink text-paper font-mono text-sm uppercase tracking-[0.18em] py-[5px] px-[10px] border-ink">
            {item.label}
            <Tooltip.Arrow style={{ fill: "var(--ink)" }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }
  return link;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar({ collapsed, onToggle, displayName, avatarUrl, pathname, role }: {
  collapsed: boolean;
  onToggle: () => void;
  displayName: string | null;
  avatarUrl: string | null;
  pathname: string;
  role?: string | null;
}) {
  const logout = useLogout();

  return (
    <Tooltip.Provider delayDuration={300}>
      <aside className="h-full flex flex-col bg-paper-2 overflow-hidden shrink-0" style={{ width: collapsed ? 64 : 248, minWidth: collapsed ? 64 : 248, borderRight: "1.5px solid var(--ink)", transition: "width 220ms var(--ease-spring), min-width 220ms var(--ease-spring)" }}>

        <div className="overflow-hidden" style={{ padding: collapsed ? "16px 0" : "20px 14px 16px", borderBottom: "2px solid var(--ink)", textAlign: collapsed ? "center" : "left" }}>
          {collapsed ? (
            <Link href="/" className="no-underline block text-center">
              <span className="font-serif italic text-3xl text-ink leading-none">TS<span className="text-red">.</span></span>
            </Link>
          ) : (
            <>
              <p className="font-mono text-sm text-ink-3 uppercase tracking-wider mb-4">Vol. I · No. 04</p>
              <Link href="/" className="no-underline block">
                <span className="font-serif italic text-[clamp(32px, 2.2vw + 22px, 48px)] leading-[0.9] tracking-[-0.025em] text-ink block whitespace-nowrap">
                  The Stack<span className="text-red">.</span>
                </span>
              </Link>
              <p className="font-mono text-sm text-ink-3 uppercase tracking-[0.22em] pt-4 mt-4" style={{ borderTop: "1px solid var(--ink-3)" }}>By Hank K. · Est. 2026</p>
            </>
          )}
        </div>

        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto overflow-x-hidden">
          {!collapsed && <div className="font-mono text-sm font-bold text-ink-3 uppercase tracking-wider p-[20px_16px_6px]" style={{ borderTop: "3px double var(--ink)" }}>— Departments —</div>}
          {collapsed && <div style={{ borderTop: "3px double var(--ink)" }} />}

          {NAV_ITEMS.map(item => <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />)}

          {!collapsed && <div className="font-mono text-sm font-bold text-ink-3 uppercase tracking-wider p-[20px_16px_6px]" style={{ borderTop: "3px double var(--ink)" }}>— The Office —</div>}
          {collapsed && <div className="mt-4" style={{ borderTop: "3px double var(--ink)" }} />}

          {NAV_OFFICE.map(item => <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />)}

          {role === "Admin" && (
            <NavItem
              item={{ label: "Admin", desc: "Moderation", href: "/admin", icon: "shield" as string, exactMatch: false }}
              pathname={pathname}
              collapsed={collapsed}
            />
          )}
        </nav>

        <div className="bg-paper-3 flex flex-col gap-4" style={{ padding: collapsed ? "10px 0" : "12px 16px", borderTop: "2px solid var(--ink)", alignItems: collapsed ? "center" : "stretch" }}>
          {!collapsed && <p className="font-mono text-sm text-ink-3 uppercase tracking-wide leading-[1.5]">Set in Instrument Serif and JetBrains Mono.</p>}
          {displayName && (
            <button
              onClick={logout}
              title="Log out"
              className="py-3 px-5 bg-transparent text-ink font-mono text-base uppercase tracking-[0.16em] flex items-center gap-4 justify-center cursor-pointer w-full border-ink"
              style={{transition: "background var(--dur-fast), color var(--dur-fast)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ink)"; (e.currentTarget as HTMLElement).style.color = "var(--paper)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
            >
              <Icon name="logout" size={11} />
              {!collapsed && "Sign out"}
            </button>
          )}
          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Fold sidebar"}
            className="py-3 px-5 bg-transparent text-ink font-mono text-base uppercase tracking-[0.16em] flex items-center gap-4 justify-center cursor-pointer w-full border-ink"
            style={{transition: "background var(--dur-fast), color var(--dur-fast)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ink)"; (e.currentTarget as HTMLElement).style.color = "var(--paper)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
          >
            <Icon name={collapsed ? "chevRight" : "chevLeft"} size={11} />
            {!collapsed && "Fold"}
          </button>
        </div>
      </aside>
    </Tooltip.Provider>
  );
}
