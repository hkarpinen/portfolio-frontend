import { ErrorSplash } from "@/components/editorial";

"use client";

export default function FinanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorSplash error={error} reset={reset} kicker="Finance · Error" />;
}
