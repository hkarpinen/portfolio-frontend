"use client";

import { createContext, useContext } from "react";
import { useMe } from "@/hooks/use-identity";
import {
  useNotifications,
  type Notification,
  type ToastNotification,
  type NotificationType,
} from "@/hooks/use-notifications";

interface NotificationsContextValue {
  notifications: Notification[];
  toasts: ToastNotification[];
  addNotification: (
    message: string,
    type?: NotificationType,
    extras?: { title?: string; deepLink?: string | null; id?: string; isRead?: boolean },
  ) => string;
  removeNotification: (id: string) => void;
  removeToast: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotificationsContext(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationsContext must be used within NotificationsProvider");
  return ctx;
}

/**
 * Mounts a single SSE connection for the lifetime of the root layout.
 * Derives the authenticated state from the React Query `useMe()` cache so
 * that the SSE stream opens/closes reactively — without needing a hard
 * refresh — whenever the user logs in or out via client-side navigation.
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe();
  const value = useNotifications({ connect: !!me });
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
