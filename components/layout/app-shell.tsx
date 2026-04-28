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
  bell:         "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
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
  onToggleTheme,
  theme,
  displayName,
  avatarUrl,
  pathname,
  role,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onToggleTheme: () => void;
  theme: "dark" | "light";
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
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      transition: "width 240ms cubic-bezier(0.16,1,0.3,1), min-width 240ms cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden",
      flexShrink: 0,
    }}>

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
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={styles.sidebarToggleBtn}
          style={{
            justifyContent: collapsed ? "center" : "flex-start",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            marginBottom: "4px",
          }}
        >
          <Icon path={theme === "dark" ? ICONS.sun : ICONS.moon} size={16} />
          {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
        </button>
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
      {/* Mobile hamburger — visible below md (sidebar is hidden there) */}
      <button
        onClick={onMenuClick}
        className="flex md:hidden"
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

      {/* Brand — always visible in topbar (desktop: logo left of content; mobile: shown since sidebar is hidden) */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
        }}
      >
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, var(--accent), var(--accent-v))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span style={{
          fontFamily: "var(--ff-display)",
          fontWeight: "800",
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
              position: "fixed",
              top: "64px",
              right: "16px",
              width: "min(320px, calc(100vw - 32px))",
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
function BottomNav({ pathname }: { pathname: string }) {
  const items = [
    { label: "Home",      href: "/",                 icon: "home" as const },
    { label: "Portfolio", href: "/about",             icon: "portfolio" as const },
    { label: "Bills",     href: "/households",        icon: "bills" as const },
    { label: "Forum",     href: "/communities",       icon: "forum" as const },
    { label: "Settings",  href: "/settings/profile",  icon: "settings" as const },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Mobile navigation"
      className="mobile-only"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        alignItems: "stretch",
        justifyContent: "space-around",
        padding: "0",
        paddingBottom: "env(safe-area-inset-bottom, 6px)",
        zIndex: 80,
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
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              padding: "6px 4px",
              textDecoration: "none",
              color: active ? "var(--accent)" : "var(--text-3)",
              minHeight: "44px",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {/* Active pill indicator */}
            <div style={{
              width: "44px",
              height: "26px",
              borderRadius: "var(--r-full)",
              background: active ? "var(--accent-subtle)" : "transparent",
              transition: "background 200ms",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Icon path={ICONS[item.icon]} size={18} />
            </div>
            <span style={{
              fontSize: "10px",
              fontWeight: active ? "600" : "400",
              fontFamily: "var(--ff-body)",
            }}>{item.label}</span>
          </Link>
        );
      })}
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { notifications, removeNotification, markRead, markAllRead } = useNotificationsContext();

  // Load persisted collapsed + theme state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    // On tablet (768–1023px) always start collapsed per spec
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    if (saved === "true" || isTablet) setCollapsed(true);
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Full-width top bar */}
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

      {/* Row: sidebar + main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Desktop / tablet sidebar */}
        <div className="hidden md:block" style={{ height: "100%" }}>
          <Sidebar
            collapsed={collapsed}
            onToggle={toggleCollapsed}
            onToggleTheme={toggleTheme}
            theme={theme}
            displayName={displayName}
            avatarUrl={avatarUrl}
            pathname={pathname}
            role={role}
          />
        </div>

        {/* Mobile sidebar drawer — fixed below topbar */}
        {mobileOpen && (
          <>
            <div
              className="md:hidden"
              onClick={() => setMobileOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                top: "56px",
                background: "oklch(0% 0 0 / 0.6)",
                backdropFilter: "blur(4px)",
                zIndex: 40,
              }}
            />
            <div
              className="md:hidden"
              style={{
                position: "fixed",
                left: 0,
                top: "56px",
                bottom: 0,
                zIndex: 50,
              }}
            >
              <Sidebar
                collapsed={false}
                onToggle={() => setMobileOpen(false)}
                onToggleTheme={toggleTheme}
                theme={theme}
                displayName={displayName}
                avatarUrl={avatarUrl}
                pathname={pathname}
                role={role}
              />
            </div>
          </>
        )}

        <main className="app-main" style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "clip",
          background: "var(--bg)",
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }} className="page-enter">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav pathname={pathname} />

      <NotificationsToaster />
    </div>
  );
}