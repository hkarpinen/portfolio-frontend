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

import type { z, ZodTypeAny } from "zod";
import { SERVER_API } from "./api-url";
import { ResponseValidationError } from "./api-client";

export async function serverFetch<T>(path: string, cookieHeader?: string): Promise<T | null> {
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

/**
 * Validated server-side fetch. HTTP-level failures (4xx, 5xx, network) still
 * resolve to `null` — that matches `serverFetch` and gives RSC code its
 * existing `if (!data) notFound()` pattern. A schema mismatch is treated as a
 * contract bug and *thrown* (ResponseValidationError), so the nearest
 * error.tsx boundary renders rather than silently rendering an empty state.
 */
export async function parsedServerFetch<S extends ZodTypeAny>(
  path: string,
  schema: S,
  cookieHeader?: string,
): Promise<z.infer<S> | null> {
  let raw: unknown;
  try {
    const res = await fetch(`${SERVER_API}${path}`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    if (!res.ok) return null;
    raw = await res.json();
  } catch {
    return null;
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[serverFetch] Response validation failed for ${path}`,
        result.error.issues,
        raw,
      );
    }
    throw new ResponseValidationError(path, result.error.issues);
  }
  return result.data;
}
