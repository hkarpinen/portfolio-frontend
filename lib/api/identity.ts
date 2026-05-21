import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type { Me, AdminUser } from "@/types/identity";

// ─── Current user (client + server) ───────────────────────────────────────────

export const fetchMe = () => api.get<Me>("/api/identity/me");

export const fetchMeServer = (cookieHeader: string) =>
  serverFetch<Me>("/api/identity/me", cookieHeader);

export const logout = () => api.post<void>("/api/identity/logout");

export const startDemo = () =>
  api.post<{ demoExpiresAt: string }>("/api/identity/demo/start");

// ─── Admin ────────────────────────────────────────────────────────────────────


export const fetchAdminUsers = (page = 1, pageSize = 50) =>
  api.get<AdminUser[]>(`/api/identity/admin/users?page=${page}&pageSize=${pageSize}`);

export const banUser = (userId: string) =>
  api.post(`/api/identity/admin/users/${userId}/ban`, {});

export const changeUserRole = (userId: string, role: string) =>
  api.post(`/api/identity/admin/users/${userId}/role`, { role });
