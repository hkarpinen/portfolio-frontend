import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SERVER_API } from "@/lib/api-url";
import { getCookieHeader } from "@/lib/server-cookies";
import { MeSchema } from "@/types/identity";

/**
 * Canonical server-side auth/session module.
 *
 * Single source of truth for "who is the current user?" on the server.
 * Backed by `GET /api/identity/me` — the backend is the only authority.
 * No JWT decoding, no client state, no fallbacks. Anonymous = `null`.
 *
 * `getSession()` is wrapped in React's `cache()` so a single render pass
 * (layout + nested layouts + page) hits the identity service exactly once.
 */

type Role = "Member" | "Admin";

interface Session {
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string | null;
  role: Role;
}

function normalizeRole(raw: string | undefined): Role {
  // Anything we don't explicitly recognize collapses to the least-privileged
  // role. The backend remains the real authority on what someone may DO;
  // here we only need a value safe to compare against in `requireRole`.
  return raw === "Admin" ? "Admin" : "Member";
}

/**
 * Resolve the current session by calling the backend `/me` endpoint with
 * the request's cookies forwarded.
 *
 * Returns `null` for anonymous users (401/403). Any other failure throws —
 * we deliberately do NOT collapse 5xx / network errors into "anonymous".
 * That would mask outages as logouts.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const cookieHeader = await getCookieHeader();
  if (!cookieHeader) return null;

  const res = await fetch(`${SERVER_API}/api/identity/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403 || res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`identity/me failed with status ${res.status}`);
  }

  // Schema-validate the identity response instead of casting. This module
  // doesn't go through parsedServerFetch because it has its own (anonymous,
  // 500-throws) error policy — but the same MeSchema check applies. A drift
  // here would otherwise silently degrade every authenticated render.
  const me = MeSchema.parse(await res.json());
  return {
    userId: me.id,
    email: me.email,
    // MeSchema.displayName is `string | null | undefined`; the session
    // type is `string | undefined`. Normalise null → undefined here so
    // downstream consumers don't have to branch on both.
    displayName: me.displayName ?? undefined,
    avatarUrl: me.avatarUrl ?? null,
    role: normalizeRole(me.role),
  };
});

/**
 * Best-effort current path, used for `?from=` round-trips on /login.
 * Falls back to `/` if no x-pathname header is present.
 */
async function currentFromPath(): Promise<string> {
  try {
    const h = await headers();
    const pathname = h.get("x-pathname") ?? h.get("x-invoke-path") ?? "/";
    const search = h.get("x-search") ?? "";
    return pathname + search;
  } catch {
    return "/";
  }
}

/**
 * Require an authenticated session. Anonymous → redirect to /login.
 * Use at the top of any protected layout / page / server action.
 */
export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    const from = encodeURIComponent(await currentFromPath());
    redirect(`/login?from=${from}`);
  }
  return session;
}

/**
 * Require a session with a specific role. Wrong role → notFound() so we
 * don't disclose the existence of role-gated routes to non-privileged users.
 *
 * The backend remains the real enforcer. This is server-side routing only.
 */
export async function requireRole(role: Role): Promise<Session> {
  const session = await requireUser();
  if (session.role !== role) notFound();
  return session;
}

/**
 * Inverse of requireUser(): authed users on `(auth)` routes get bounced to
 * the app. Used by the `(auth)/layout.tsx` guard.
 */
export async function requireAnonymous(redirectTo: string = "/forum"): Promise<void> {
  const session = await getSession();
  if (session) redirect(redirectTo);
}
