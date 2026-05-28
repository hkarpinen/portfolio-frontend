import React from "react";
import { Spinner } from "./spinner";

/**
 * <LoadingSplash> — full-route loading boundary content.
 *
 * Renders as the fallback for a route segment's `loading.tsx`. Editorial
 * single-card layout, centered Spinner, optional kicker/label so each route
 * group can give the user a hint about what's resolving.
 *
 * Server-safe — no client hooks, no event handlers.
 */
interface LoadingSplashProps {
  /** Small kicker above the spinner, e.g. "Finance · Loading". Defaults to "Loading". */
  kicker?: string;
  /** Optional sub-label below the spinner. */
  label?: string;
}

export function LoadingSplash({ kicker = "Loading", label }: LoadingSplashProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="page-enter flex min-h-[40vh] flex-col items-center justify-center gap-5"
    >
      <p className="ed-label-muted">{kicker}</p>
      <Spinner size={32} className="text-ink" />
      {label ? <p className="text-sm text-ink-3">{label}</p> : null}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
