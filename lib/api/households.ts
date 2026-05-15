import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type {
  Household,
  MembershipResponse,
  HouseholdDetailResponse,
  UserOverview,
  HouseholdMonthlyContributions,
  ContributionPeriodSummary,
} from "@/types/finance";

export interface HouseholdSummaryDto {
  id: string;
  name: string;
  description?: string;
  currencyCode: string;
  role: string;
  joinedAt: string;
  memberCount: number;
  createdAt: string;
}

export interface HouseholdDetailDto {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  currencyCode: string;
  createdAt: string;
  memberCount: number;
}

export interface MemberDto {
  membershipId: string;
  userId: string;
  username: string;
  displayName?: string;
  role: string;
  joinedAt: string;
}

export const fetchOverview = () =>
  api.get<UserOverview>("/api/finance/overview");

export const fetchHousehold = (id: string) =>
  api.get<Household>(`/api/households/${id}`);

export const fetchHouseholdDetail = (id: string) =>
  api.get<HouseholdDetailResponse>(`/api/households/${id}`);

export const fetchHouseholdMembers = (id: string) =>
  api.get<MembershipResponse[]>(`/api/households/${id}/members`);

export const createHousehold = (body: {
  name: string;
  description?: string;
  currencyCode?: string;
}) => api.post<{ id: string }>("/api/households", body);

export const updateHousehold = (
  id: string,
  body: { name: string; description?: string; currencyCode?: string }
) => api.put<Household>(`/api/households/${id}`, body);

export const joinHousehold = (invitationCode: string) =>
  api.post<{ householdId: string }>("/api/households/accept-invitation", { invitationCode });

export const removeMember = (householdId: string, membershipId: string) =>
  api.delete(`/api/households/${householdId}/members/${membershipId}`);

export const changeMemberRole = (householdId: string, membershipId: string, role: string) =>
  api.put(`/api/households/${householdId}/members/${membershipId}/role`, { role });

export const generateInvite = (householdId: string) =>
  api.post(`/api/households/${householdId}/invite`);

export const fetchHouseholdContributions = (householdId: string) =>
  api.get<HouseholdMonthlyContributions[]>(`/api/finance/groups/${householdId}/contributions`);

export const deleteHousehold = (householdId: string) =>
  api.delete(`/api/households/${householdId}`);

export const transferOwnership = (householdId: string, newOwnerId: string) =>
  api.post<Household>(`/api/households/${householdId}/transfer-ownership`, { newOwnerId });

export const fetchOverviewServer = (cookieHeader: string) =>
  serverFetch<UserOverview>("/api/finance/overview", cookieHeader);

export const fetchContributionSummary = (months = 13, past = 3) =>
  api.get<ContributionPeriodSummary[]>(`/api/finance/contribution-summary?months=${months}&past=${past}`);

export const fetchContributionSummaryServer = (cookieHeader: string, months = 13, past = 3) =>
  serverFetch<ContributionPeriodSummary[]>(
    `/api/finance/contribution-summary?months=${months}&past=${past}`,
    cookieHeader,
  );

export const listHouseholdsServer = (cookieHeader: string) =>
  serverFetch<HouseholdSummaryDto[]>("/api/households", cookieHeader);

export const fetchHouseholdDetailServer = (id: string, cookieHeader: string) =>
  serverFetch<HouseholdDetailResponse>(`/api/households/${id}`, cookieHeader);

export const fetchHouseholdServer = (id: string, cookieHeader: string) =>
  serverFetch<HouseholdDetailDto>(`/api/households/${id}`, cookieHeader);

export const fetchHouseholdMembersServer = (id: string, cookieHeader: string) =>
  serverFetch<MemberDto[]>(`/api/households/${id}/members`, cookieHeader);

export const fetchHouseholdContributionsServer = (householdId: string, cookieHeader: string) =>
  serverFetch<HouseholdMonthlyContributions[]>(
    `/api/finance/groups/${householdId}/contributions`,
    cookieHeader,
  );
