import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";

/** Admin-only routes — never indexed. We `notFound()` non-admins on the
 *  server (see below) so search engines that probe these URLs get 404,
 *  but explicit noindex is belt-and-suspenders. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Admin-only routes. The parent `(portfolio)/layout.tsx` already calls
 * `requireUser()`; here we add the role check. On role mismatch we
 * `notFound()` rather than show a "403" page — non-admins should not be
 * told the route exists.
 *
 * Backend remains the real authority: every admin endpoint enforces the
 * Admin role server-side. This guard exists so the UI stops rendering
 * privileged data to clients that can't act on it anyway.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("Admin");
  return <>{children}</>;
}
