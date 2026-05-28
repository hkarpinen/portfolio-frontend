"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  useNotificationsContext,
  NotificationsProvider,
} from "@/components/layout/notifications-provider";
import { NotificationsToaster } from "@/components/layout/notifications-toaster";
import { Sidebar } from "./sidebar-nav";
import { TopBarStack } from "./top-bar";
import { MobileNav } from "./mobile-nav";
import { PageBreadcrumbs } from "./page-breadcrumbs";
import { logout } from "@/lib/api/identity";
import { formatCountdown } from "@/lib/utils";

/**
 * <AppShell> — main app chrome (redesign)
 *
 * All visual rules in /app/globals.css.
 */

const DEMO_EXPIRES_AT_KEY = "demo_expires_at";

/* ── Demo banner ─────────────────────────────────────────────────────────────*/
function useDemoCountdown() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const router = useRouter();
  const expiredRef = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem(DEMO_EXPIRES_AT_KEY);
    if (!raw) return;

    function tick() {
      const ms = new Date(raw!).getTime() - Date.now();
      if (ms <= 0) {
        if (!expiredRef.current) {
          expiredRef.current = true;
          localStorage.removeItem(DEMO_EXPIRES_AT_KEY);
          logout().finally(() => router.replace("/register?reason=demo-expired"));
        }
        setSecondsLeft(0);
        return;
      }
      setSecondsLeft(Math.floor(ms / 1000));
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [router]);

  return secondsLeft;
}

function DemoBanner() {
  const secondsLeft = useDemoCountdown();
  if (secondsLeft === null) return null;
  return (
    <div role="status" className="ed-demo-banner">
      <span>
        Demo session · expires in <b>{secondsLeft > 0 ? formatCountdown(secondsLeft) : "0s"}</b>
      </span>
      <Link href="/register">Create a free account →</Link>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────────*/
type AppShellProps = {
  children: React.ReactNode;
  displayName: string | null;
  avatarUrl: string | null;
  role?: string | null;
  subnav?: React.ReactNode;
  /** Full-width band rendered between the breadcrumb and the page content,
   *  e.g. an editorial <MastheadRow>. See AppShellServer. */
  topBand?: React.ReactNode;
};

export function AppShell(props: AppShellProps) {
  return (
    <NotificationsProvider>
      <AppShellInner {...props} />
    </NotificationsProvider>
  );
}

function AppShellInner({ children, displayName, avatarUrl, role, subnav, topBand }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { notifications, removeNotification, markRead, markAllRead } = useNotificationsContext();

  const section = { kicker: "", title: "" };

  return (
    <div className="ed-app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <DemoBanner />

      <TopBarStack
        displayName={displayName}
        avatarUrl={avatarUrl}
        notifications={notifications}
        removeNotification={removeNotification}
        markRead={markRead}
        markAllRead={markAllRead}
        section={section}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <div className="ed-app-body">
        <div className="hidden h-full min-[900px]:block">
          <Sidebar
            displayName={displayName}
            avatarUrl={avatarUrl}
            pathname={pathname}
            role={role}
          />
        </div>

        <main id="main" tabIndex={-1} className="ed-app-main">
          <div className="ed-app-scroll">
            {/* Breadcrumb is a full-width band: its rule spans the entire
                scroll area, while the breadcrumb text inside it is
                content-width centered. Sits above any section sub-nav. */}
            <PageBreadcrumbs />
            {/* Optional editorial masthead band — rendered at the same
                full-width-band level as the breadcrumb so its rules span
                the scroll area, not just the content column. Pages opt in
                by passing `topBand` to <AppShellServer />. */}
            {topBand}
            <div className="app-main">
              <div className="ed-app-inner page-enter">
                {subnav}
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav pathname={pathname} />
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-sidebar_overlay min-[900px]:hidden"
            style={{ background: "rgba(20,17,10,0.55)" }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-sidebar_nav min-[900px]:hidden">
            <Sidebar
              displayName={displayName}
              avatarUrl={avatarUrl}
              pathname={pathname}
              role={role}
            />
          </div>
        </>
      )}
      <NotificationsToaster />
    </div>
  );
}
