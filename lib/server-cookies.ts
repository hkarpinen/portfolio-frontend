import { cookies } from "next/headers";

/**
 * Read the request's cookie store and return a `Cookie:` header string for
 * forwarding to backend services.
 *
 * Server-only: this module imports `next/headers`, so it must never be
 * imported (transitively) from a client component. RSC pages/layouts only.
 *
 * `cookies()` is awaited so this remains forward-compatible with Next 15
 * where the function is asynchronous; in Next 14 awaiting a sync return is
 * a no-op. The return type comes straight from `next/headers`, so no
 * casts are required.
 */
export async function getCookieHeader(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}
