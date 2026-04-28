import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type {
  Household,
  HouseholdMember,
  HouseholdPageResponse,
  Bill,
  BillPageResponse,
  BillSplit,
  IncomeSource,
  UserBillsOverview,
  ContributionPeriod,
  IncomePage,
  PersonalBill,
  PersonalBillPage,
  HouseholdContributionItem,
  MemberContribution,
  HouseholdContributionsResponse,
} from "@/types/api";

// ─── Households ────────────────────────────────────────────────────────────────

export const fetchOverview = () =>
  api.get<UserBillsOverview>("/api/bills/overview");

export const fetchHousehold = (id: string) =>
  api.get<Household>(`/api/bills/households/${id}`);

export const fetchHouseholdDetail = (id: string) =>
  api.get<HouseholdPageResponse>(`/api/bills/households/${id}/detail`);

export const fetchHouseholdMembers = (id: string) =>
  api.get<HouseholdMember[]>(`/api/bills/households/${id}/members`);

export const createHousehold = (body: {
  name: string;
  description?: string;
  currencyCode?: string;
}) => api.post<Household>("/api/bills/households", body);

export const updateHousehold = (
  id: string,
  body: { name: string; description?: string; currencyCode?: string; defaultSplitMethod?: string }
) => api.put<Household>(`/api/bills/households/${id}`, { householdId: id, ...body });

export const joinHousehold = (invitationCode: string) =>
  api.post<{ householdId: string }>("/api/bills/households/join", { invitationCode });

export const removeMember = (householdId: string, body: { membershipId: string; removedByUserId?: string }) =>
  api.post(`/api/bills/households/${householdId}/members/remove`, body);

export const changeMemberRole = (householdId: string, membershipId: string, role: string) =>
  api.put(`/api/bills/households/${householdId}/members/${membershipId}/role`, { role });

export const generateInvite = (householdId: string, body: { invitedByUserId: string; invitationCode: string }) =>
  api.post(`/api/bills/households/${householdId}/members/invite`, body);

// ─── Bills ─────────────────────────────────────────────────────────────────────

export const fetchBillDetail = (householdId: string, billId: string) =>
  api.get<BillPageResponse>(`/api/bills/households/${householdId}/bills/${billId}/detail`);

export const updateBill = (
  householdId: string,
  billId: string,
  body: {
    title: string;
    amount: number;
    currency: string;
    category: string;
    dueDate: string;
    description?: string;
    recurrenceFrequency?: string;
  }
) => api.put<Bill>(`/api/bills/households/${householdId}/bills/${billId}`, { billId, ...body });

export const deleteBill = (householdId: string, billId: string) =>
  api.delete(`/api/bills/households/${householdId}/bills/${billId}`);

export const payBill = (householdId: string, billId: string) =>
  api.post(`/api/bills/households/${householdId}/bills/${billId}/pay`);

// ─── Splits ────────────────────────────────────────────────────────────────────

export const addSplit = (
  householdId: string,
  billId: string,
  body: { membershipId: string; amount: number; currency: string }
) => api.post<BillSplit>(`/api/bills/households/${householdId}/bills/${billId}/splits`, body);

export const removeSplit = (householdId: string, billId: string, splitId: string) =>
  api.delete(`/api/bills/households/${householdId}/bills/${billId}/splits/${splitId}`);

export const createBill = (
  householdId: string,
  body: {
    title: string;
    amount: number;
    currency: string;
    category: string;
    dueDate: string;
    description?: string;
    recurrenceFrequency?: string;
  }
) => api.post<Bill>(`/api/bills/households/${householdId}/bills`, body);

// ─── Income ────────────────────────────────────────────────────────────────────


export const fetchIncome = () =>
  api.get<IncomePage>("/api/bills/income");

export const fetchHouseholdIncome = (householdId: string) =>
  api.get<IncomePage>(`/api/bills/households/${householdId}/income`);

export const createIncomeSource = (body: {
  source: string;
  amount: number;
  currency: string;
  frequency: string;
  startDate: string;
  householdId?: string;
}) => api.post<IncomeSource>("/api/bills/income", body);

export const deleteIncomeSource = (incomeId: string) =>
  api.delete(`/api/bills/income/${incomeId}`);

// ─── Contributions ─────────────────────────────────────────────────────────────

export const fetchContributions = () =>
  api.get<{ contributionsByMonth?: ContributionPeriod[]; totalMonthlyIncome?: number }>("/api/bills/overview");

export const fetchHouseholdContributions = (householdId: string) =>
  api.get<ContributionPeriod[]>(`/api/bills/households/${householdId}/contributions`);

export const deleteHousehold = (householdId: string) =>
  api.delete(`/api/bills/households/${householdId}`);

export const transferOwnership = (householdId: string, newOwnerId: string) =>
  api.post<Household>(`/api/bills/households/${householdId}/transfer-ownership`, { newOwnerId });

// ─── Personal Bills ────────────────────────────────────────────────────────────

export const fetchPersonalBills = () =>
  api.get<PersonalBillPage>("/api/bills/personal-bills");

export const createPersonalBill = (body: {
  title: string;
  amount: number;
  currency: string;
  category: string;
  dueDate: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  description?: string;
}) => api.post<PersonalBill>("/api/bills/personal-bills", body);

export const updatePersonalBill = (id: string, body: {
  title: string;
  amount: number;
  currency: string;
  category: string;
  dueDate: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  description?: string;
}) => api.put<PersonalBill>(`/api/bills/personal-bills/${id}`, body);

export const deletePersonalBill = (id: string) =>
  api.delete(`/api/bills/personal-bills/${id}`);

// ─── Server-side (RSC) fetchers ───────────────────────────────────────────────
// These use SERVER_API + cookie forwarding for use in React Server Components.

export const fetchOverviewServer = (cookieHeader: string) =>
  serverFetch<UserBillsOverview>("/api/bills/overview", cookieHeader);

export const fetchHouseholdDetailServer = (id: string, cookieHeader: string) =>
  serverFetch<HouseholdPageResponse>(`/api/bills/households/${id}/detail`, cookieHeader);

export const fetchHouseholdServer = (id: string, cookieHeader: string) =>
  serverFetch<Household>(`/api/bills/households/${id}`, cookieHeader);

export const fetchIncomeServer = (cookieHeader: string) =>
  serverFetch<IncomePage>("/api/bills/income", cookieHeader);

export const fetchHouseholdIncomeServer = (householdId: string, cookieHeader: string) =>
  serverFetch<IncomePage>(`/api/bills/income?householdId=${householdId}`, cookieHeader);

export const fetchHouseholdContributionsServer = (householdId: string, cookieHeader: string) =>
  serverFetch<HouseholdContributionsResponse[]>(
    `/api/bills/households/${householdId}/contributions`,
    cookieHeader,
  );

export const fetchPersonalBillsServer = (cookieHeader: string) =>
  serverFetch<PersonalBillPage>("/api/bills/personal-bills", cookieHeader);
