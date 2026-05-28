import { z } from "zod";
import { api } from "@/lib/api-client";
import { parsedServerFetch } from "@/lib/server-api-client";
import { HouseholdSchema, HouseholdDetailResponseSchema } from "@/types/household";
import { MembershipResponseSchema } from "@/types/membership";
import { UserOverviewSchema } from "@/types/user-overview";
import {
  HouseholdMonthlyContributionsSchema,
  ContributionPeriodSchema,
} from "@/types/contributions";

// ── Local response shapes ─────────────────────────────────────────────────────
// These DTOs are co-located with the API helpers (rather than promoted to
// types/) because they're not consumed outside this file.

export const HouseholdSummaryDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  currencyCode: z.string(),
  role: z.string(),
  joinedAt: z.string(),
  memberCount: z.number(),
  createdAt: z.string(),
});
export type HouseholdSummaryDto = z.infer<typeof HouseholdSummaryDtoSchema>;

export const HouseholdDetailDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  ownerId: z.string(),
  currencyCode: z.string(),
  createdAt: z.string(),
  memberCount: z.number(),
});
export type HouseholdDetailDto = z.infer<typeof HouseholdDetailDtoSchema>;

export const MemberDtoSchema = z.object({
  membershipId: z.string(),
  userId: z.string(),
  username: z.string(),
  displayName: z.string().nullish(),
  role: z.string(),
  joinedAt: z.string(),
});
export type MemberDto = z.infer<typeof MemberDtoSchema>;

// Small inline shapes for one-off endpoint responses. Not promoted to a
// named type because they have no other consumers.
const CreatedIdSchema = z.object({ id: z.string() });
const HouseholdIdSchema = z.object({ householdId: z.string() });
const DemoReadySchema = z.object({ ready: z.boolean() });

// ── Endpoints ─────────────────────────────────────────────────────────────────

export const fetchOverview = () => api.parsed.get("/api/finance/overview", UserOverviewSchema);

export const fetchHousehold = (id: string) =>
  api.parsed.get(`/api/households/${id}`, HouseholdSchema);

export const fetchHouseholdDetail = (id: string) =>
  api.parsed.get(`/api/households/${id}`, HouseholdDetailResponseSchema);

export const fetchHouseholdMembers = (id: string) =>
  api.parsed.get(`/api/households/${id}/members`, z.array(MembershipResponseSchema));

export const createHousehold = (body: {
  name: string;
  description?: string;
  currencyCode?: string;
}) => api.parsed.post("/api/households", CreatedIdSchema, body);

export const updateHousehold = (
  id: string,
  body: { name: string; description?: string; currencyCode?: string },
) => api.parsed.put(`/api/households/${id}`, HouseholdSchema, body);

export const joinHousehold = (invitationCode: string) =>
  api.parsed.post("/api/households/accept-invitation", HouseholdIdSchema, { invitationCode });

export const removeMember = (householdId: string, membershipId: string) =>
  api.delete(`/api/households/${householdId}/members/${membershipId}`);

export const changeMemberRole = (householdId: string, membershipId: string, role: string) =>
  api.put(`/api/households/${householdId}/members/${membershipId}/role`, { role });

export const generateInvite = (householdId: string, recipientEmail?: string) =>
  api.post(
    `/api/households/${householdId}/invite`,
    recipientEmail ? { recipientEmail } : undefined,
  );

export const fetchHouseholdContributions = (householdId: string) =>
  api.parsed.get(
    `/api/finance/groups/${householdId}/contributions`,
    z.array(HouseholdMonthlyContributionsSchema),
  );

export const deleteHousehold = (householdId: string) =>
  api.delete(`/api/households/${householdId}`);

export const transferOwnership = (householdId: string, newOwnerId: string) =>
  api.parsed.post(`/api/households/${householdId}/transfer-ownership`, HouseholdSchema, {
    newOwnerId,
  });

export const fetchOverviewServer = (cookieHeader: string) =>
  parsedServerFetch("/api/finance/overview", UserOverviewSchema, cookieHeader);

export const fetchContributionSummary = (months = 13, past = 3) =>
  api.parsed.get(
    `/api/finance/contribution-summary?months=${months}&past=${past}`,
    z.array(ContributionPeriodSchema),
  );

export const fetchContributionSummaryServer = (cookieHeader: string, months = 13, past = 3) =>
  parsedServerFetch(
    `/api/finance/contribution-summary?months=${months}&past=${past}`,
    z.array(ContributionPeriodSchema),
    cookieHeader,
  );

export const listHouseholdsServer = (cookieHeader: string) =>
  parsedServerFetch("/api/households", z.array(HouseholdSummaryDtoSchema), cookieHeader);

export const fetchHouseholdDetailServer = (id: string, cookieHeader: string) =>
  parsedServerFetch(`/api/households/${id}`, HouseholdDetailResponseSchema, cookieHeader);

export const fetchHouseholdServer = (id: string, cookieHeader: string) =>
  parsedServerFetch(`/api/households/${id}`, HouseholdDetailDtoSchema, cookieHeader);

export const fetchHouseholdMembersServer = (id: string, cookieHeader: string) =>
  parsedServerFetch(`/api/households/${id}/members`, z.array(MemberDtoSchema), cookieHeader);

export const fetchHouseholdContributionsServer = (householdId: string, cookieHeader: string) =>
  parsedServerFetch(
    `/api/finance/groups/${householdId}/contributions`,
    z.array(HouseholdMonthlyContributionsSchema),
    cookieHeader,
  );

export const checkDemoReady = () => api.parsed.get("/api/households/demo/ready", DemoReadySchema);
