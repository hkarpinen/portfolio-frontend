"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useNotificationsContext, NotificationsProvider } from "@/components/layout/notifications-provider";
import { NotificationsToaster } from "@/components/layout/notifications-toaster";
import { useLogout } from "@/hooks/use-identity";
import type { Notification } from "@/hooks/use-notifications";

/* ── Icons ─────────────────────────────────────────────────────────────────── */
function Icon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  home:         "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  about:        "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  expenses:     "M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2zm-1 7H9m6 4H9",
  household:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10 M3 9l9-7 9 7",
  forum:        "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  settings:     "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.16-2.4.34-1.02a1 1 0 0 0-.54-1.2l-1.2-.48a5.1 5.1 0 0 0-.52-.86l.22-1.26a1 1 0 0 0-.64-1.1l-1.06-.36a1 1 0 0 0-1.12.38l-.7 1.06a5 5 0 0 0-1 0l-.7-1.06a1 1 0 0 0-1.12-.38l-1.06.36a1 1 0 0 0-.64 1.1l.22 1.26a5.1 5.1 0 0 0-.52.86l-1.2.48a1 1 0 0 0-.54 1.2l.34 1.02a1 1 0 0 0 .96.68h.06a5 5 0 0 0 .7 1.2l-.2 1.26a1 1 0 0 0 .64 1.1l1.06.36a1 1 0 0 0 1.12-.38l.7-1.06a5 5 0 0 0 1 0l.7 1.06a1 1 0 0 0 1.12.38l1.06-.36a1 1 0 0 0 .64-1.1l-.2-1.26a5 5 0 0 0 .7-1.2h.06a1 1 0 0 0 .96-.68z",
  bell:         "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  chevRight:    "M9 18l6-6-6-6",
  chevLeft:     "M15 18l-6-6 6-6",
  shield:       "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  logout:       "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v1",
};

/* ── Storage key ────────────────────────────────────────────────────────────── */
const STORE_KEY = "pf_state_editorial";

function loadStore(): { tweaks: { sidebarCollapsed: boolean } } {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { tweaks: { sidebarCollapsed: false } };
}

function saveStore(collapsed: boolean) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ tweaks: { sidebarCollapsed: collapsed } }));
  } catch {}
}

