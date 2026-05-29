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

/**
 * Lazy-load Plaid Link's vanilla CDN build. The PlaidLinkGlobal type lives
 * in `types/plaid.d.ts` as a `window.Plaid?` ambient declaration, which
 * eliminates the prior `(window as any).Plaid` casts (audit §1.3).
 */
function loadPlaidLink(): Promise<PlaidLinkGlobal> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.Plaid) return Promise.resolve(window.Plaid);

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    script.onload = () => {
      if (window.Plaid) resolve(window.Plaid);
      else reject(new Error("Plaid Link loaded but window.Plaid is missing."));
    };
    script.onerror = () => reject(new Error("Failed to load Plaid Link script."));
    document.head.appendChild(script);
  });
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

/** Connected bank accounts. */
export function useConnectedAccounts() {
  return useQuery({
    queryKey: connectionKeys.items(),
    queryFn: () => listConnections().then((r) => r.connections as Connection[]),
  });
}

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

