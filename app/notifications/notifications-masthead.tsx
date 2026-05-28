import { MastheadRow } from "@/components/editorial";

"use client";

/**
 * <NotificationsMasthead> — layout-level masthead for /notifications.
 *
 * No sub-nav (the filter tabs inside the page are client-state, not route
 * tabs) and no top-level action button — the page-level "Mark all read"
 * lives next to the headline because its enabled-state depends on data
 * the masthead doesn't see.
 */
export function NotificationsMasthead() {
  return <MastheadRow desk="Notifications Desk" />;
}
