"use client";

import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { Icon } from "@/components/editorial/icon";
import { Avatar } from "./sidebar-nav";
import type { Notification } from "@/hooks/use-notifications";

export function TopBarStack({
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
      {/* Row 1 — Date strip */}
      <div className="bg-ink text-paper py-[6px] px-[18px] font-mono text-sm uppercase tracking-[0.24em] flex justify-between items-center gap-5">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{dateStr}</span>
        <span className="flex items-center gap-4 shrink-0">
          <span className="pulse-dot" aria-hidden="true" />
          <span>Live</span>
        </span>
        <span className="hidden md:inline shrink-0 tracking-wide">96 DPI</span>
      </div>

      {/* Row 2 — Section row */}
      <div className="min-h-[72] flex items-center py-[8px] px-[22px] gap-6 bg-paper">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm uppercase tracking-[0.24em] mb-1">— {section.kicker} —</p>
          <div className="flex items-baseline gap-5 flex-wrap">
            <span className="font-serif italic text-4xl font-normal text-ink leading-none tracking-snug">{section.title}</span>
            {section.subtitle && (
              <span className="font-mono text-sm text-ink-3 uppercase tracking-wide">· {section.subtitle}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {displayName === null && (
            <div className="flex items-stretch shrink-0 border-ink">
              <Link href="/login" className="no-underline font-mono uppercase text-ink px-[14px] py-[6px] flex items-center" style={{ fontSize: "0.625rem", letterSpacing: "0.22em", borderRight: "1.5px solid var(--ink)" }}>Sign in</Link>
              <Link href="/register" className="no-underline font-mono uppercase bg-ink text-paper px-[14px] py-[6px] flex items-center" style={{ fontSize: "0.625rem", letterSpacing: "0.22em" }}>Register</Link>
            </div>
          )}

          {displayName !== null && (
            <>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
                    className="relative w-[38px] h-[38px] bg-transparent cursor-pointer flex items-center justify-center text-ink shrink-0 border-ink"
                    style={{transition: "background var(--dur-fast), color var(--dur-fast)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ink)"; (e.currentTarget as HTMLElement).style.color = "var(--paper)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
                  >
                    <Icon name="bell" size={15} />
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
                    className="w-[min(320px, calc(100vw - 32px))] bg-paper shadow-stamp z-[200] overflow-hidden"
                    style={{ border: "2px solid var(--ink)", animation: "scaleIn 160ms var(--ease-spring)", transformOrigin: "top right" }}
                  >
                    <div className="py-6 px-8 bg-paper-2 flex justify-between items-center" style={{ borderBottom: "1.5px solid var(--ink)" }}>
                      <span className="font-mono text-sm uppercase tracking-[0.22em] font-bold text-ink">Wire Service</span>
                      {unread > 0 && <span className="font-mono text-sm font-medium text-paper bg-ink py-[1px] px-[8px] uppercase tracking-mono" style={{ border: "1px solid var(--ink)" }}>{unread} new</span>}
                    </div>
                    <div className="max-h-[360] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-16 px-8 text-center font-mono text-sm text-ink-3 uppercase tracking-wide">— No dispatches —</div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={n.id} className="py-6 px-8 cursor-pointer" style={{ borderBottom: i < notifications.length - 1 ? "1px solid var(--ink-3)" : undefined }}>
                            <p className="font-mono text-sm text-red uppercase tracking-[0.22em] mb-2">
                              {n.type === "success" ? "Update" : n.type === "error" ? "Error" : "Notice"} · just now
                            </p>
                            {n.title && <p className="font-serif italic text-xl leading-[1.15] mb-2 text-ink">{n.title}</p>}
                            <p className="font-body text-md text-ink-2 leading-[1.45]">{n.message}</p>
                            <div className="flex gap-4 mt-4">
                              {n.deepLink && (
                                <Link href={n.deepLink} onClick={() => { markRead(n.id); removeNotification(n.id); }} className="font-mono text-sm text-red uppercase tracking-[0.16em]">View →</Link>
                              )}
                              <button onClick={() => { markRead(n.id); removeNotification(n.id); }} className="bg-transparent cursor-pointer font-mono text-sm text-ink-3 uppercase tracking-mono" style={{ border: "none" }}>Dismiss</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="py-5 px-8" style={{ borderTop: "1.5px solid var(--ink)" }}>
                        <button onClick={() => { markAllRead(); notifications.forEach(n => removeNotification(n.id)); }} className="font-mono text-sm uppercase tracking-[0.16em] bg-transparent text-ink py-[5px] px-[10px] cursor-pointer w-full border-ink">
                          Clear all dispatches
                        </button>
                      </div>
                    )}
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <Link href="/settings/profile" aria-label="Open subscription settings" className="no-underline block">
                <Avatar name={displayName} url={avatarUrl} size={36} />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
