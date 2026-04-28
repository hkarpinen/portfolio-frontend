"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNotificationsContext } from "@/components/layout/notifications-provider";
import { NotificationsToaster } from "@/components/layout/notifications-toaster";
import { useLogout } from "@/hooks/use-identity";
import type { Notification } from "@/hooks/use-notifications";
import styles from "./app-shell.module.css";

/* ── Icons (inline SVG to avoid external dep) ─────────────────────────────── */
function Icon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  home:         "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  portfolio:    "M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zm0 7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-7zM4 14a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z",
  bills:        "M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2zm-1 7H9m6 4H9",
  personalBills:"M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4",
  forum:        "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  settings:     "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.16-2.4.34-1.02a1 1 0 0 0-.54-1.2l-1.2-.48a5.1 5.1 0 0 0-.52-.86l.22-1.26a1 1 0 0 0-.64-1.1l-1.06-.36a1 1 0 0 0-1.12.38l-.7 1.06a5 5 0 0 0-1 0l-.7-1.06a1 1 0 0 0-1.12-.38l-1.06.36a1 1 0 0 0-.64 1.1l.22 1.26a5.1 5.1 0 0 0-.52.86l-1.2.48a1 1 0 0 0-.54 1.2l.34 1.02a1 1 0 0 0 .96.68h.06a5 5 0 0 0 .7 1.2l-.2 1.26a1 1 0 0 0 .64 1.1l1.06.36a1 1 0 0 0 1.12-.38l.7-1.06a5 5 0 0 0 1 0l.7 1.06a1 1 0 0 0 1.12.38l1.06-.36a1 1 0 0 0 .64-1.1l-.2-1.26a5 5 0 0 0 .7-1.2h.06a1 1 0 0 0 .96-.68z",
  bell:         "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-9.33-5.004M12 21a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zM6 11a6 6 0 0 1 6-6",
  chevronRight: "M9 18l6-6-6-6",
  chevronLeft:  "M15 18l-6-6 6-6",
  menu:         "M3 12h18M3 6h18M3 18h18",
  sun:          "M12 3v1m9 8h-1M12 21v-1m-9-8H3m15.36-5.64l-.71.71M6.34 17.66l-.71.71M17.66 17.66l.71.71M6.34 6.34l.71.71M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z",
  moon:         "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  logout:       "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v1",
  shield:       "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

/* ── Nav items config ─────────────────────────────────────────────────────── */
const NAV_MODULES = [
  { label: "Home",      href: "/",            icon: "home" as const },
  { label: "Portfolio", href: "/about",       icon: "portfolio" as const },
  { label: "Bills",     href: "/households",  icon: "bills" as const },
  { label: "Forum",     href: "/communities", icon: "forum" as const },
];

