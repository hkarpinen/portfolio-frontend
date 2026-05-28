"use client";

import { ErrorSplash } from "@/components/editorial/error-splash";

export default function MathError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorSplash error={error} reset={reset} kicker="Math · Error" />;
}
