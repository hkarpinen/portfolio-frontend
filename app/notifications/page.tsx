"use client";

import { Btn, EmptyState, Icon, SectionHeader } from "@/components/editorial";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/api/notifications";

import { timeAgo } from "@/lib/utils";
import { notificationKeys } from "@/lib/query-keys";
import { notificationsHeadline, notificationsDeck } from "@/lib/notifications/editorial-copy";
import { categorizeNotification } from "@/lib/notifications/categorize";

type Filter = "all" | "mentions" | "household" | "forum";

function Row({ n, onRead }: { n: NotificationItem; onRead: (id: string) => void }) {
  const body = (
    <>
      <div className="row mb-1.5 justify-between">
        <span className="kicker text-[0.58rem]">// {n.title.toUpperCase()}</span>
        <span className="label shrink-0">{timeAgo(n.occurredAt)}</span>
      </div>
      {n.message ? (
        <p className={`font-mono text-[0.78rem] leading-relaxed ${n.isRead ? "text-text-3" : "text-text-2"}`}>
          {n.message}
        </p>
      ) : null}
    </>
  );

  const cls = `notif-item block ${n.isRead ? "" : "unread"}`;

  if (n.deepLink) {
    return (
      <Link
        href={n.deepLink}
        onClick={() => !n.isRead && onRead(n.eventId)}
        className={`${cls} no-underline`}
        aria-label={`${n.isRead ? "" : "Unread: "}${n.title}${n.message ? ` — ${n.message}` : ""}`}
      >
        {body}
      </Link>
    );
  }
  return (
    <div className={cls} role={!n.isRead ? "status" : undefined}>
      {body}
    </div>
  );
}

export default function NotificationsInboxPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading } = useQuery({
    queryKey: notificationKeys.inbox(),
    queryFn: fetchNotifications,
  });

  const items = data?.items ?? [];
  const unread = items.filter((n) => !n.isRead).length;

  const counts = {
    all: items.length,
    mentions: items.filter((n) => categorizeNotification(n.eventType) === "mentions").length,
    household: items.filter((n) => categorizeNotification(n.eventType) === "household").length,
    forum: items.filter((n) => categorizeNotification(n.eventType) === "forum").length,
  };

  const visible =
    filter === "all" ? items : items.filter((n) => categorizeNotification(n.eventType) === filter);

  function markRead(id: string) {
    markNotificationRead(id);
    qc.setQueryData<{ items: NotificationItem[] }>(notificationKeys.inbox(), (old) =>
      old ? { items: old.items.map((n) => (n.eventId === id ? { ...n, isRead: true } : n)) } : old,
    );
  }

  async function markAll() {
    await markAllNotificationsRead();
    qc.setQueryData<{ items: NotificationItem[] }>(notificationKeys.inbox(), (old) =>
      old ? { items: old.items.map((n) => ({ ...n, isRead: true })) } : old,
    );
  }

  const TABS: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "mentions", label: "Mentions", count: counts.mentions },
    { key: "household", label: "Household", count: counts.household },
    { key: "forum", label: "Forum", count: counts.forum },
  ];

  const activeTab = TABS.find((t) => t.key === filter);

  return (
    <div className="page-enter flex flex-col gap-6">
      <SectionHeader
        kicker="// SYSTEM · INBOX"
        title={notificationsHeadline({ unread, total: items.length })}
        subtitle={notificationsDeck({ unread })}
        action={
          <Btn
            variant="secondary"
            size="sm"
            onClick={markAll}
            disabled={unread === 0}
            aria-label={
              unread > 0 ? `Mark all ${unread} notifications as read` : "All notifications are read"
            }
          >
            Mark all read
          </Btn>
        }
      />

      <nav role="tablist" aria-label="Filter notifications" className="ed-tabs-list">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={filter === t.key}
            aria-current={filter === t.key ? "page" : undefined}
            onClick={() => setFilter(t.key)}
            className="ed-tab"
          >
            {t.label}
            {t.count > 0 && <span className="ed-tab-count">{t.count}</span>}
          </button>
        ))}
      </nav>

      <section className="flex flex-col gap-4">
        {isLoading ? (
          <p className="ed-label-muted">Loading…</p>
        ) : visible.length === 0 ? (
          items.length === 0 ? (
            <EmptyState
              kicker="// INBOX_EMPTY"
              glyph={<Icon name="bell" size={24} strokeWidth={1.5} />}
              title="Nothing here yet"
              body="Replies, mentions, and household activity will show up here."
            />
          ) : (
            <EmptyState
              kicker={`// ${(activeTab?.label ?? "FILTER").toUpperCase()}_EMPTY`}
              glyph={<Icon name="bell" size={24} strokeWidth={1.5} />}
              title={`Nothing in ${activeTab?.label ?? "this filter"} right now`}
            />
          )
        ) : (
          <div className="card p-0">
            {visible.map((n) => (
              <Row key={n.eventId} n={n} onRead={markRead} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
