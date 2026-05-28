/**
 * Notification categorisation — buckets a backend `eventType` string into
 * the filter tabs on /notifications. Substring-matched on a lowercased
 * eventType so the backend can introduce new event types without us
 * shipping a frontend change to surface them.
 *
 * Lives separately from `editorial-copy.ts` because this is a domain
 * projection (event-type → filter), not a copy generator.
 */
type NotificationCategory = "mentions" | "household" | "forum" | "other";

const HOUSEHOLD_TOKENS = ["household", "expense", "chore", "settle", "calendar"];
const FORUM_TOKENS = ["forum", "thread", "comment", "reply", "community", "vote"];

export function categorizeNotification(eventType: string): NotificationCategory {
  const t = (eventType ?? "").toLowerCase();
  if (t.includes("mention")) return "mentions";
  if (HOUSEHOLD_TOKENS.some((k) => t.includes(k))) return "household";
  if (FORUM_TOKENS.some((k) => t.includes(k))) return "forum";
  return "other";
}
