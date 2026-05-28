"use client";

import { ErrorSplash } from "@/components/editorial";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorSplash error={error} reset={reset} kicker="Auth · Error" />;
}
