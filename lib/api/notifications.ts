import { z } from "zod";
import { api } from "@/lib/api-client";

// Mirrors notifications/src/Application/Dtos/NotificationItemDto.cs. The SSE
// stream emits items of this exact shape — re-using the schema there means
// both the REST history fetch AND the live stream parse through the same
// runtime check.
export const NotificationItemSchema = z.object({
  eventId: z.string(),
  recipientUserId: z.string(),
  eventType: z.string(),
  title: z.string(),
  message: z.string().nullable(),
  deepLink: z.string().nullable(),
  occurredAt: z.string(),
  isRead: z.boolean(),
});
export type NotificationItem = z.infer<typeof NotificationItemSchema>;

export const NotificationListResponseSchema = z.object({
  items: z.array(NotificationItemSchema),
});
export type NotificationListResponse = z.infer<typeof NotificationListResponseSchema>;

export const fetchNotifications = () =>
  api.parsed.get("/api/notifications", NotificationListResponseSchema);

export const markNotificationRead = (eventId: string) =>
  fetch(`/api/notifications/${eventId}/read`, {
    method: "PUT",
    credentials: "include",
    keepalive: true, // survives navigation so the request isn't cancelled
  }).catch(() => {});

export const markAllNotificationsRead = () =>
  fetch("/api/notifications/read-all", {
    method: "PUT",
    credentials: "include",
    keepalive: true,
  }).catch(() => {});
