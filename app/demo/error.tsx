"use client";

import { ErrorSplash } from "@/components/editorial/error-splash";

export default function DemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorSplash error={error} reset={reset} kicker="Demo · Error" />;
}
