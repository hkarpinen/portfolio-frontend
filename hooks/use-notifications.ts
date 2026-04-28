"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from "@/lib/api/notifications";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
  deepLink?: string | null;
  isRead: boolean;
}

export type ToastNotification = Notification;

const AUTO_DISMISS_MS = 5000;
// Use an absolute URL so the EventSource always goes through nginx (which has
// proxy_buffering off) rather than through Next.js rewrites, which buffer SSE.
const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "";
const STREAM_URL = `${API_BASE}/api/notifications/stream`;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

function severityFor(eventType: string | undefined): NotificationType {
  if (!eventType) return "info";
  if (eventType.includes("error") || eventType.includes("failed")) return "error";
  if (eventType.includes("success") || eventType.includes("created")) return "success";
  return "info";
}

export function useNotifications(options?: { connect?: boolean }) {
  const connect = options?.connect ?? true;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = dismissTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      dismissTimers.current.delete(id);
    }
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const scheduleAutoDismiss = useCallback(
    (id: string) => {
      const timer = setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
      dismissTimers.current.set(id, timer);
    },
    [removeToast],
  );

  const upsertNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notification.id)) return prev;
      return [...prev, notification];
    });
  }, []);

  const addToast = useCallback(
    (notification: ToastNotification) => {
      setToasts((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [...prev, notification];
      });
      if (!notification.isRead) scheduleAutoDismiss(notification.id);
    },
    [scheduleAutoDismiss],
  );

  const addNotification = useCallback(
    (
      message: string,
      type: NotificationType = "info",
      extras?: { title?: string; deepLink?: string | null; id?: string; isRead?: boolean },
    ) => {
      const id = extras?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const notification = {
        id,
        message,
        type,
        title: extras?.title,
        deepLink: extras?.deepLink ?? null,
        isRead: extras?.isRead ?? false,
      };
      upsertNotification(notification);
      addToast(notification);
      return id;
    },
    [addToast, upsertNotification],
  );

  // Mark a single notification as read both locally and on the server.
  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setToasts((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    markNotificationRead(id);
  }, []);

  // Mark all notifications as read both locally and on the server.
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setToasts((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markAllNotificationsRead();
  }, []);

  const upsertNotificationRef = useRef(upsertNotification);
  const addToastRef = useRef(addToast);
  useEffect(() => {
    upsertNotificationRef.current = upsertNotification;
    addToastRef.current = addToast;
  }, [addToast, upsertNotification]);

  // Fetch persisted notification history on mount so the bell survives refresh.
  useEffect(() => {
    if (!connect) return;
    fetchNotifications()
      .then((res) => {
        const items = res?.items ?? [];
        for (const item of [...items].reverse()) {
          if (item.isRead) continue;
          upsertNotificationRef.current({
            id: item.eventId,
            message: item.message ?? "",
            type: severityFor(item.eventType),
            title: item.title,
            deepLink: item.deepLink,
            isRead: item.isRead,
          });
        }
      })
      .catch(() => {/* SSE stream will carry new items */});
  }, [connect]);

  // Subscribe to the SSE stream for live notifications.
  useEffect(() => {
    if (!connect) return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    let source: EventSource | null = null;
    let retryDelay = RECONNECT_BASE_MS;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function openSource() {
      if (cancelled) return;

      source = new EventSource(STREAM_URL, { withCredentials: true });

      // On every (re)connect, fetch history to pick up any notifications that
      // were dispatched while the SSE was down. The backend also replays unread
      // history on connect, but calling fetchNotifications here covers the race
      // where the DB has been updated but the replay hasn't streamed yet.
      fetchNotifications()
        .then((res) => {
          if (cancelled) return;
          for (const item of (res?.items ?? []).filter((n) => !n.isRead).reverse()) {
            upsertNotificationRef.current({
              id: item.eventId,
              message: item.message ?? "",
              type: severityFor(item.eventType),
              title: item.title,
              deepLink: item.deepLink,
              isRead: item.isRead,
            });
          }
        })
        .catch(() => {/* SSE stream will carry new items */});

      const handle = (event: MessageEvent) => {
        // Reset backoff on a successful message.
        retryDelay = RECONNECT_BASE_MS;

        try {
          const parsed = JSON.parse(event.data) as NotificationItem;
          const notification = {
            id: parsed.eventId,
            message: parsed.message ?? "",
            type: severityFor(parsed.eventType),
            title: parsed.title,
            deepLink: parsed.deepLink,
            isRead: parsed.isRead,
          };
          upsertNotificationRef.current(notification);
          addToastRef.current(notification);
        } catch {
          // Ignore malformed payloads.
        }
      };

      source.addEventListener("notification", handle as EventListener);
      source.onmessage = handle;

      // Reconnect with exponential backoff on any connection error.
      source.onerror = () => {
        source?.close();
        source = null;
        if (!cancelled) {
          retryTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, RECONNECT_MAX_MS);
            openSource();
          }, retryDelay);
        }
      };
    }

    openSource();

    return () => {
      cancelled = true;
      if (retryTimer !== null) clearTimeout(retryTimer);
      source?.close();
    };
  }, [connect]);

  useEffect(() => {
    const timers = dismissTimers.current;
    return () => {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, []);

  return {
    notifications,
    toasts,
    addNotification,
    removeNotification,
    removeToast,
    markRead,
    markAllRead,
  };
}

