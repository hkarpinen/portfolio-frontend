"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useNotificationsContext, NotificationsProvider } from "@/components/layout/notifications-provider";
import { NotificationsToaster } from "@/components/layout/notifications-toaster";
import { Sidebar } from "./sidebar-nav";
import { TopBarStack } from "./top-bar";

/* ── Storage ─────────────────────────────────────────────────────────────────*/
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

/* ── Section resolver ────────────────────────────────────────────────────────*/
function resolveSection(pathname: string): { kicker: string; title: string; subtitle?: string } {
  if (pathname === "/") return { kicker: "Section", title: "Front Page", subtitle: "Overview" };
  if (pathname.startsWith("/about")) return { kicker: "Portfolio", title: "About the Author", subtitle: "Profile & Projects" };
  if (pathname.startsWith("/contact")) return { kicker: "Portfolio", title: "Contact", subtitle: "Write a Letter" };
  if (pathname.startsWith("/bills")) return { kicker: "Ledger · Page B-1", title: "The Ledger", subtitle: "Household & Chores" };
  if (pathname.startsWith("/dashboard")) return { kicker: "Ledger", title: "Dashboard", subtitle: "Overview" };
  if (pathname.startsWith("/expenses")) return { kicker: "Finance · Expenses", title: "Finance", subtitle: "Expenses & Payments" };
  if (pathname.startsWith("/income")) return { kicker: "Finance · Income", title: "Finance", subtitle: "Income" };
  if (pathname.startsWith("/forum")) return { kicker: "Letters · Community", title: "Letters", subtitle: "Threaded Discussions" };
  if (pathname.startsWith("/convert")) return { kicker: "Math · Utilities", title: "Convert.", subtitle: "Unit Conversion" };
  if (pathname.startsWith("/weather")) return { kicker: "Geography · Live conditions", title: "Weather.", subtitle: "Current Conditions" };
  if (pathname.startsWith("/settings")) return { kicker: "Account", title: "Subscription", subtitle: "Settings" };
  if (pathname.startsWith("/admin")) return { kicker: "Admin", title: "Moderation", subtitle: "Mod Queue" };
  return { kicker: "Section", title: "The Stack." };
}

/* ── Mobile bottom strip ─────────────────────────────────────────────────────*/
function BottomStrip({ pathname }: { pathname: string }) {
  const cells = [
    { label: "Home",    href: "/" },
    { label: "Bills",   href: "/bills" },
    { label: "Finance", href: "/expenses" },
    { label: "Letters", href: "/forum" },
    { label: "Account", href: "/settings/profile" },
  ];
  return (
    <nav aria-label="Mobile navigation" className="mobile-only fixed bottom-0 left-0 right-0 z-[80] bg-paper pb-[env(safe-area-inset-bottom, 4px)]" style={{ borderTop: "2px solid var(--ink)" }}>
      {cells.map((cell, i) => {
        const active = cell.href === "/" ? pathname === "/" : pathname.startsWith(cell.href);
        return (
          <Link
            key={cell.href}
            href={cell.href}
            aria-current={active ? "page" : undefined}
            className="flex-1 flex items-center justify-center min-h-[44] py-5 px-2 no-underline font-mono text-sm uppercase tracking-[0.18em] cursor-pointer"
            style={{ background: active ? "var(--ink)" : "transparent", color: active ? "var(--paper)" : "var(--ink)", borderRight: i < cells.length - 1 ? "1.5px solid var(--ink)" : undefined, fontWeight: active ? 700 : 500, transition: "background var(--dur-fast), color var(--dur-fast)" }}
          >
            {cell.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────────*/
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

      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:block h-full">
          <Sidebar
            collapsed={collapsed}
            onToggle={toggleCollapsed}
            displayName={displayName}
            avatarUrl={avatarUrl}
            pathname={pathname}
            role={role}
          />
        </div>

        <main className="app-main flex-1 overflow-y-auto overflow-x-clip bg-paper p-[clamp(20px,_2vw,_48px)_clamp(24px,_4vw,_80px)]">
          <div className="page-enter page-container max-w-[clamp(900px, 92%, 1600px)] mx-auto relative">
            {children}
          </div>
        </main>
      </div>

      <BottomStrip pathname={pathname} />
      <NotificationsToaster />
    </div>
  );
}
