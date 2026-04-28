import { api } from "@/lib/api-client";

export interface NotificationItem {
  eventId: string;
  recipientUserId: string;
  eventType: string;
  title: string;
  message: string | null;
  deepLink: string | null;
  occurredAt: string;
  isRead: boolean;
}

export interface NotificationListResponse {
  items: NotificationItem[];
}

export const fetchNotifications = () =>
  api.get<NotificationListResponse>("/api/notifications");

export const markNotificationRead = (eventId: string) =>
  fetch(`/api/notifications/${eventId}/read`, {
    method: "PUT",
    credentials: "include",
    keepalive: true,       // survives navigation so the request isn't cancelled
  }).catch(() => {});

export const markAllNotificationsRead = () =>
  fetch("/api/notifications/read-all", {
    method: "PUT",
    credentials: "include",
    keepalive: true,
  }).catch(() => {});
