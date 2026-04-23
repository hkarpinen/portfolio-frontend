"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  bills:        "M17 9V7a5 5 0 0 0-10 0v2M5 9h14l1 12H4L5 9zm5 4v4m4-4v4",
  forum:        "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  settings:     "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.16-2.4.34-1.02a1 1 0 0 0-.54-1.2l-1.2-.48a5.1 5.1 0 0 0-.52-.86l.22-1.26a1 1 0 0 0-.64-1.1l-1.06-.36a1 1 0 0 0-1.12.38l-.7 1.06a5 5 0 0 0-1 0l-.7-1.06a1 1 0 0 0-1.12-.38l-1.06.36a1 1 0 0 0-.64 1.1l.22 1.26a5.1 5.1 0 0 0-.52.86l-1.2.48a1 1 0 0 0-.54 1.2l.34 1.02a1 1 0 0 0 .96.68h.06a5 5 0 0 0 .7 1.2l-.2 1.26a1 1 0 0 0 .64 1.1l1.06.36a1 1 0 0 0 1.12-.38l.7-1.06a5 5 0 0 0 1 0l.7 1.06a1 1 0 0 0 1.12.38l1.06-.36a1 1 0 0 0 .64-1.1l-.2-1.26a5 5 0 0 0 .7-1.2h.06a1 1 0 0 0 .96-.68z",
  bell:         "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-9.33-5.004M12 21a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zM6 11a6 6 0 0 1 6-6",
  chevronRight: "M9 18l6-6-6-6",
  chevronLeft:  "M15 18l-6-6 6-6",
  menu:         "M3 12h18M3 6h18M3 18h18",
  sun:          "M12 3v1m9 8h-1M12 21v-1m-9-8H3m15.36-5.64l-.71.71M6.34 17.66l-.71.71M17.66 17.66l.71.71M6.34 6.34l.71.71M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z",
  moon:         "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  logout:       "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v1",
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
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        borderRadius: "12px",
        textDecoration: "none",
        position: "relative",
        transition: "background 110ms cubic-bezier(0.4,0,0.2,1), color 110ms cubic-bezier(0.4,0,0.2,1)",
        color: active ? "var(--accent)" : "var(--text-2)",
        background: active ? "var(--accent-subtle)" : "transparent",
        fontFamily: "var(--ff-body)",
        fontSize: "13px",
        fontWeight: active ? "600" : "400",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
          (e.currentTarget as HTMLElement).style.color = "var(--text)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
        }
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
}: {
  collapsed: boolean;
  onToggle: () => void;
  displayName: string | null;
  avatarUrl: string | null;
  pathname: string;
}) {
  const initials = displayName
    ? displayName.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    : "?";

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
      <Link href="/" style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: collapsed ? "0 14px" : "0 16px",
        gap: "10px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
        textDecoration: "none",
        transition: "background 110ms",
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
      >
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-v) 100%)",
          flexShrink: 0,
        }} />
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
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "10px",
            padding: "9px 12px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "var(--text-3)",
            fontSize: "13px",
            transition: "background 110ms, color 110ms",
            width: "100%",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
            (e.currentTarget as HTMLElement).style.color = "var(--text)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
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
function TopBar({
  displayName,
  avatarUrl,
  onMenuClick,
}: {
  displayName: string | null;
  avatarUrl: string | null;
  onMenuClick: () => void;
}) {
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

      <div style={{ flex: 1 }} />

      {/* Notification bell */}
      <button
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "34px",
          height: "34px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          background: "transparent",
          color: "var(--text-2)",
          transition: "background 110ms, color 110ms",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
          (e.currentTarget as HTMLElement).style.color = "var(--text)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
        }}
        aria-label="Notifications"
      >
        <Icon path={ICONS.bell} size={16} />
        <span style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          width: "6px",
          height: "6px",
          borderRadius: "9999px",
          background: "var(--accent)",
          border: "1.5px solid var(--surface)",
        }} />
      </button>

      {/* Avatar / login */}
      {displayName ? (
        <Link
          href="/settings/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            borderRadius: "12px",
            padding: "4px 8px 4px 4px",
            transition: "background 110ms",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
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
    </nav>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export type AppShellProps = {
  children: React.ReactNode;
  displayName: string | null;
  avatarUrl: string | null;
};

export function AppShell({ children, displayName, avatarUrl }: AppShellProps) {
  const pathname = usePathname();
  // Start collapsed on lg (1024–1279px), expanded on xl+ (1280px+)
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1280 : true
  );
  const [mobileOpen, setMobileOpen] = useState(false);

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
        />
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
      <BottomNav pathname={pathname} />
    </div>
  );
}
