"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { identityKeys } from "@/lib/query-keys";

/**
 * Closes the expired-session gap: a session can die *while the user is already inside* a protected
 * route group, and App Router does NOT re-run the layout's `requireUser()` guard on client-side
 * navigations within that segment. The page shell stays rendered while the client-side data fetches
 * start returning 401 — leaving the user stuck on a rendered-but-empty page.
 *
 * The backend's 401 is the only reliable signal that the session is actually dead (independent of
 * any layout/router caching), so we react to it here, centrally: any query or mutation that surfaces
 * a 401 bounces to /identity/login. This composes with the layout guards (which still handle fresh
 * loads and hard navigations) rather than replacing them.
 *
 * One discrimination matters: a 401 is *expected* for an anonymous visitor on a public page (e.g.
 * `useMe()` probing identity). We only treat a 401 as a session EXPIRY when there's a cached `me`,
 * i.e. the user *was* authenticated — otherwise an anonymous visitor would be wrongly redirected.
 */

// Module-level so concurrent 401s (several panels fetching at once) trigger exactly one redirect.
// A hard navigation reloads the module, resetting this naturally.
let redirecting = false;

function handleAuthError(error: unknown, client: QueryClient): void {
  if (!(error instanceof ApiError) || error.status !== 401) return;
  if (typeof window === "undefined" || redirecting) return;
  // Only bounce a session that was actually authenticated — a cached `me` is the proof. Without it
  // this is an anonymous 401 (a public page probing an authed endpoint), which must NOT redirect.
  if (client.getQueryData(identityKeys.me()) == null) return;
  // Already heading to login (or there) — don't loop.
  if (window.location.pathname.startsWith("/identity/login")) return;

  redirecting = true;
  client.clear(); // drop the stale authenticated cache so the next session starts clean
  const from = encodeURIComponent(window.location.pathname + window.location.search);
  // Hard navigation, not router.push: it also blows away App Router's client cache, which is what's
  // replaying the stale authenticated shell in the first place.
  window.location.assign(`/identity/login?from=${from}`);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    let client: QueryClient;
    const onError = (error: unknown) => handleAuthError(error, client);
    client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          // Never retry a 401 — the credentials are dead, retrying just delays the redirect.
          retry: (count, error) =>
            error instanceof ApiError && error.status === 401 ? false : count < 1,
        },
      },
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
    });
    return client;
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