/* ── Nav config ─────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Front Page",        desc: "Overview",         href: "/",            icon: "home" as const,      exactMatch: true },
  { label: "About the Author",  desc: "Portfolio",        href: "/about",       icon: "about" as const,     exactMatch: false },
  { label: "The Ledger",        desc: "Household & Chores", href: "/bills",     icon: "household" as const, exactMatch: false, extraPaths: ["/dashboard"] },
  { label: "Finance",           desc: "Expenses & Income", href: "/expenses",  icon: "expenses" as const,  exactMatch: false, extraPaths: ["/income"] },
  { label: "Letters",           desc: "Community Forum",  href: "/forum",     icon: "forum" as const,     exactMatch: false },
];
const NAV_OFFICE = [
  { label: "Subscription",      desc: "Settings",         href: "/settings/profile",   icon: "settings" as const, exactMatch: false },
];

function isActive(href: string, pathname: string, exact: boolean, extraPaths?: string[]) {
  if (exact ? pathname === href : pathname.startsWith(href)) return true;
  return extraPaths?.some(p => pathname.startsWith(p)) ?? false;
}

/* ── Avatar (square stamp) ──────────────────────────────────────────────────── */
function Avatar({ name, url, size = 36 }: { name: string | null; url: string | null; size?: number }) {
  const initials = name
    ? name.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    : "?";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="object-cover block" style={{ width: size, height: size, border: "1.5px solid var(--ink)" }} />
    );
  }
  return (
    <span className="bg-paper-3 flex items-center justify-center font-mono font-bold text-ink tracking-[0.04em] shrink-0" style={{ width: size, height: size, border: "1.5px solid var(--ink)", fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

/* ── Nav item ───────────────────────────────────────────────────────────────── */
type NavItemData = { label: string; desc: string; href: string; icon: string; exactMatch: boolean; extraPaths?: string[] };

function NavItem({
  item, pathname, collapsed,
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
      className="flex gap-6 w-full cursor-pointer no-underline" style={{ alignItems: collapsed ? "center" : "flex-start", padding: collapsed ? "12px 0" : "12px 16px", background: active ? "var(--ink)" : "transparent", borderTop: "1px solid var(--ink)", color: active ? "var(--paper)" : "var(--ink)", transition: "all 140ms", justifyContent: collapsed ? "center" : "flex-start" }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "var(--paper)";
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span className="shrink-0" style={{ strokeWidth: active ? 2 : 1.5 }}>
        <Icon path={(ICONS as Record<string, string>)[item.icon] ?? ""} size={15} />
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
          <Tooltip.Content
            side="right"
            sideOffset={8}
            className="bg-ink text-paper font-mono text-sm uppercase tracking-[0.18em] py-[5px] px-[10px]" style={{ border: "1.5px solid var(--ink)" }}
          >
            {item.label}
            <Tooltip.Arrow style={{ fill: "var(--ink)" }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return link;
}

/* ── Sidebar ────────────────────────────────────────────────────────────────── */
function Sidebar({
  collapsed, onToggle, displayName, avatarUrl, pathname, role,
}: {
  collapsed: boolean;
  onToggle: () => void;
  displayName: string | null;
  avatarUrl: string | null;
  pathname: string;
  role?: string | null;
}) {
  const logout = useLogout();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <Tooltip.Provider delayDuration={300}>
      <aside className="h-full flex flex-col bg-paper-2 overflow-hidden shrink-0" style={{ width: collapsed ? 64 : 248, minWidth: collapsed ? 64 : 248, borderRight: "1.5px solid var(--ink)", transition: "width 220ms var(--ease-spring), min-width 220ms var(--ease-spring)" }}>

        {/* Masthead block */}
        <div className="overflow-hidden" style={{ padding: collapsed ? "16px 0" : "20px 14px 16px", borderBottom: "2px solid var(--ink)", textAlign: collapsed ? "center" : "left" }}>
          {collapsed ? (
            <Link href="/" className="no-underline block text-center">
              <span className="font-serif italic text-3xl text-ink leading-none">
                TS<span className="text-red">.</span>
              </span>
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

        {/* Nav */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto overflow-x-hidden">

          {/* Departments section */}
          {!collapsed && (
            <div className="font-mono text-sm font-bold text-ink-3 uppercase tracking-wider p-[20px_16px_6px]" style={{ borderTop: "3px double var(--ink)" }}>— Departments —</div>
          )}
          {collapsed && <div style={{ borderTop: "3px double var(--ink)" }} />}

          {NAV_ITEMS.map(item => (
            <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}

          {/* The Office section */}
          {!collapsed && (
            <div className="font-mono text-sm font-bold text-ink-3 uppercase tracking-wider p-[20px_16px_6px]" style={{ borderTop: "3px double var(--ink)" }}>— The Office —</div>
          )}
          {collapsed && <div className="mt-4" style={{ borderTop: "3px double var(--ink)" }} />}

          {NAV_OFFICE.map(item => (
            <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}

          {role === "Admin" && (
            <NavItem
              item={{ label: "Admin", desc: "Moderation", href: "/admin", icon: "shield" as string, exactMatch: false }}
              pathname={pathname}
              collapsed={collapsed}
            />
          )}
        </nav>

        {/* Footer / Colophon */}
        <div className="bg-paper-3 flex flex-col gap-4" style={{ padding: collapsed ? "10px 0" : "12px 16px", borderTop: "2px solid var(--ink)", alignItems: collapsed ? "center" : "stretch" }}>
          {!collapsed && (
            <p className="font-mono text-sm text-ink-3 uppercase tracking-wide leading-[1.5]">Set in Instrument Serif and JetBrains Mono.</p>
          )}
          {displayName && (
            <button
              onClick={logout}
              title="Log out"
              className="py-3 px-5 bg-transparent text-ink font-mono text-base uppercase tracking-[0.16em] flex items-center gap-4 justify-center cursor-pointer w-full" style={{ border: "1.5px solid var(--ink)", transition: "background var(--dur-fast), color var(--dur-fast)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--ink)";
                (e.currentTarget as HTMLElement).style.color = "var(--paper)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--ink)";
              }}
            >
              <Icon path={ICONS.logout} size={11} />
              {!collapsed && "Sign out"}
            </button>
          )}
          {/* Fold button */}
          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Fold sidebar"}
            className="py-3 px-5 bg-transparent text-ink font-mono text-base uppercase tracking-[0.16em] flex items-center gap-4 justify-center cursor-pointer w-full" style={{ border: "1.5px solid var(--ink)", transition: "background var(--dur-fast), color var(--dur-fast)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--ink)";
              (e.currentTarget as HTMLElement).style.color = "var(--paper)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--ink)";
            }}
          >
            <Icon path={collapsed ? ICONS.chevRight : ICONS.chevLeft} size={11} />
            {!collapsed && "Fold"}
          </button>
        </div>
      </aside>
    </Tooltip.Provider>
  );
}

/* ── Top bar stack ──────────────────────────────────────────────────────────── */
function TopBarStack({
  displayName,
  avatarUrl,
  notifications,
  removeNotification,
  markRead,
  markAllRead,
  section,
}: {
  displayName: string | null;
  avatarUrl: string | null;
  notifications: Notification[];
  removeNotification: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  section: { kicker: string; title: string; subtitle?: string };
}) {
  const unread = notifications.length;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="shrink-0" style={{ borderBottom: "2px solid var(--ink)" }}>
      {/* Row 1 — Date strip (ink on paper) */}
      <div className="bg-ink text-paper py-[6px] px-[18px] font-mono text-sm uppercase tracking-[0.24em] flex justify-between items-center gap-5">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{dateStr}</span>
        <span className="flex items-center gap-4 shrink-0">
          <span className="pulse-dot" aria-hidden="true" />
          <span>Live</span>
        </span>
        <span className="hidden md:inline shrink-0 tracking-wide" >96 DPI</span>
      </div>

      {/* Row 2 — Section row */}
      <div className="min-h-[72] flex items-center py-[8px] px-[22px] gap-6 bg-paper">
        {/* Left — section info */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm uppercase tracking-[0.24em] mb-1">— {section.kicker} —</p>
          <div className="flex items-baseline gap-5 flex-wrap">
            <span className="font-serif italic text-4xl font-normal text-ink leading-none tracking-snug">{section.title}</span>
            {section.subtitle && (
              <span className="font-mono text-sm text-ink-3 uppercase tracking-wide">· {section.subtitle}</span>
            )}
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Notification bell */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
                className="relative w-[38px] h-[38px] bg-transparent cursor-pointer flex items-center justify-center text-ink shrink-0" style={{ border: "1.5px solid var(--ink)", transition: "background var(--dur-fast), color var(--dur-fast)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "var(--ink)";
                  (e.currentTarget as HTMLElement).style.color = "var(--paper)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                }}
              >
                <Icon path={ICONS.bell} size={15} />
                {unread > 0 && (
                  <span className="absolute min-w-[16] h-[16] p-[0_4px] bg-red text-paper font-mono text-sm font-bold flex items-center justify-center" style={{ top: -4, right: -4, border: "1.5px solid var(--paper)" }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={8}
                className="w-[min(320px, calc(100vw - 32px))] bg-paper shadow-stamp z-[200] overflow-hidden" style={{ border: "2px solid var(--ink)", animation: "scaleIn 160ms var(--ease-spring)", transformOrigin: "top right" }}
              >
                {/* Header */}
                <div className="py-6 px-8 bg-paper-2 flex justify-between items-center" style={{ borderBottom: "1.5px solid var(--ink)" }}>
                  <span className="font-mono text-sm uppercase tracking-[0.22em] font-bold text-ink">Wire Service</span>
                  {unread > 0 && (
                    <span className="font-mono text-sm font-medium text-paper bg-ink py-[1px] px-[8px] uppercase tracking-mono" style={{ border: "1px solid var(--ink)" }}>{unread} new</span>
                  )}
                </div>
                {/* Body */}
                <div className="max-h-[360] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-16 px-8 text-center font-mono text-sm text-ink-3 uppercase tracking-wide">— No dispatches —</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={n.id}
                        className="py-6 px-8 cursor-pointer" style={{ borderBottom: i < notifications.length - 1 ? "1px solid var(--ink-3)" : undefined }}
                      >
                        <p className="font-mono text-sm text-red uppercase tracking-[0.22em] mb-2">
                          {n.type === "success" ? "Update" : n.type === "error" ? "Error" : "Notice"} · just now
                        </p>
                        {n.title && (
                          <p className="font-serif italic text-xl leading-[1.15] mb-2 text-ink">{n.title}</p>
                        )}
                        <p className="font-body text-md text-ink-2 leading-[1.45]">{n.message}</p>
                        <div className="flex gap-4 mt-4">
                          {n.deepLink && (
                            <Link
                              href={n.deepLink}
                              onClick={() => { markRead(n.id); removeNotification(n.id); }}
                              className="font-mono text-sm text-red uppercase tracking-[0.16em]"
                            >View →</Link>
                          )}
                          <button
                            onClick={() => { markRead(n.id); removeNotification(n.id); }}
                            className="bg-transparent cursor-pointer font-mono text-sm text-ink-3 uppercase tracking-mono" style={{ border: "none" }}
                          >Dismiss</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="py-5 px-8" style={{ borderTop: "1.5px solid var(--ink)" }}>
                    <button
                      onClick={() => { markAllRead(); notifications.forEach(n => removeNotification(n.id)); }}
                      className="font-mono text-sm uppercase tracking-[0.16em] bg-transparent text-ink py-[5px] px-[10px] cursor-pointer w-full" style={{ border: "1.5px solid var(--ink)" }}
                    >Clear all dispatches</button>
                  </div>
                )}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Avatar → settings */}
          <Link
            href="/settings/profile"
            aria-label="Open subscription settings"
            className="no-underline block"
          >
            <Avatar name={displayName} url={avatarUrl} size={36} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Section resolver ───────────────────────────────────────────────────────── */
function resolveSection(pathname: string): { kicker: string; title: string; subtitle?: string } {
  if (pathname === "/") return { kicker: "Section", title: "Front Page", subtitle: "Overview" };
  if (pathname.startsWith("/about")) return { kicker: "Portfolio", title: "About the Author", subtitle: "Profile & Projects" };
  if (pathname.startsWith("/contact")) return { kicker: "Portfolio", title: "Contact", subtitle: "Write a Letter" };
  if (pathname.startsWith("/bills")) return { kicker: "Ledger · Page B-1", title: "The Ledger", subtitle: "Household & Chores" };
  if (pathname.startsWith("/dashboard")) return { kicker: "Ledger", title: "Dashboard", subtitle: "Overview" };
  if (pathname.startsWith("/expenses")) return { kicker: "Finance · Expenses", title: "Finance", subtitle: "Expenses & Payments" };
  if (pathname.startsWith("/income")) return { kicker: "Finance · Income", title: "Finance", subtitle: "Income" };
  if (pathname.startsWith("/forum")) return { kicker: "Letters · Community", title: "Letters", subtitle: "Threaded Discussions" };
  if (pathname.startsWith("/settings")) return { kicker: "Account", title: "Subscription", subtitle: "Settings" };
  if (pathname.startsWith("/admin")) return { kicker: "Admin", title: "Moderation", subtitle: "Mod Queue" };
  return { kicker: "Section", title: "The Stack." };
}

/* ── Mobile bottom strip ────────────────────────────────────────────────────── */
function BottomStrip({ pathname }: { pathname: string }) {
  const cells = [
    { label: "Home",     href: "/" },
    { label: "Bills",    href: "/bills" },
    { label: "Finance",  href: "/expenses" },
    { label: "Letters",  href: "/forum" },
    { label: "Account",  href: "/settings/profile" },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="mobile-only fixed bottom-0 left-0 right-0 z-[80] bg-paper pb-[env(safe-area-inset-bottom, 4px)]"
      style={{ borderTop: "2px solid var(--ink)" }}
    >
      {cells.map((cell, i) => {
        const active = cell.href === "/"
          ? pathname === "/"
          : cell.href === "/settings"
          ? pathname.startsWith("/settings")
          : pathname.startsWith(cell.href);

        return (
          <Link
            key={cell.href}
            href={cell.href}
            aria-current={active ? "page" : undefined}
            className="flex-1 flex items-center justify-center min-h-[44] py-5 px-2 no-underline font-mono text-sm uppercase tracking-[0.18em] cursor-pointer" style={{ background: active ? "var(--ink)" : "transparent", color: active ? "var(--paper)" : "var(--ink)", borderRight: i < cells.length - 1 ? "1.5px solid var(--ink)" : undefined, fontWeight: active ? 700 : 500, transition: "background var(--dur-fast), color var(--dur-fast)" }}
          >
            {cell.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────────*/
export type AppShellProps = {
  children: React.ReactNode;
  displayName: string | null;
  avatarUrl: string | null;
  role?: string | null;
  subnav?: React.ReactNode;
};

export function AppShell(props: AppShellProps) {
  return (
    <NotificationsProvider>
      <AppShellInner {...props} />
    </NotificationsProvider>
  );
}

function AppShellInner({ children, displayName, avatarUrl, role, subnav }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { notifications, removeNotification, markRead, markAllRead } = useNotificationsContext();

  useEffect(() => {
    const store = loadStore();
    setCollapsed(store.tweaks.sidebarCollapsed);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    saveStore(next);
  }

  const section = resolveSection(pathname);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar stack — full width */}
      <TopBarStack
        displayName={displayName}
        avatarUrl={avatarUrl}
        notifications={notifications}
        removeNotification={removeNotification}
        markRead={markRead}
        markAllRead={markAllRead}
        section={section}
      />
      {subnav}

      {/* Row: sidebar + main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:block h-full" >
          <Sidebar
            collapsed={collapsed}
            onToggle={toggleCollapsed}
            displayName={displayName}
            avatarUrl={avatarUrl}
            pathname={pathname}
            role={role}
          />
        </div>

        {/* Main content */}
        <main
          className="app-main flex-1 overflow-y-auto overflow-x-clip bg-paper p-[clamp(20px,_2vw,_48px)_clamp(24px,_4vw,_80px)]"
          
        >
          <div  className="page-enter page-container max-w-[clamp(900px, 92%, 1600px)] mx-auto relative">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom strip */}
      <BottomStrip pathname={pathname} />

      <NotificationsToaster />
    </div>
  );
}
