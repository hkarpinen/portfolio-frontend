import { z } from "zod";
import { pagedResponseSchema } from "./shared";

/**
 * Membership types — a person's relationship to a household.
 *
 * Mirrors household/src/Domain/ValueObjects/ValueObjects.cs `HouseholdRole`
 * and finance/src/Application/Dtos/DashboardDtos.cs `MemberBalanceDto`.
 */

// ── HouseholdRole ─────────────────────────────────────────────────────────────

export enum HouseholdRole {
  Member = "Member",
  Admin = "Admin",
  Owner = "Owner",
}

export const HouseholdRoleSchema = z.nativeEnum(HouseholdRole);

// ── MembershipResponse ────────────────────────────────────────────────────────

export const MembershipResponseSchema = z.object({
  membershipId: z.string(),
  userId: z.string(),
  username: z.string(),
  displayName: z.string().nullish(),
  role: HouseholdRoleSchema,
  joinedAt: z.string(),
  pendingInvitationCode: z.string().nullish(),
});
export type MembershipResponse = z.infer<typeof MembershipResponseSchema>;

// ── MemberBalance ─────────────────────────────────────────────────────────────

/**
 * Per-other-member balance the caller has inside one household.
 *
 * NetSettlement convention from the backend: `totalOwed - totalOwedToYou`, where
 *   - `totalOwed` is what *this member* owes the caller (positive when caller
 *     paid an expense and the other member's split is unpaid)
 *   - `totalOwedToYou` is what the *caller* owes this member
 *
 * So sum(netSettlement) across all returned members:
 *   - positive → caller is net-positive ("YOU'RE OWED")
 *   - negative → caller is net-negative ("YOU OWE")
 *   - zero/empty → fully settled / no shared expenses
 */
export const MemberBalanceSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  totalOwed: z.number(),
  totalOwedToYou: z.number(),
  netSettlement: z.number(),
  currency: z.string(),
});
export type MemberBalance = z.infer<typeof MemberBalanceSchema>;

export const MemberBalanceListResponseSchema = pagedResponseSchema(MemberBalanceSchema);
export type MemberBalanceListResponse = z.infer<typeof MemberBalanceListResponseSchema>;
