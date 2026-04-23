"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
  deepLink?: string | null;
}

interface ServerNotification {
  eventId: string;
  eventType: string;
  title?: string;
  message: string;
  deepLink?: string | null;
  occurredAt?: string;
  isRead?: boolean;
}

const AUTO_DISMISS_MS = 5000;
const STREAM_URL = "/api/forum/notifications/stream";

function severityFor(eventType: string | undefined): NotificationType {
  if (!eventType) return "info";
  if (eventType.includes("error") || eventType.includes("failed")) return "error";
  if (eventType.includes("success") || eventType.includes("created")) return "success";
  return "info";
}

export function useNotifications(options?: { connect?: boolean }) {
  const connect = options?.connect ?? true;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeNotification = useCallback((id: string) => {
    const timer = dismissTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      dismissTimers.current.delete(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const scheduleAutoDismiss = useCallback(
    (id: string) => {
      const timer = setTimeout(() => removeNotification(id), AUTO_DISMISS_MS);
      dismissTimers.current.set(id, timer);
    },
    [removeNotification],
  );

  const addNotification = useCallback(
    (
      message: string,
      type: NotificationType = "info",
      extras?: { title?: string; deepLink?: string | null; id?: string },
    ) => {
      const id = extras?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setNotifications((prev) => [
        ...prev,
        { id, message, type, title: extras?.title, deepLink: extras?.deepLink ?? null },
      ]);
      scheduleAutoDismiss(id);
      return id;
    },
    [scheduleAutoDismiss],
  );

  useEffect(() => {
    if (!connect) return;
    if (typeof window === "undefined") return;

    const source = new EventSource(STREAM_URL, { withCredentials: true });

    const handle = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data) as ServerNotification;
        // Skip heartbeats so users don't see a toast every 15 s.
        if (parsed.eventType === "notification.ping") return;
        addNotification(parsed.message, severityFor(parsed.eventType), {
          id: parsed.eventId,
          title: parsed.title,
          deepLink: parsed.deepLink,
        });
      } catch {
        // Ignore malformed payloads.
      }
    };

    source.addEventListener("notification", handle as EventListener);
    source.onmessage = handle;

    return () => {
      source.removeEventListener("notification", handle as EventListener);
      source.close();
    };
  }, [connect, addNotification]);

  useEffect(() => {
    const timers = dismissTimers.current;
    return () => {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}
