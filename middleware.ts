import { NextResponse } from "next/server";

/**
 * Middleware is intentionally a no-op for authentication.
 *
 * Authentication and authorization live in server-side route-group layouts
 * via `requireUser()` / `requireRole()` from `lib/auth/session.ts`, which
 * call the backend `/api/identity/me` and treat its response as the only
 * source of truth.
 *
 * Reasons we removed the previous edge guard:
 *   1. It decoded JWTs without verifying the signature, which is a security
 *      smell even if only used for `exp`. Layout-based checks delegate to
 *      the backend (the only authority) instead.
 *   2. It was the *only* check on many pages (admin, mod queues, etc.),
 *      duplicating logic and silently acting as the security boundary.
 *      That is not what middleware is for in App Router.
 *   3. Public-path allow-lists drift away from the actual route layout.
 *      The route-group is the correct place to express "this whole tree
 *      is protected".
 *
 * If you ever need true edge logic (request IDs, geo headers, rate-limit
 * shortcuts), add it here. Do NOT add auth back.
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  // Run on no paths by default. Re-enable when there is a real edge concern.
  matcher: [],
};
