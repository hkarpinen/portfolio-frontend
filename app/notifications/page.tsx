"use client";

import {
  Btn,
  DepartmentHead,
  EditorialPageHead,
  EmptyDispatch,
  EmptyState,
  Icon,
} from "@/components/editorial";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/api/notifications";

import { pluralize, timeAgo } from "@/lib/utils";
import { notificationKeys } from "@/lib/query-keys";
import { notificationsHeadline, notificationsDeck } from "@/lib/notifications/editorial-copy";
import { categorizeNotification } from "@/lib/notifications/categorize";

type Filter = "all" | "mentions" | "household" | "forum";

function Row({ n, onRead }: { n: NotificationItem; onRead: (id: string) => void }) {
  const unreadDot = (
    <span
      className={`mt-3.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "border border-ink-4" : "bg-red"}`}
      aria-label={n.isRead ? undefined : "Unread"}
      title={n.isRead ? undefined : "Unread"}
    />
  );

  const body = (
    <>
      {unreadDot}
      <div className="min-w-0 flex-1">
        <p
          className={`font-body text-md leading-snug ${n.isRead ? "text-ink-2" : "font-medium text-ink"}`}
        >
          {n.title}
          {n.message ? <span className="text-ink-3"> {n.message}</span> : null}
        </p>
        <p className="ed-meta mt-1.5">{timeAgo(n.occurredAt)}</p>
      </div>
    </>
  );

  const cls = `flex gap-4 py-5 border-b border-rule-soft ${n.isRead ? "" : "bg-paper-2 px-3 -mx-3"}`;

  if (n.deepLink) {
    return (
      <Link
        href={n.deepLink}
        onClick={() => !n.isRead && onRead(n.eventId)}
        className={`${cls} group no-underline`}
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
      <EditorialPageHead
        kicker="The Inbox"
        title={notificationsHeadline({ unread, total: items.length })}
        deck={notificationsDeck({ unread })}
      />

      <div className="-mt-2 flex justify-end">
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
      </div>

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
        <DepartmentHead
          kicker={`Filter · ${activeTab?.label ?? "All"}`}
          count={`${visible.length} ${pluralize("item", visible.length)}`}
          title="Notices <em>filed</em>"
        />
        {isLoading ? (
          <p className="ed-label-muted">Loading…</p>
        ) : visible.length === 0 ? (
          items.length === 0 ? (
            <EmptyState
              glyph={<Icon name="bell" size={24} strokeWidth={1.5} />}
              title="Nothing here yet"
              body="Replies, mentions, and household activity will show up here."
            />
          ) : (
            <EmptyDispatch>
              Nothing in <em>{activeTab?.label ?? "this filter"}</em> right now
            </EmptyDispatch>
          )
        ) : (
          <div className="flex flex-col">
            {visible.map((n) => (
              <Row key={n.eventId} n={n} onRead={markRead} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
