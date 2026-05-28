import { ErrorSplash } from "@/components/editorial";

"use client";

export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorSplash error={error} reset={reset} kicker="Portfolio · Error" />;
}
