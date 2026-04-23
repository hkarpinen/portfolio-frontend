import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/lib/api/bills";
import { identityKeys } from "@/lib/query-keys";

export function useMe() {
  return useQuery({
    queryKey: identityKeys.me(),
    queryFn: fetchMe,
    staleTime: Infinity,
  });
}
