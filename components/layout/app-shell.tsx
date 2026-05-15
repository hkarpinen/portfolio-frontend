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
  { label: "Households",          desc: "Household Hub",    href: "/households",  icon: "household" as const, exactMatch: false, extraPaths: ["/dashboard"] },
  { label: "Finance",             desc: "Personal Finance", href: "/expenses",   icon: "expenses" as const,  exactMatch: false, extraPaths: ["/income"] },
  { label: "Letters",           desc: "Community Forum",  href: "/communities", icon: "forum" as const,     exactMatch: false },
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
      <img src={url} alt="" style={{
        width: size, height: size,
        objectFit: "cover",
        border: "1.5px solid var(--ink)",
        display: "block",
      }} />
    );
  }
  return (
    <span style={{
      width: size, height: size,
      background: "var(--paper-3)",
      border: "1.5px solid var(--ink)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--ff-mono)",
      fontSize: size * 0.36,
      fontWeight: 700,
      color: "var(--ink)",
      letterSpacing: "0.04em",
      flexShrink: 0,
    }}>
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
      style={{
        display: "flex",
        alignItems: collapsed ? "center" : "flex-start",
        gap: 12,
        width: "100%",
        padding: collapsed ? "12px 0" : "12px 16px",
        background: active ? "var(--ink)" : "transparent",
        borderTop: "1px solid var(--ink)",
        cursor: "pointer",
        textDecoration: "none",
        color: active ? "var(--paper)" : "var(--ink)",
        transition: "all 140ms",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "var(--paper)";
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span style={{ flexShrink: 0, strokeWidth: active ? 2 : 1.5 }}>
        <Icon path={(ICONS as Record<string, string>)[item.icon] ?? ""} size={15} />
      </span>
      {!collapsed && (
        <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--ff-serif)",
            fontStyle: "italic",
            fontSize: "var(--ts-sub)",
            lineHeight: 1,
            color: active ? "var(--paper)" : "var(--ink)",
          }}>{item.label}</span>
          <span style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-meta)",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: active ? "rgba(241,234,219,0.7)" : "var(--ink-3)",
            marginTop: 4,
          }}>{item.desc}</span>
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
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              padding: "5px 10px",
              border: "1.5px solid var(--ink)",
            }}
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
      <aside style={{
        width: collapsed ? 64 : 248,
        minWidth: collapsed ? 64 : 248,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--paper-2)",
        borderRight: "1.5px solid var(--ink)",
        transition: "width 220ms var(--ease-spring), min-width 220ms var(--ease-spring)",
        overflow: "hidden",
        flexShrink: 0,
      }}>

        {/* Masthead block */}
        <div style={{
          padding: collapsed ? "16px 0" : "20px 14px 16px",
          borderBottom: "2px solid var(--ink)",
          textAlign: collapsed ? "center" : "left",
          overflow: "hidden",
        }}>
          {collapsed ? (
            <Link href="/" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>
              <span style={{
                fontFamily: "var(--ff-serif)",
                fontStyle: "italic",
                fontSize: "var(--ts-h3)",
                color: "var(--ink)",
                lineHeight: 1,
              }}>
                TS<span style={{ color: "var(--red)" }}>.</span>
              </span>
            </Link>
          ) : (
            <>
              <p style={{
                fontFamily: "var(--ff-mono)",
                fontSize: "var(--ts-meta)",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.28em",
                marginBottom: 8,
              }}>Vol. I · No. 04</p>
              <Link href="/" style={{ textDecoration: "none", display: "block" }}>
                <span style={{
                  fontFamily: "var(--ff-serif)",
                  fontStyle: "italic",
                  fontSize: "clamp(32px, 2.2vw + 22px, 48px)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.025em",
                  color: "var(--ink)",
                  display: "block",
                  whiteSpace: "nowrap",
                }}>
                  The Stack<span style={{ color: "var(--red)" }}>.</span>
                </span>
              </Link>
              <p style={{
                fontFamily: "var(--ff-mono)",
                fontSize: "var(--ts-meta)",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                paddingTop: 8,
                borderTop: "1px solid var(--ink-3)",
                marginTop: 8,
              }}>By Hank K. · Est. 2026</p>
            </>
          )}
        </div>

        {/* Nav */}
        <nav aria-label="Main navigation" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

          {/* Departments section */}
          {!collapsed && (
            <div style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
              fontWeight: 700,
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              padding: "20px 16px 6px",
              borderTop: "3px double var(--ink)",
            }}>— Departments —</div>
          )}
          {collapsed && <div style={{ borderTop: "3px double var(--ink)" }} />}

          {NAV_ITEMS.map(item => (
            <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}

          {/* The Office section */}
          {!collapsed && (
            <div style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
              fontWeight: 700,
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              padding: "20px 16px 6px",
              borderTop: "3px double var(--ink)",
            }}>— The Office —</div>
          )}
          {collapsed && <div style={{ borderTop: "3px double var(--ink)", marginTop: 8 }} />}

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
        <div style={{
          padding: collapsed ? "10px 0" : "12px 16px",
          borderTop: "2px solid var(--ink)",
          background: "var(--paper-3)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: collapsed ? "center" : "stretch",
        }}>
          {!collapsed && (
            <p style={{
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.20em",
              lineHeight: 1.5,
            }}>Set in Instrument Serif and JetBrains Mono.</p>
          )}
          {displayName && (
            <button
              onClick={logout}
              title="Log out"
              style={{
                padding: "6px 10px",
                background: "transparent",
                border: "1.5px solid var(--ink)",
                color: "var(--ink)",
                fontFamily: "var(--ff-mono)",
                fontSize: "var(--ts-label)",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
                cursor: "pointer",
                transition: "background var(--dur-fast), color var(--dur-fast)",
                width: "100%",
              }}
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
            style={{
              padding: "6px 10px",
              background: "transparent",
              border: "1.5px solid var(--ink)",
              color: "var(--ink)",
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-label)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              cursor: "pointer",
              transition: "background var(--dur-fast), color var(--dur-fast)",
              width: "100%",
            }}
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
    <div style={{ borderBottom: "2px solid var(--ink)", flexShrink: 0 }}>
      {/* Row 1 — Date strip (ink on paper) */}
      <div style={{
        background: "var(--ink)",
        color: "var(--paper)",
        padding: "6px 18px",
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--ts-meta)",
        textTransform: "uppercase",
        letterSpacing: "0.24em",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dateStr}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span className="pulse-dot" aria-hidden="true" />
          <span>Live</span>
        </span>
        <span className="hidden md:inline" style={{ flexShrink: 0, letterSpacing: "0.20em" }}>96 DPI</span>
      </div>

      {/* Row 2 — Section row */}
      <div style={{
        minHeight: 72,
        display: "flex",
        alignItems: "center",
        padding: "8px 22px",
        gap: 12,
        background: "var(--paper)",
      }}>
        {/* Left — section info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--ts-meta)",
            textTransform: "uppercase",
            letterSpacing: "0.24em",
            marginBottom: 2,
          }}>— {section.kicker} —</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--ff-serif)",
              fontStyle: "italic",
              fontSize: "var(--ts-h2)",
              fontWeight: 400,
              color: "var(--ink)",
              lineHeight: "var(--lh-display)",
              letterSpacing: "-0.02em",
            }}>{section.title}</span>
            {section.subtitle && (
              <span style={{
                fontFamily: "var(--ff-mono)",
                fontSize: "var(--ts-meta)",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.20em",
              }}>· {section.subtitle}</span>
            )}
          </div>
        </div>

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Notification bell */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
                style={{
                  position: "relative",
                  width: 38,
                  height: 38,
                  background: "transparent",
                  border: "1.5px solid var(--ink)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ink)",
                  transition: "background var(--dur-fast), color var(--dur-fast)",
                  flexShrink: 0,
                }}
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
                  <span style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    padding: "0 4px",
                    background: "var(--red)",
                    color: "var(--paper)",
                    fontFamily: "var(--ff-mono)",
                    fontSize: "var(--ts-meta)",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid var(--paper)",
                    borderRadius: 0,
                  }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={8}
                style={{
                  width: "min(320px, calc(100vw - 32px))",
                  background: "var(--paper)",
                  border: "2px solid var(--ink)",
                  boxShadow: "var(--shadow-stamp)",
                  zIndex: 200,
                  overflow: "hidden",
                  animation: "scaleIn 160ms var(--ease-spring)",
                  transformOrigin: "top right",
                  borderRadius: 0,
                }}
              >
                {/* Header */}
                <div style={{
                  padding: "12px 16px",
                  borderBottom: "1.5px solid var(--ink)",
                  background: "var(--paper-2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{
                    fontFamily: "var(--ff-mono)",
                    fontSize: "var(--ts-meta)",
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}>Wire Service</span>
                  {unread > 0 && (
                    <span style={{
                      fontFamily: "var(--ff-mono)",
                    fontSize: "var(--ts-meta)",
                      fontWeight: 500,
                      color: "var(--paper)",
                      background: "var(--ink)",
                      border: "1px solid var(--ink)",
                      padding: "1px 8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                    }}>{unread} new</span>
                  )}
                </div>
                {/* Body */}
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      fontFamily: "var(--ff-mono)",
                      fontSize: "var(--ts-meta)",
                      color: "var(--ink-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.20em",
                    }}>— No dispatches —</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "12px 16px",
                          borderBottom: i < notifications.length - 1 ? "1px solid var(--ink-3)" : undefined,
                          cursor: "pointer",
                        }}
                      >
                        <p style={{
                          fontFamily: "var(--ff-mono)",
                          fontSize: "var(--ts-meta)",
                          color: "var(--red)",
                          textTransform: "uppercase",
                          letterSpacing: "0.22em",
                          marginBottom: 4,
                        }}>
                          {n.type === "success" ? "Update" : n.type === "error" ? "Error" : "Notice"} · just now
                        </p>
                        {n.title && (
                          <p style={{
                            fontFamily: "var(--ff-serif)",
                            fontStyle: "italic",
                            fontSize: "var(--ts-sub)",
                            lineHeight: "var(--lh-snug)",
                            marginBottom: 4,
                            color: "var(--ink)",
                          }}>{n.title}</p>
                        )}
                        <p style={{ fontFamily: "var(--ff-body)", fontSize: "var(--ts-body)", color: "var(--ink-2)", lineHeight: 1.45 }}>{n.message}</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          {n.deepLink && (
                            <Link
                              href={n.deepLink}
                              onClick={() => { markRead(n.id); removeNotification(n.id); }}
                              style={{ fontFamily: "var(--ff-mono)", fontSize: "var(--ts-meta)", color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.16em" }}
                            >View →</Link>
                          )}
                          <button
                            onClick={() => { markRead(n.id); removeNotification(n.id); }}
                            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--ff-mono)", fontSize: "var(--ts-meta)", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.14em" }}
                          >Dismiss</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div style={{ padding: "10px 16px", borderTop: "1.5px solid var(--ink)" }}>
                    <button
                      onClick={() => { markAllRead(); notifications.forEach(n => removeNotification(n.id)); }}
                      style={{
                        fontFamily: "var(--ff-mono)", fontSize: "var(--ts-meta)", textTransform: "uppercase",
                        letterSpacing: "0.16em", background: "transparent", border: "1.5px solid var(--ink)",
                        color: "var(--ink)", padding: "5px 10px", cursor: "pointer", width: "100%",
                      }}
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
            style={{ textDecoration: "none", display: "block" }}
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
  if (pathname.startsWith("/households")) return { kicker: "Households", title: "Households", subtitle: "Shared Finance" };
  if (pathname.startsWith("/expenses")) return { kicker: "Finance", title: "Expenses", subtitle: "All Expenses" };
  if (pathname.startsWith("/income")) return { kicker: "Finance", title: "Income", subtitle: "Income Tracking" };
  if (pathname.startsWith("/dashboard")) return { kicker: "Ledger", title: "Dashboard", subtitle: "Overview" };
  if (pathname.startsWith("/communities")) return { kicker: "Forum", title: "Letters", subtitle: "Threaded Discussions" };
  if (pathname.startsWith("/settings")) return { kicker: "Account", title: "Subscription", subtitle: "Settings" };
  if (pathname.startsWith("/admin")) return { kicker: "Admin", title: "Moderation", subtitle: "Mod Queue" };
  return { kicker: "Section", title: "The Stack." };
}

