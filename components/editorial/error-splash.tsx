"use client";

import React, { useEffect } from "react";
import { Alert } from "./alert";
import { Btn } from "./button";
import { Icon } from "./icon";

/**
 * <ErrorSplash> — full-route error boundary content.
 *
 * Renders as the body of a route segment's `error.tsx`. The Next.js error
 * boundary calls `reset()` to retry the failed segment without a full page
 * reload, so the button does the right thing for transient failures.
 *
 * In development mode the raw error message is shown to speed up debugging;
 * in production users see a generic line and a console-logged digest so
 * support can correlate reports to logs.
 */
interface ErrorSplashProps {
  /** The error thrown by the failing route. */
  error: Error & { digest?: string };
  /** Reset the boundary and retry the segment. */
  reset: () => void;
  /** Title shown above the alert, e.g. "Finance". */
  kicker?: string;
}

export function ErrorSplash({ error, reset, kicker = "Something went wrong" }: ErrorSplashProps) {
  useEffect(() => {
    // Surface the error once at boundary mount so dev tools and any error
    // tracker (Sentry/etc.) get a single, attributed report. The next render
    // (after reset) won't re-fire because the effect's deps are the error
    // identity itself.
    console.error("[error boundary]", error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="page-enter flex min-h-[40vh] flex-col items-center justify-center gap-6">
      <p className="ed-label-muted">{kicker}</p>
      <Alert variant="danger" role="alert">
        {isDev
          ? error.message || "An unexpected error occurred."
          : "An unexpected error occurred. Please try again."}
      </Alert>
      {error.digest ? (
        <p className="font-mono text-xs text-ink-3">Reference: {error.digest}</p>
      ) : null}
      <Btn
        type="button"
        variant="primary"
        onClick={reset}
        iconLeft={<Icon name="arrowRight" size={14} />}
      >
        Try again
      </Btn>
    </div>
  );
}
