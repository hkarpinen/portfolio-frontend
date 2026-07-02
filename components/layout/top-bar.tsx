"use client";

import { Icon } from "@/components/editorial";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";

import { Avatar } from "./sidebar-nav";
import type { Notification } from "@/hooks/use-notifications";

/**
 * <TopBarStack> — global app chrome bar
 *
 * Spans the full viewport width (rendered above the body row in AppShell, not
 * inside <main>). Always shows the brand on the left. On viewports below 900px
 * a hamburger sits to the left of the brand and opens the slideout sidebar.
 * The right side carries notifications + avatar (signed in) or sign-in pills
 * (signed out). Breadcrumbs are NOT in this bar — they live in the page
 * content area; see <PageBreadcrumbs />.
 *
 * Visual rules live in /app/globals.css under `.ed-topbar*` /
 * `.ed-topbar-brand*` / `.ed-icon-btn*` / `.ed-popover*` classes.
 */

interface TopBarStackProps {
  displayName: string | null;
  avatarUrl: string | null;
  notifications: Notification[];
  removeNotification: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  /** Unused; kept for drop-in compat. Remove in step 6. */
  section: { kicker: string; title: string; subtitle?: string };
  onOpenMobileMenu?: () => void;
}

export function TopBarStack({
  displayName,
  avatarUrl,
  notifications,
  removeNotification,
  markRead,
  markAllRead,
  onOpenMobileMenu,
}: TopBarStackProps) {
  const unread = notifications.length;

  return (
    <div className="ed-topbar">
      {onOpenMobileMenu && (
        <button
          aria-label="Open menu"
          onClick={onOpenMobileMenu}
          className="ed-topbar-burger min-[900px]:hidden"
        >
          <Icon name="menu" size={20} strokeWidth={2} />
        </button>
      )}

      <Link href="/" aria-label="Hank Karpinen — home" className="ed-topbar-brand">
        <span className="ed-topbar-brand-mark" aria-hidden="true">
          // HK
        </span>
        <span className="ed-topbar-brand-copy">
          <span className="ed-topbar-brand-name">Hank Karpinen</span>
          <span className="ed-topbar-brand-tag">full-stack-engineer</span>
        </span>
      </Link>

      <div className="ed-topbar-spacer" aria-hidden="true" />

      <div className="ed-topbar-actions">
        {displayName === null && (
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/identity/login" className="ed-topbar-pill">
              Sign in
            </Link>
            <Link href="/identity/register" className="ed-topbar-pill ed-topbar-pill-primary">
              Create account
            </Link>
          </div>
        )}

        {displayName !== null && (
          <>
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
                  className="ed-icon-btn"
                >
                  <Icon name="bell" size={18} />
                  {unread > 0 && <span aria-hidden="true" className="ed-icon-btn-dot" />}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content align="end" sideOffset={8} className="ed-popover">
                  <div className="ed-popover-head">
                    <span className="ed-label">Notifications</span>
                    {unread > 0 && (
                      <span className="ed-badge ed-badge-sm ed-badge-danger">{unread} new</span>
                    )}
                  </div>
                  <div className="ed-popover-body">
                    {notifications.length === 0 ? (
                      <div className="ed-popover-empty">— No notifications —</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="ed-popover-item">
                          <p className="ed-meta ed-popover-item-kicker">
                            {n.type === "success"
                              ? "Update"
                              : n.type === "error"
                                ? "Error"
                                : "Notice"}{" "}
                            · just now
                          </p>
                          {n.title && <p className="ed-h4 ed-popover-item-title">{n.title}</p>}
                          <p className="ed-popover-item-msg">{n.message}</p>
                          <div className="ed-popover-item-acts">
                            {n.deepLink && (
                              <Link
                                href={n.deepLink}
                                onClick={() => {
                                  markRead(n.id);
                                  removeNotification(n.id);
                                }}
                                className="ed-popover-item-link"
                              >
                                View{" "}
                                <Icon name="arrowRight" size={13} strokeWidth={2} className="inline align-[-2px]" />
                              </Link>
                            )}
                            <button
                              onClick={() => {
                                markRead(n.id);
                                removeNotification(n.id);
                              }}
                              className="ed-popover-item-dismiss"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="ed-popover-foot">
                      <button
                        onClick={() => {
                          markAllRead();
                          notifications.forEach((n) => removeNotification(n.id));
                        }}
                        className="ed-btn ed-btn-secondary ed-btn-sm ed-btn-block"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <Link href="/identity/settings/profile" aria-label="Open settings" className="ed-topbar-avatar">
              <Avatar name={displayName} url={avatarUrl} size="md" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