/* ── Mobile bottom strip ────────────────────────────────────────────────────── */
function BottomStrip({ pathname }: { pathname: string }) {
  const cells = [
    { label: "Home",       href: "/" },
    { label: "Households", href: "/households" },
    { label: "Finance",    href: "/expenses" },
    { label: "Letters",    href: "/communities" },
    { label: "Account",    href: "/settings/profile" },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="mobile-only"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 80,
        background: "var(--paper)",
        borderTop: "2px solid var(--ink)",
        paddingBottom: "env(safe-area-inset-bottom, 4px)",
      }}
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
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              padding: "10px 4px",
              background: active ? "var(--ink)" : "transparent",
              color: active ? "var(--paper)" : "var(--ink)",
              borderRight: i < cells.length - 1 ? "1.5px solid var(--ink)" : undefined,
              textDecoration: "none",
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-meta)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              transition: "background var(--dur-fast), color var(--dur-fast)",
            }}
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
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
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:block" style={{ height: "100%" }}>
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
          className="app-main"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "clip",
            background: "var(--paper)",
            padding: "clamp(20px, 2vw, 48px) clamp(24px, 4vw, 80px)",
          }}
        >
          <div style={{ maxWidth: "clamp(900px, 92%, 1600px)", margin: "0 auto", position: "relative" }} className="page-enter page-container">
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
