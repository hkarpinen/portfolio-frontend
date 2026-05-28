import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, type RenderHookOptions } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * Make a QueryClient that doesn't retry or log. Retrying makes mutation-hook
 * tests flaky (a 500 stub is retried 3× before `onError` fires); logging
 * pollutes the test output for an expected error. One client per test
 * because state leaks otherwise.
 */
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // gcTime stays high: with gcTime: 0, observer-less entries created via
      // setQueryData are GC'd before an async mutation's onSuccess runs,
      // which masks cache-invalidation assertions. The client is recreated
      // per test anyway, so the cost is zero.
      queries: { retry: false, gcTime: Infinity, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function wrapWithClient(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

/**
 * Drop-in `renderHook` that wires up a fresh QueryClient. The client is
 * returned so the test can inspect / mutate the cache directly (e.g.
 * `qc.setQueryData(...)` then assert `qc.getQueryState(...)?.isInvalidated`).
 */
export function renderHookWithClient<Result, Props>(
  hook: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, "wrapper">,
) {
  const queryClient = makeTestQueryClient();
  const result = renderHook(hook, {
    ...options,
    wrapper: wrapWithClient(queryClient),
  });
  return { ...result, queryClient };
}
