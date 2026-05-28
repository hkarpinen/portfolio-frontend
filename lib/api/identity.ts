import { z } from "zod";
import { api } from "@/lib/api-client";
import { parsedServerFetch } from "@/lib/server-api-client";
import { MeSchema, AdminUserSchema } from "@/types/identity";

// ─── Current user (client + server) ───────────────────────────────────────────

export const fetchMe = () => api.parsed.get("/api/identity/me", MeSchema);

export const fetchMeServer = (cookieHeader: string) =>
  parsedServerFetch("/api/identity/me", MeSchema, cookieHeader);

export const logout = () => api.post<void>("/api/identity/logout");

// ─── Auth flows ───────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const login = (payload: LoginPayload) =>
  api.post<void>("/api/identity/login", payload);

export interface RegisterPayload {
  email: string;
  displayName: string;
  password: string;
  captchaToken: string;
}

export const register = (payload: RegisterPayload) =>
  api.post<void>("/api/identity/register", payload);

export const confirmEmail = (userId: string, token: string) =>
  api.post<void>("/api/identity/confirm-email", { userId, token });

export const resendConfirmationEmail = (email: string) =>
  api.post<void>("/api/identity/resend-confirmation", { email });

export const forgotPassword = (email: string) =>
  api.post<void>("/api/identity/forgot-password", { email });

export const resetPassword = (userId: string, token: string, newPassword: string) =>
  api.post<void>("/api/identity/reset-password", { userId, token, newPassword });

const DemoStartedSchema = z.object({ demoExpiresAt: z.string() });

export const startDemo = (captchaToken: string) =>
  api.parsed.post("/api/identity/demo/start", DemoStartedSchema, { captchaToken });

// ─── Password / profile updates ───────────────────────────────────────────────

export const updatePassword = (currentPassword: string, newPassword: string) =>
  api.put<void>("/api/identity/password", { currentPassword, newPassword });

/**
 * Partial update of the current user. Backend tolerates omitted fields — only
 * sent properties are written. Used by the account form, the email form, and
 * the avatar-URL setter.
 */
export interface UpdateMePayload {
  displayName?: string;
  email?: string;
  avatarUrl?: string | null;
}

export const updateMe = (payload: UpdateMePayload) =>
  api.put<void>("/api/identity/me", payload);

const AvatarUploadResponseSchema = z.object({ avatarUrl: z.string() });

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.parsed.upload("/api/identity/me/avatar", AvatarUploadResponseSchema, formData);
};

// ─── Two-factor ───────────────────────────────────────────────────────────────

/**
 * The backend has shipped three field names for the QR data across versions
 * (qrCodeUrl, qrCode, otpAuthUrl). The schema accepts all three optionally;
 * the consumer falls back through them in order. Once the .NET side settles
 * on one, prune the other two and the validation gets stricter for free.
 */
export const Enable2FAResponseSchema = z.object({
  qrCodeUrl: z.string().optional(),
  qrCode: z.string().optional(),
  otpAuthUrl: z.string().optional(),
});
export type Enable2FAResponse = z.infer<typeof Enable2FAResponseSchema>;

export const enable2FA = () =>
  api.parsed.post("/api/identity/2fa/enable", Enable2FAResponseSchema);

export const confirm2FA = (code: string) =>
  api.post<void>("/api/identity/2fa/confirm", { code });

export const verify2FA = (code: string) =>
  api.post<void>("/api/identity/2fa/verify", { code });

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const SessionItemSchema = z.object({
  sessionId: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  location: z.string().nullable(),
  lastActiveAt: z.string(),
  isCurrent: z.boolean(),
});
export type SessionItem = z.infer<typeof SessionItemSchema>;

const SessionsListSchema = z.object({ sessions: z.array(SessionItemSchema) });

export const fetchSessions = () => api.parsed.get("/api/identity/sessions", SessionsListSchema);

export const signOutSession = (sessionId: string) =>
  api.post<void>(`/api/identity/sessions/${sessionId}/revoke`, {});

export const signOutAllOtherSessions = () =>
  api.post<void>("/api/identity/sessions/revoke-others", {});

// ─── Admin ────────────────────────────────────────────────────────────────────

export const fetchAdminUsers = (page = 1, pageSize = 50) =>
  api.parsed.get(
    `/api/identity/admin/users?page=${page}&pageSize=${pageSize}`,
    z.array(AdminUserSchema),
  );

export const banUser = (userId: string) => api.post(`/api/identity/admin/users/${userId}/ban`, {});

export const changeUserRole = (userId: string, role: string) =>
  api.post(`/api/identity/admin/users/${userId}/role`, { role });
