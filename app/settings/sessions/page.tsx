"use client";

import { useEffect, useState, useCallback } from "react";
import { Btn, Alert, EmptyState } from "@/components/editorial";
import { Icon } from "@/components/editorial/icon";
import {
  fetchSessions,
  signOutSession,
  signOutAllOtherSessions,
  type SessionItem,
} from "@/lib/api/identity";
import { timeAgo } from "@/lib/utils";

/** Parse a user-agent string into a friendly "Browser · OS" label without external deps. */
function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown device";
  const s = ua.toLowerCase();

  const browser =
    s.includes("edg/") || s.includes("edge/") ? "Edge"
    : s.includes("chrome/") && !s.includes("chromium") ? "Chrome"
    : s.includes("safari/") && !s.includes("chrome") ? "Safari"
    : s.includes("firefox/") ? "Firefox"
    : s.includes("opera/") || s.includes("opr/") ? "Opera"
    : "Browser";

  const os =
    s.includes("iphone") || s.includes("ipad") ? "iOS"
    : s.includes("android") ? "Android"
    : s.includes("mac os x") || s.includes("macos") ? "macOS"
    : s.includes("windows") ? "Windows"
    : s.includes("linux") ? "Linux"
    : "Unknown OS";

  return `${browser} · ${os}`;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState<string | null>(null);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchSessions()
      .then((res) => setSessions(res.sessions ?? []))
      .catch(() => {
        // TODO(handoff8): /api/identity/sessions endpoint may not be implemented yet — show empty state
        setSessions([]);
        setError(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSignOut = async (sessionId: string) => {
    setSigningOut(sessionId);
    try {
      await signOutSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      setNotice("Session signed out.");
    } catch {
      setError("Failed to sign out session. Please try again.");
    } finally {
      setSigningOut(null);
    }
  };

  const handleSignOutAll = async () => {
    setSigningOutAll(true);
    try {
      await signOutAllOtherSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setNotice("All other sessions signed out.");
    } catch {
      setError("Failed to sign out other sessions. Please try again.");
    } finally {
      setSigningOutAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="page-enter flex flex-col gap-8">
      <div>
        <h1 className="text-md font-semibold text-ink mb-1">Active sessions</h1>
        <p className="text-base text-ink-2">
          These devices are currently signed in to your account. Sign out anywhere you don&apos;t recognize.
        </p>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {notice && <Alert variant="success">{notice}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
      </div>

      {loading ? (
        <div className="bg-paper-2 border-ink p-5">
          <p className="text-ink-3 text-base">Loading sessions…</p>
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          glyph={<Icon name="shield" size={24} strokeWidth={1.5} />}
          title="No sessions found"
          body="Active login sessions will appear here."
        />
      ) : (
        <div
          className="border-ink bg-paper-2"
          role="table"
          aria-label="Active login sessions"
        >
          {/* Table header */}
          <div
            className="grid border-b border-ink bg-paper-2"
            style={{ gridTemplateColumns: "1fr 140px 140px 100px" }}
            role="row"
          >
            <div className="py-4 px-5" role="columnheader"><span className="ed-label-muted">Device</span></div>
            <div className="py-4 px-4" role="columnheader"><span className="ed-label-muted">Location</span></div>
            <div className="py-4 px-4" role="columnheader"><span className="ed-label-muted">Last active</span></div>
            <div className="py-4 px-4" role="columnheader" aria-label="Actions" />
          </div>

          {/* Session rows */}
          {sessions.map((s, idx) => (
            <div
              key={s.sessionId}
              className={`grid items-center${idx < sessions.length - 1 ? " border-b border-[var(--rule-soft)]" : ""}`}
              style={{ gridTemplateColumns: "1fr 140px 140px 100px" }}
              role="row"
            >
              <div className="py-5 px-5 flex flex-col gap-1" role="cell">
                <span className="text-base font-medium text-ink">
                  {parseUserAgent(s.userAgent)}
                </span>
                {s.isCurrent && (
                  <span
                    aria-label="This is your current device"
                    className="inline-block text-sm font-semibold uppercase tracking-widest text-ink bg-paper px-[8px] py-[3px] border border-ink self-start"
                    style={{ fontSize: "0.65rem" }}
                  >
                    This device
                  </span>
                )}
              </div>
              <div className="py-5 px-4" role="cell">
                <span className="text-base text-ink-2">{s.location ?? "—"}</span>
              </div>
              <div className="py-5 px-4" role="cell">
                <span className="text-base text-ink-2">
                  {s.isCurrent ? "Now" : timeAgo(s.lastActiveAt)}
                </span>
              </div>
              <div className="py-5 px-4 flex justify-end" role="cell">
                {!s.isCurrent && (
                  <Btn
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleSignOut(s.sessionId)}
                    disabled={signingOut === s.sessionId}
                    aria-label={`Sign out ${parseUserAgent(s.userAgent)} session`}
                  >
                    {signingOut === s.sessionId ? "Signing out…" : "Sign out"}
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && otherSessions.length > 0 && (
        <div className="flex items-center gap-4">
          <Btn
            variant="outline"
            type="button"
            onClick={handleSignOutAll}
            disabled={signingOutAll}
          >
            {signingOutAll ? "Signing out…" : "Sign out all other sessions"}
          </Btn>
          <p className="text-sm text-ink-3">
            {otherSessions.length} other {otherSessions.length === 1 ? "session" : "sessions"} active
          </p>
        </div>
      )}
    </div>
  );
}
