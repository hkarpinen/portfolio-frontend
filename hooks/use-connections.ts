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
import { financeKeys, connectionKeys } from "@/lib/query-keys";

// Re-export so existing call sites that imported these from the hook file
// continue to compile. The canonical home is now @/lib/query-keys.
export { connectionKeys };

/** @deprecated Use connectionKeys */
export const plaidKeys = connectionKeys;

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
  onSuccess: (
    publicToken: string,
    metadata: { institution?: { institution_id: string; name: string } | null },
  ) => void;
  onExit?: (err: unknown, metadata: unknown) => void;
}

export function usePlaidLink() {
  const queryClient = useQueryClient();
  const [isLaunching, setIsLaunching] = useState(false);
  const handleRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => () => handleRef.current?.destroy(), []);

  const exchangeMutation = useMutation({
    mutationFn: exchangePublicToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.items() });
      queryClient.invalidateQueries({ queryKey: connectionKeys.recurring() });
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

/** Connected bank accounts (previously usePlaidItems) */
export function useConnectedAccounts() {
  return useQuery({
    queryKey: connectionKeys.items(),
    queryFn: () => listConnections().then((r) => r.connections as Connection[]),
  });
}

/** @deprecated Use useConnectedAccounts */
export const usePlaidItems = useConnectedAccounts;

export function useSyncPlaidItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.items() });
      queryClient.invalidateQueries({ queryKey: connectionKeys.recurring() });
    },
  });
}

export function useUnlinkPlaidItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.items() });
      queryClient.invalidateQueries({ queryKey: connectionKeys.recurring() });
    },
  });
}

/** Bank sync suggestions (previously useRecurringStreams) */
export function useBankSyncSuggestions() {
  return useQuery({
    queryKey: connectionKeys.recurring(),
    queryFn: () => listSuggestions().then((r) => r.suggestions as RecurringSuggestion[]),
  });
}

/** @deprecated Use useBankSyncSuggestions */
export const useRecurringStreams = useBankSyncSuggestions;

export function useRefreshRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshSuggestions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectionKeys.recurring() }),
  });
}

/** Accept a bank sync suggestion (previously useAcceptRecurring) */
export function useAcceptSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptSuggestion,
    // Accepting a bank-sync suggestion creates a real expense or income
    // record on the backend, so the finance caches need to repopulate. Going
    // through `financeKeys` keeps this invariant: change the key shape in
    // one place and every consumer follows.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.recurring() });
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() });
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.overview() });
    },
  });
}

/** @deprecated Use useAcceptSuggestion */
export const useAcceptRecurring = useAcceptSuggestion;

/** Account balance from connected bank account */
export function useAccountBalance() {
  return useQuery({
    queryKey: financeKeys.accountBalance(),
    queryFn: async () => null, // TODO: implement when backend endpoint is ready
    enabled: false,
  });
}
