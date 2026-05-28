import { z } from "zod";

// ── UserRole ──────────────────────────────────────────────────────────────────
// Mirrors identity/src/Domain/Aggregates/User/UserRole.cs.

export enum UserRole {
  Demo = "Demo",
  Member = "Member",
  Admin = "Admin",
}

const UserRoleSchema = z.enum(UserRole);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema-first DTO for `/api/identity/me`. The type is *derived* from the
 * schema so the runtime check and the static shape can never drift apart.
 * Backend rename of any field surfaces at the api-client boundary as a
 * ResponseValidationError, not later as `undefined.foo`.
 */
export const MeSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  username: z.string().nullish(),
  displayName: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  role: UserRoleSchema.optional(),
  /** Surfaced by /api/identity/me so the settings UI can render the
   * authenticator-app status without a parallel fetch. */
  twoFactorEnabled: z.boolean().optional(),
});
export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullish(),
  role: UserRoleSchema,
  isBanned: z.boolean(),
  isEmailConfirmed: z.boolean(),
  createdAt: z.string(),
});
