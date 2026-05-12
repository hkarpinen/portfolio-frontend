"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLinkToken,
  exchangePublicToken,
  listConnections,
  syncConnection,
  listSuggestions,
  refreshSuggestions,
  acceptSuggestion,
  disconnectConnection,
  type Connection,
  type RecurringSuggestion,
} from "@/lib/api/plaid";

// React-Query keys live next to the hook so the settings page never has to know about cache shape.
export const plaidKeys = {
  all: ["plaid"] as const,
  items: () => [...plaidKeys.all, "items"] as const,
  recurring: () => [...plaidKeys.all, "recurring"] as const,
};

/**
 * Loads Plaid Link's JS bundle from Plaid's CDN exactly once per page,
 * then resolves with the global `Plaid` object. We avoid bundling
 * react-plaid-link to keep our dependency surface small — the loader
 * is small (~30 lines) and Plaid Link is a pure-browser script.
 */
function loadPlaidLink(): Promise<PlaidLinkGlobal> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = (window as any).Plaid as PlaidLinkGlobal | undefined;
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    script.onload = () => resolve((window as any).Plaid as PlaidLinkGlobal);
    script.onerror = () => reject(new Error("Failed to load Plaid Link script."));
    document.head.appendChild(script);
  });
}

interface PlaidLinkGlobal {
  create: (config: PlaidLinkConfig) => { open: () => void; exit: () => void; destroy: () => void };
}

interface PlaidLinkConfig {
  token: string;
  onSuccess: (publicToken: string, metadata: { institution?: { institution_id: string; name: string } | null }) => void;
  onExit?: (err: unknown, metadata: unknown) => void;
}

/**
 * Provides everything the settings UI needs to render the "Connect bank" button:
 * a one-shot link-token mint, Plaid Link launch, and the public-token exchange.
 *
 * The hook is intentionally idempotent: clicking the button repeatedly while a
 * link is in flight is a no-op (gated by `isLaunching`).
 */
export function usePlaidLink() {
  const queryClient = useQueryClient();
  const [isLaunching, setIsLaunching] = useState(false);
  const handleRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => () => handleRef.current?.destroy(), []);

  const exchangeMutation = useMutation({
    mutationFn: exchangePublicToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plaidKeys.items() });
      queryClient.invalidateQueries({ queryKey: plaidKeys.recurring() });
    },
  });

  const launch = async () => {
    if (isLaunching) return;
    setIsLaunching(true);
    try {
      const [{ linkToken }, Plaid] = await Promise.all([createLinkToken(), loadPlaidLink()]);
      const handle = Plaid.create({
        token: linkToken,
        onSuccess: (publicToken, metadata) => {
          exchangeMutation.mutate({
            publicToken,
            institutionId: metadata.institution?.institution_id ?? null,
            institutionName: metadata.institution?.name ?? null,
          });
        },
        onExit: () => setIsLaunching(false),
      });
      handleRef.current = handle;
      handle.open();
    } catch (err) {
      console.error("Failed to launch Plaid Link", err);
      setIsLaunching(false);
    } finally {
      // open() is non-blocking; we reset the flag eagerly so a closed-modal user
      // can re-open within the same session without a forced refresh.
      setTimeout(() => setIsLaunching(false), 1000);
    }
  };

  return {
    launch,
    isLaunching,
    isExchanging: exchangeMutation.isPending,
    exchangeError: exchangeMutation.error,
  };
}

export function usePlaidItems() {
  return useQuery({
    queryKey: plaidKeys.items(),
    queryFn: () => listConnections().then(r => r.connections as Connection[]),
  });
}

export function useSyncPlaidItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plaidKeys.items() });
      queryClient.invalidateQueries({ queryKey: plaidKeys.recurring() });
    },
  });
}

export function useUnlinkPlaidItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plaidKeys.items() });
      queryClient.invalidateQueries({ queryKey: plaidKeys.recurring() });
    },
  });
}

export function useRecurringStreams() {
  return useQuery({
    queryKey: plaidKeys.recurring(),
    queryFn: () => listSuggestions().then(r => r.suggestions as RecurringSuggestion[]),
  });
}

export function useRefreshRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshSuggestions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: plaidKeys.recurring() }),
  });
}

export function useAcceptRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plaidKeys.recurring() });
      // Accepting a stream creates either an Expense or IncomeSource, so refresh
      // the existing finance lists and the overview (which drives the schedule).
      queryClient.invalidateQueries({ queryKey: ["finance", "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "income"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "overview"] });
    },
  });
}
