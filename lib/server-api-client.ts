/**
 * Server-side fetch helper for Next.js RSC (React Server Components).
 *
 * The browser-side `api` client uses `CLIENT_API` + `credentials: "include"`,
 * which only works in the browser. Server components must:
   *   - Hit the internal `SERVER_API` URL (localhost:3000 in dev, internal Docker hostname in prod)
 *   - Manually forward the incoming `Cookie` header for authenticated routes
 *
 * NOTE: this module deliberately does NOT import `next/headers`. Some files
 * in this module's import-closure (e.g. lib/api/identity.ts → hooks/use-identity.ts)
 * are also reachable from client components. Pulling in `next/headers` here
 * would break the client build with:
 *   "You're importing a component that needs next/headers."
 *
 * For RSC code that wants a one-shot `Cookie:` header, import
 * `getCookieHeader` from `@/lib/server-cookies` (server-only).
 */

import { SERVER_API } from "./api-url";

export async function serverFetch<T>(
  path: string,
  cookieHeader?: string,
): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API}${path}`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}