const NAV_ACCOUNT = [
  { label: "Settings",  href: "/settings/profile", icon: "settings" as const },
];

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
function NavItem({
  href,
  icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: keyof typeof ICONS;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      data-active={active ? "true" : undefined}
      className={styles.navItemLink}
      style={{
        color: active ? "var(--accent)" : "var(--text-2)",
        background: active ? "var(--accent-subtle)" : undefined,
        fontWeight: active ? "600" : "400",
      }}
    >
      {active && (
        <span style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: "3px",
          height: "18px",
          background: "var(--accent)",
          borderRadius: "0 2px 2px 0",
        }} />
      )}
      <span style={{ flexShrink: 0, marginLeft: active ? "0" : "0" }}>
        <Icon path={ICONS[icon]} size={16} />
      </span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function Sidebar({
  collapsed,
  onToggle,
  displayName,
  avatarUrl,
  pathname,
  role,
}: {
  collapsed: boolean;
  onToggle: () => void;
  displayName: string | null;
  avatarUrl: string | null;
  pathname: string;
  role?: string | null;
}) {
  const initials = displayName
    ? displayName.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    : "?";
  const logout = useLogout();

  return (
    <aside style={{
      width: collapsed ? "60px" : "220px",
      minWidth: collapsed ? "60px" : "220px",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      transition: "width 240ms cubic-bezier(0.16,1,0.3,1), min-width 240ms cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden",
      position: "sticky",
      top: 0,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <Link href="/" className={styles.sidebarLogoLink}
      style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: collapsed ? "0 14px" : "0 16px",
        gap: "10px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
        textDecoration: "none",
      }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        {!collapsed && (
          <span style={{
            fontFamily: "var(--ff-display)",
            fontWeight: "700",
            fontSize: "15px",
            color: "var(--text)",
            letterSpacing: "-0.015em",
          }}>
            Portfolio
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {!collapsed && (
          <p style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 8px 8px",
          }}>
            Modules
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_MODULES.map(item => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>

        <div style={{ height: "1px", background: "var(--border)", margin: "12px 4px" }} />

        {!collapsed && (
          <p style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 8px 8px",
          }}>
            Account
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_ACCOUNT.map(item => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname.startsWith("/settings")}
              collapsed={collapsed}
            />
          ))}
          {role === "Admin" && (
            <NavItem
              href="/admin"
              icon="shield"
              label="Admin"
              active={pathname.startsWith("/admin")}
              collapsed={collapsed}
            />
          )}
        </div>
      </nav>

      {/* Bottom controls */}
      <div style={{
        padding: "12px 8px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}>
        {/* Logout */}
        {displayName && (
          <button
            onClick={logout}
            title="Log out"
            className={styles.sidebarLogoutBtn}
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <Icon path={ICONS.logout} size={16} />
            {!collapsed && <span>Log out</span>}
          </button>
        )}
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={styles.sidebarToggleBtn}
          style={{
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <Icon path={collapsed ? ICONS.chevronRight : ICONS.chevronLeft} size={16} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

/* ── TopBar ───────────────────────────────────────────────────────────────── */
const typeStyles: Record<"success" | "error" | "info", React.CSSProperties> = {
  success: {
    background: "var(--success-s)",
    border: "1px solid oklch(68% 0.18 152 / 0.35)",
    color: "var(--success)",
  },
  error: {
    background: "var(--danger-s)",
    border: "1px solid oklch(62% 0.21 22 / 0.35)",
    color: "var(--danger)",
  },
  info: {
    background: "var(--surface)",
    border: "1px solid var(--border-2)",
    color: "var(--text)",
  },
};

function TopBar({
  displayName,
  avatarUrl,
  onMenuClick,
  notifications,
  removeNotification,
  markRead,
  markAllRead,
}: {
  displayName: string | null;
  avatarUrl: string | null;
  onMenuClick: () => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}) {
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        bellRef.current && !bellRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  const initials = displayName
    ? displayName.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header style={{
      height: "56px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: "12px",
      flexShrink: 0,
    }}>
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="mobile-only"
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "34px",
          height: "34px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          background: "transparent",
          color: "var(--text-2)",
        }}
      >
        <Icon path={ICONS.menu} size={16} />
      </button>

      {/* Mobile brand */}
      <Link
        href="/"
        className="mobile-only"
        style={{
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span style={{
          fontFamily: "var(--ff-display)",
          fontWeight: "700",
          fontSize: "15px",
          color: "var(--text)",
          letterSpacing: "-0.015em",
        }}>Portfolio</span>
      </Link>

      <div style={{ flex: 1 }} />

      {/* Notification bell */}
      <div style={{ position: "relative" }}>
        <button
          ref={bellRef}
          onClick={() => setBellOpen(o => !o)}
          data-open={bellOpen ? "true" : undefined}
          className={styles.topbarBellBtn}
          style={{
            background: bellOpen ? "var(--surface-2)" : undefined,
            color: bellOpen ? "var(--text)" : undefined,
          }}
          aria-label={`Notifications${notifications.length > 0 ? ` (${notifications.length})` : ""}`}
        >
          <Icon path={ICONS.bell} size={16} />
          {notifications.length > 0 && (
            <span style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              minWidth: "14px",
              height: "14px",
              borderRadius: "9999px",
              background: "var(--accent)",
              border: "1.5px solid var(--surface)",
              fontSize: "9px",
              fontWeight: "700",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 2px",
            }}>
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        {bellOpen && (
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "320px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-lg)",
              zIndex: 200,
              overflow: "hidden",
            }}
          >
            <div style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>
                Notifications
              </span>
              {notifications.length > 0 && (
                <button
                  className={styles.topbarClearBtn}
                  onClick={() => { markAllRead(); notifications.forEach(n => removeNotification(n.id)); }}
                >
                  Clear all
                </button>
              )}
            </div>
            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "var(--text-3)",
                }}>
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      ...typeStyles[n.type],
                      margin: "8px",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {n.title && (
                        <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "2px", fontFamily: "var(--ff-display)" }}>
                          {n.title}
                        </div>
                      )}
                      <div style={{ fontSize: "12px", lineHeight: "1.4" }}>{n.message}</div>
                      {n.deepLink && (
                        <Link
                          href={n.deepLink}
                          onClick={() => { markRead(n.id); removeNotification(n.id); setBellOpen(false); }}
                          style={{
                            marginTop: "4px",
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: "500",
                            color: "var(--accent)",
                            textDecoration: "underline",
                          }}
                        >
                          View
                        </Link>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { markRead(n.id); removeNotification(n.id); }}
                      aria-label="Dismiss"
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "inherit", opacity: 0.5, fontSize: "12px", padding: "0",
                        flexShrink: 0, lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Avatar / login */}
      {displayName ? (
        <Link
          href="/settings/profile"
          className={styles.topbarAvatarLink}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            borderRadius: "12px",
            padding: "4px 8px 4px 4px",
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              style={{ width: "32px", height: "32px", borderRadius: "9999px", objectFit: "cover", border: "2px solid var(--surface)" }}
            />
          ) : (
            <span style={{
              width: "32px",
              height: "32px",
              borderRadius: "9999px",
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700",
              fontFamily: "var(--ff-display)",
              border: "2px solid var(--surface)",
            }}>
              {initials}
            </span>
          )}
          <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-2)" }}>
            {displayName}
          </span>
        </Link>
      ) : (
        <Link
          href="/login"
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--accent)",
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: "8px",
            background: "var(--accent-subtle)",
            transition: "background 110ms",
          }}
        >
          Sign in
        </Link>
      )}
    </header>
  );
}

