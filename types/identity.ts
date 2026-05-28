import { z } from "zod";

// ── UserRole ──────────────────────────────────────────────────────────────────
// Mirrors identity/src/Domain/Aggregates/User/UserRole.cs.

export enum UserRole {
  Demo = "Demo",
  Member = "Member",
  Admin = "Admin",
}

const UserRoleSchema = z.nativeEnum(UserRole);

// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

/**
 * Schema-first DTO for `/api/identity/me`. The type is *derived* from the
 * schema so the runtime check and the static shape can never drift apart.
 * Backend rename of any field surfaces at the api-client boundary as a
 * ResponseValidationError, not later as `undefined.foo`.
 */
export const MeSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  username: z.string().optional(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: UserRoleSchema.optional(),
  /** Surfaced by /api/identity/me so the settings UI can render the
   * authenticator-app status without a parallel fetch. */
  twoFactorEnabled: z.boolean().optional(),
});
export type Me = z.infer<typeof MeSchema>;

export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  role: UserRoleSchema,
  isBanned: z.boolean(),
  isEmailConfirmed: z.boolean(),
  createdAt: z.string(),
});
export type AdminUser = z.infer<typeof AdminUserSchema>;
