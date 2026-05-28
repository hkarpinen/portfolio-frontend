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
  login as loginRequest,
  register as registerRequest,
  confirmEmail as confirmEmailRequest,
  resetPassword as resetPasswordRequest,
  enable2FA as enable2FARequest,
  confirm2FA as confirm2FARequest,
  verify2FA as verify2FARequest,
  updateMe as updateMeRequest,
  updatePassword as updatePasswordRequest,
  uploadAvatar as uploadAvatarRequest,
  fetchSessions,
  signOutSession,
  signOutAllOtherSessions,
  type LoginPayload,
  type RegisterPayload,
  type UpdateMePayload,
} from "@/lib/api/identity";
import { identityKeys } from "@/lib/query-keys";

export function useMe() {
  return useQuery({
    queryKey: identityKeys.me(),
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, // 5 min — “me” changes rarely
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
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.all });
    },
  });
}

// ─── Auth-flow mutations ──────────────────────────────────────────────────────
//
// Each hook owns *only* cache invalidation. Navigation (router.push / refresh)
// stays in the calling component's `mutate(data, { onSuccess })` so the hooks
// don't pull next/navigation into every consumer's mental model.

/**
 * Sign in. On success, invalidate `me` so the next render sees the
 * authenticated identity.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerRequest(payload),
  });
}

/**
 * Confirm a registration token. Successful confirmation does NOT sign the user
 * in — they still hit the login screen — so no cache changes are needed.
 */
export function useConfirmEmail() {
  return useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) =>
      confirmEmailRequest(userId, token),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      userId,
      token,
      newPassword,
    }: {
      userId: string;
      token: string;
      newPassword: string;
    }) => resetPasswordRequest(userId, token, newPassword),
  });
}

/**
 * Verify a 2FA code at sign-in. On success, invalidate `me` so the next render
 * reflects the now-fully-authenticated session.
 */
export function useVerify2FA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => verify2FARequest(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
    },
  });
}

/** Initiate 2FA setup — returns the QR-code URL the component renders. */
export function useEnable2FA() {
  return useMutation({
    mutationFn: () => enable2FARequest(),
  });
}

/** Confirm the TOTP code during 2FA setup. Invalidates `me` so the UI reflects
 * `twoFactorEnabled = true` without a manual refetch. */
export function useConfirm2FA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => confirm2FARequest(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
    },
  });
}

// ─── Profile / credential updates ─────────────────────────────────────────────

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMePayload) => updateMeRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => updatePasswordRequest(currentPassword, newPassword),
  });
}

/**
 * Upload a new avatar. The mutation resolves with the new URL; consumers
 * typically chain `mutateAsync(file)` and feed the URL into a form-state
 * setter (the ImageUpload component needs the URL synchronously).
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAvatarRequest(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
    },
  });
}

// ─── Active sessions (settings/sessions page) ────────────────────────────────

/**
 * Active login sessions for the current user. The audit (§3.5) flagged
 * this as the only real `useEffect`-for-data offender — moving it into
 * React Query brings it into the same cache graph as everything else
 * (auto refetch on focus, single in-flight dedup, predictable invalidation
 * from the revoke mutations below).
 *
 * Note: the underlying endpoint may not exist in every backend deployment
 * (cf. the page's prior TODO). React Query's `retry: false` here keeps the
 * UI from spamming a 404 — the consumer falls back to an empty state.
 */
export function useSessions() {
  return useQuery({
    queryKey: identityKeys.sessions(),
    queryFn: fetchSessions,
    retry: false,
    staleTime: 60_000,
  });
}

export function useSignOutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => signOutSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.sessions() });
    },
  });
}

export function useSignOutAllOtherSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => signOutAllOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityKeys.sessions() });
    },
  });
}