/* ── Bottom nav for mobile ────────────────────────────────────────────────── */
function BottomNav({ pathname, displayName }: { pathname: string; displayName: string | null }) {
  const logout = useLogout();
  const items = [
    { label: "Home",      href: "/",                 icon: "home" as const },
    { label: "Portfolio", href: "/about",             icon: "portfolio" as const },
    { label: "Bills",     href: "/households",        icon: "bills" as const },
    { label: "Forum",     href: "/communities",       icon: "forum" as const },
    { label: "Settings",  href: "/settings/profile",  icon: "settings" as const },
  ];

  return (
    <nav
      className="mobile-only"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "80px",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
        zIndex: 50,
      }}
    >
      {items.map(item => {
        const active = item.href === "/"
          ? pathname === "/"
          : item.href === "/settings/profile"
          ? pathname.startsWith("/settings")
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "8px 16px",
              borderRadius: "12px",
              textDecoration: "none",
              color: active ? "var(--accent)" : "var(--text-3)",
              minWidth: "44px",
              minHeight: "44px",
              justifyContent: "center",
            }}
          >
            <Icon path={ICONS[item.icon]} size={20} />
            <span style={{ fontSize: "10px", fontWeight: active ? "600" : "400" }}>{item.label}</span>
          </Link>
        );
      })}
      {displayName && (
        <button
          onClick={logout}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "8px 16px",
            borderRadius: "12px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--danger)",
            minWidth: "44px",
            minHeight: "44px",
            justifyContent: "center",
          }}
        >
          <Icon path={ICONS.logout} size={20} />
          <span style={{ fontSize: "10px", fontWeight: "400" }}>Log out</span>
        </button>
      )}
    </nav>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export type AppShellProps = {
  children: React.ReactNode;
  displayName: string | null;
  avatarUrl: string | null;
  role?: string | null;
  subnav?: React.ReactNode;
};

export function AppShell({ children, displayName, avatarUrl, role, subnav }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { notifications, removeNotification, markRead, markAllRead } = useNotificationsContext();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          displayName={displayName}
          avatarUrl={avatarUrl}
          pathname={pathname}
          role={role}
        />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "oklch(0% 0 0 / 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 40,
            }}
          />
          <div
            className="lg:hidden"
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 50,
            }}
          >
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              displayName={displayName}
              avatarUrl={avatarUrl}
              pathname={pathname}
              role={role}
            />
          </div>
        </>
      )}

      {/* Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar
          displayName={displayName}
          avatarUrl={avatarUrl}
          onMenuClick={() => setMobileOpen(o => !o)}
          notifications={notifications}
          removeNotification={removeNotification}
          markRead={markRead}
          markAllRead={markAllRead}
        />
        {subnav}
        <main className="app-main" style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 32px",
          background: "var(--bg)",
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }} className="page-enter">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav pathname={pathname} displayName={displayName} />

      <NotificationsToaster />
    </div>
  );
}