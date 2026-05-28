"use client";

import { Alert, Btn, EmptyState, Icon } from "@/components/editorial";
import { useState } from "react";

import {
  useSessions,
  useSignOutSession,
  useSignOutAllOtherSessions,
} from "@/hooks/use-identity";
import type { SessionItem } from "@/lib/api/identity";
import { timeAgo } from "@/lib/utils";

/** Parse a user-agent string into a friendly "Browser · OS" label without external deps. */
function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown device";
  const s = ua.toLowerCase();

  const browser =
    s.includes("edg/") || s.includes("edge/")
      ? "Edge"
      : s.includes("chrome/") && !s.includes("chromium")
        ? "Chrome"
        : s.includes("safari/") && !s.includes("chrome")
          ? "Safari"
          : s.includes("firefox/")
            ? "Firefox"
            : s.includes("opera/") || s.includes("opr/")
              ? "Opera"
              : "Browser";

  const os =
    s.includes("iphone") || s.includes("ipad")
      ? "iOS"
      : s.includes("android")
        ? "Android"
        : s.includes("mac os x") || s.includes("macos")
          ? "macOS"
          : s.includes("windows")
            ? "Windows"
            : s.includes("linux")
              ? "Linux"
              : "Unknown OS";

  return `${browser} · ${os}`;
}

export default function SessionsPage() {
  // /api/identity/sessions may not be wired everywhere; useSessions tolerates
  // 4xx via retry:false and we render an empty state in that branch.
  const sessionsQuery = useSessions();
  const signOut = useSignOutSession();
  const signOutAll = useSignOutAllOtherSessions();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = sessionsQuery.isLoading;
  // A failed fetch falls through to "no sessions" — same UX the previous
  // imperative load() rendered. We don't surface fetchError to keep the
  // page useful when the endpoint isn't deployed.
  const sessions: SessionItem[] = sessionsQuery.data?.sessions ?? [];
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  const handleSignOut = (sessionId: string) => {
    setError(null);
    signOut.mutate(sessionId, {
      onSuccess: () => setNotice("Session signed out."),
      onError: () => setError("Failed to sign out session. Please try again."),
    });
  };

  const handleSignOutAll = () => {
    setError(null);
    signOutAll.mutate(undefined, {
      onSuccess: () => setNotice("All other sessions signed out."),
      onError: () => setError("Failed to sign out other sessions. Please try again."),
    });
  };

  return (
    <div className="page-enter flex flex-col gap-8">
      <div>
        <h1 className="mb-1 text-md font-semibold text-ink">Active sessions</h1>
        <p className="text-base text-ink-2">
          These devices are currently signed in to your account. Sign out anywhere you don&apos;t
          recognize.
        </p>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {notice && <Alert variant="success">{notice}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
      </div>

      {isLoading ? (
        <div className="border-ink bg-paper-2 p-5">
          <p className="text-base text-ink-3">Loading sessions…</p>
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          glyph={<Icon name="shield" size={24} strokeWidth={1.5} />}
          title="No sessions found"
          body="Active login sessions will appear here."
        />
      ) : (
        <div className="border-ink bg-paper-2" role="table" aria-label="Active login sessions">
          {/* Table header */}
          <div
            className="grid border-b border-ink bg-paper-2"
            style={{ gridTemplateColumns: "1fr 140px 140px 100px" }}
            role="row"
          >
            <div className="px-5 py-4" role="columnheader">
              <span className="ed-label-muted">Device</span>
            </div>
            <div className="px-4 py-4" role="columnheader">
              <span className="ed-label-muted">Location</span>
            </div>
            <div className="px-4 py-4" role="columnheader">
              <span className="ed-label-muted">Last active</span>
            </div>
            <div className="px-4 py-4" role="columnheader" aria-label="Actions" />
          </div>

          {/* Session rows */}
          {sessions.map((s, idx) => (
            <div
              key={s.sessionId}
              className={`grid items-center${idx < sessions.length - 1 ? "border-b border-rule-soft" : ""}`}
              style={{ gridTemplateColumns: "1fr 140px 140px 100px" }}
              role="row"
            >
              <div className="flex flex-col gap-1 px-5 py-5" role="cell">
                <span className="text-base font-medium text-ink">
                  {parseUserAgent(s.userAgent)}
                </span>
                {s.isCurrent && (
                  <span
                    aria-label="This is your current device"
                    className="inline-block self-start border border-ink bg-paper px-[8px] py-[3px] text-sm font-semibold uppercase tracking-widest text-ink"
                    style={{ fontSize: "0.65rem" }}
                  >
                    This device
                  </span>
                )}
              </div>
              <div className="px-4 py-5" role="cell">
                <span className="text-base text-ink-2">{s.location ?? "—"}</span>
              </div>
              <div className="px-4 py-5" role="cell">
                <span className="text-base text-ink-2">
                  {s.isCurrent ? "Now" : timeAgo(s.lastActiveAt)}
                </span>
              </div>
              <div className="flex justify-end px-4 py-5" role="cell">
                {!s.isCurrent && (
                  <Btn
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleSignOut(s.sessionId)}
                    disabled={signOut.isPending && signOut.variables === s.sessionId}
                    aria-label={`Sign out ${parseUserAgent(s.userAgent)} session`}
                  >
                    {signOut.isPending && signOut.variables === s.sessionId
                      ? "Signing out…"
                      : "Sign out"}
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && otherSessions.length > 0 && (
        <div className="flex items-center gap-4">
          <Btn
            variant="outline"
            type="button"
            onClick={handleSignOutAll}
            disabled={signOutAll.isPending}
          >
            {signOutAll.isPending ? "Signing out…" : "Sign out all other sessions"}
          </Btn>
          <p className="text-sm text-ink-3">
            {otherSessions.length} other {otherSessions.length === 1 ? "session" : "sessions"}{" "}
            active
          </p>
        </div>
      )}
    </div>
  );
}
