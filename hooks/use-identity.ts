import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ApiError } from "@/lib/api-client";
import {
  fetchMe,
  fetchAdminUsers,
  banUser,
  changeUserRole,
  logout as logoutRequest,
} from "@/lib/api/identity";
import { identityKeys } from "@/lib/query-keys";

export function useMe() {
  return useQuery({
    queryKey: identityKeys.me(),
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,           // 5 min — “me” changes rarely
    // Don't keep retrying when the user simply isn't signed in. A 401 from
    // /api/identity/me is the canonical "anonymous" signal.
    retry: (failureCount, err) => {
      if (err instanceof ApiError && err.status === 401) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Logs the user out, clears every cached query (so we don't leak the previous
 * user's data into the next session if they sign back in on the same device),
 * and navigates to /login. The redirect happens even if the network call
 * fails — at that point the access cookie is already invalid client-side or
 * the user just wants out.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      /* swallow — we still want to surface the user back to the login page */
    }
    queryClient.clear();
    router.push("/login");
    router.refresh();
  }, [queryClient, router]);
}

export function useAdminUsers(page = 1) {
  return useQuery({
    queryKey: identityKeys.adminUsers(page),
    queryFn: () => fetchAdminUsers(page),
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => banUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.all });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.all });
    },
  });
}
