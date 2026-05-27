"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/api/notifications";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { DepartmentHead } from "@/components/editorial/department-head";
import { EmptyDispatch } from "@/components/editorial/empty-dispatch";
import { Btn } from "@/components/editorial/button";
import { EmptyState } from "@/components/editorial/empty-state";
import { Icon } from "@/components/editorial/icon";
import { timeAgo } from "@/lib/utils";
import { notificationsHeadline, notificationsDeck } from "@/lib/notifications/editorial-copy";

type Filter = "all" | "mentions" | "household" | "forum";

function categoryOf(eventType: string): Filter | "other" {
  const t = (eventType ?? "").toLowerCase();
  if (t.includes("mention")) return "mentions";
  if (t.includes("household") || t.includes("expense") || t.includes("chore") || t.includes("settle") || t.includes("calendar")) return "household";
  if (t.includes("forum") || t.includes("thread") || t.includes("comment") || t.includes("reply") || t.includes("community") || t.includes("vote")) return "forum";
  return "other";
}

function Row({ n, onRead }: { n: NotificationItem; onRead: (id: string) => void }) {
  const unreadDot = (
    <span
      className={`mt-[7px] w-2 h-2 shrink-0 rounded-full ${n.isRead ? "border border-ink-4" : "bg-red"}`}
      aria-label={n.isRead ? undefined : "Unread"}
      title={n.isRead ? undefined : "Unread"}
    />
  );

  const body = (
    <>
      {unreadDot}
      <div className="flex-1 min-w-0">
        <p className={`font-body text-md leading-snug ${n.isRead ? "text-ink-2" : "text-ink font-medium"}`}>
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
        className={`${cls} no-underline group`}
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
    queryKey: ["notifications", "inbox"],
    queryFn: fetchNotifications,
  });

  const items = data?.items ?? [];
  const unread = items.filter((n) => !n.isRead).length;

  const counts = {
    all: items.length,
    mentions: items.filter((n) => categoryOf(n.eventType) === "mentions").length,
    household: items.filter((n) => categoryOf(n.eventType) === "household").length,
    forum: items.filter((n) => categoryOf(n.eventType) === "forum").length,
  };

  const visible = filter === "all" ? items : items.filter((n) => categoryOf(n.eventType) === filter);

  function markRead(id: string) {
    markNotificationRead(id);
    qc.setQueryData<{ items: NotificationItem[] }>(["notifications", "inbox"], (old) =>
      old ? { items: old.items.map((n) => (n.eventId === id ? { ...n, isRead: true } : n)) } : old
    );
  }

  async function markAll() {
    await markAllNotificationsRead();
    qc.setQueryData<{ items: NotificationItem[] }>(["notifications", "inbox"], (old) =>
      old ? { items: old.items.map((n) => ({ ...n, isRead: true })) } : old
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

      <div className="flex justify-end -mt-2">
        <Btn
          variant="secondary"
          size="sm"
          onClick={markAll}
          disabled={unread === 0}
          aria-label={unread > 0 ? `Mark all ${unread} notifications as read` : "All notifications are read"}
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
          count={`${visible.length} item${visible.length === 1 ? "" : "s"}`}
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
            <EmptyDispatch>Nothing in <em>{activeTab?.label ?? "this filter"}</em> right now</EmptyDispatch>
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
