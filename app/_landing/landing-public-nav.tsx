"use client";

import { Btn, Icon } from "@/components/editorial";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";

import { Avatar } from "@/components/layout/sidebar-nav";
import { useNotificationsContext } from "@/components/layout/notifications-provider";
import { NAV_LINKS } from "./landing-config";

/**
 * Top navigation for the landing page. Renders one of two right-side
 * states — anonymous (Sign in + Create account) or signed-in (notifications
 * bell + avatar). The notifications popover is the only piece that needs
 * the notifications context, so it lives here rather than at the top of
 * the landing tree.
 */
export function LandingPublicNav({
  signedIn,
  displayName,
  avatarUrl,
}: {
  signedIn: boolean;
  displayName: string | null;
  avatarUrl: string | null;
}) {
  return (
    <header className="ed-public-nav" role="banner">
      <div className="ed-public-nav-inner">
        <Link href="/" className="ed-public-nav-lockup" aria-label="The Stack & Gazette — home">
          <span className="ed-sidebar-mark" aria-hidden="true">
            SG
          </span>
          <span>
            The Stack <em>&amp;</em> Gazette
          </span>
        </Link>

        <nav aria-label="Site sections" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href} className="ed-public-nav-link">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!signedIn ? (
            <>
              <Btn href="/identity/login" variant="secondary" size="sm">
                Sign in
              </Btn>
              <Btn href="/identity/register" variant="primary" size="sm">
                Create account
              </Btn>
            </>
          ) : (
            <SignedInActions displayName={displayName} avatarUrl={avatarUrl} />
          )}
        </div>
      </div>
    </header>
  );
}

function SignedInActions({
  displayName,
  avatarUrl,
}: {
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const { notifications, removeNotification, markRead, markAllRead } = useNotificationsContext();
  const unread = notifications.length;

  return (
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
                      {n.type === "success" ? "Update" : n.type === "error" ? "Error" : "Notice"} ·
                      just now
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
  );
}
