import { useQuery } from "@tanstack/react-query";
import { fetchGroupLedger, fetchAccountStatement } from "@/lib/api/ledger";
import { financeKeys } from "@/lib/query-keys";

export function useGroupLedger(groupId: string) {
  return useQuery({
    queryKey: financeKeys.groupLedger(groupId),
    queryFn: () => fetchGroupLedger(groupId),
    staleTime: 30_000,
    enabled: !!groupId,
    // 404 = no ledger opened for this group yet; treat as "empty", don't retry.
    retry: false,
  });
}

export function useAccountStatement(groupId: string, accountId: string) {
  return useQuery({
    queryKey: financeKeys.accountStatement(groupId, accountId),
    queryFn: () => fetchAccountStatement(groupId, accountId),
    staleTime: 30_000,
    enabled: !!groupId && !!accountId,
    retry: false,
  });
}
