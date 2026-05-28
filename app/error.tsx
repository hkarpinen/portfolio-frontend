import { ErrorSplash } from "@/components/editorial";

"use client";

/**
 * Root-level error boundary — catches anything that bubbles past a route
 * group's own error.tsx (or pages that aren't under one, like the landing).
 *
 * Distinct from `global-error.tsx` which replaces the document for layout
 * failures. This file relies on the root layout still being mountable.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorSplash error={error} reset={reset} kicker="Something went wrong" />;
}
