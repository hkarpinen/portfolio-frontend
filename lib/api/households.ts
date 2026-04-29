import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type {
  Household,
  HouseholdMember,
  HouseholdPageResponse,
  UserBillsOverview,
  ContributionPeriod,
  HouseholdContributionsResponse,
} from "@/types/bills";

export const fetchOverview = () =>
  api.get<UserBillsOverview>("/api/finance/overview");

export const fetchHousehold = (id: string) =>
  api.get<Household>(`/api/finance/households/${id}`);

export const fetchHouseholdDetail = (id: string) =>
  api.get<HouseholdPageResponse>(`/api/finance/households/${id}/detail`);

export const fetchHouseholdMembers = (id: string) =>
  api.get<HouseholdMember[]>(`/api/finance/households/${id}/members`);

export const createHousehold = (body: {
  name: string;
  description?: string;
  currencyCode?: string;
}) => api.post<Household>("/api/finance/households", body);

export const updateHousehold = (
  id: string,
  body: { name: string; description?: string; currencyCode?: string; defaultSplitMethod?: string }
) => api.put<Household>(`/api/finance/households/${id}`, { householdId: id, ...body });

export const joinHousehold = (invitationCode: string) =>
  api.post<{ householdId: string }>("/api/finance/households/join", { invitationCode });

export const removeMember = (householdId: string, body: { membershipId: string; removedByUserId?: string }) =>
  api.post(`/api/finance/households/${householdId}/members/remove`, body);

export const changeMemberRole = (householdId: string, membershipId: string, role: string) =>
  api.put(`/api/finance/households/${householdId}/members/${membershipId}/role`, { role });

export const generateInvite = (householdId: string, body: { invitedByUserId: string; invitationCode: string }) =>
  api.post(`/api/finance/households/${householdId}/members/invite`, body);

export const fetchHouseholdContributions = (householdId: string) =>
  api.get<ContributionPeriod[]>(`/api/finance/households/${householdId}/contributions`);

export const deleteHousehold = (householdId: string) =>
  api.delete(`/api/finance/households/${householdId}`);

export const transferOwnership = (householdId: string, newOwnerId: string) =>
  api.post<Household>(`/api/finance/households/${householdId}/transfer-ownership`, { newOwnerId });

export const fetchOverviewServer = (cookieHeader: string) =>
  serverFetch<UserBillsOverview>("/api/finance/overview", cookieHeader);

export const fetchHouseholdDetailServer = (id: string, cookieHeader: string) =>
  serverFetch<HouseholdPageResponse>(`/api/finance/households/${id}/detail`, cookieHeader);

export const fetchHouseholdServer = (id: string, cookieHeader: string) =>
  serverFetch<Household>(`/api/finance/households/${id}`, cookieHeader);

export const fetchHouseholdContributionsServer = (householdId: string, cookieHeader: string) =>
  serverFetch<HouseholdContributionsResponse[]>(
    `/api/finance/households/${householdId}/contributions`,
    cookieHeader,
  );
