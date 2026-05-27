/**
 * Editorial copy helpers for /notifications.
 *
 * Returned headline strings may contain inline `<em>` for the red italic
 * accent — used by <EditorialPageHead title>.
 */

const num = (n: number) => n.toLocaleString("en-US");

export function notificationsHeadline({
  unread, total,
}: { unread: number; total: number }): string {
  if (total === 0) return `<em>Nothing</em> filed for you yet`;
  if (unread === 0) return `<em>All caught up</em> · ${num(total)} on file`;
  return `<em>${num(unread)}</em> notice${unread === 1 ? "" : "s"} unread`;
}

export function notificationsDeck({
  unread,
}: { unread: number }): string {
  if (unread === 0) {
    return "Threads, replies, settle-ups, household activity — every read.";
  }
  return "Threads, replies, settle-ups, household activity. Click to open, or mark all read.";
}
