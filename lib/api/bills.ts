import { api } from "@/lib/api-client";
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
  Me,
} from "@/types/api";

// ─── Identity ──────────────────────────────────────────────────────────────────

export const fetchMe = () => api.get<Me>("/api/identity/me");

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

export const generateInvite = (householdId: string, body: { invitedByUserId: string; invitationCode: string }) =>
  api.post(`/api/bills/households/${householdId}/members/invite`, body);

// ─── Bills ─────────────────────────────────────────────────────────────────────

export const fetchBillDetail = (householdId: string, billId: string) =>
  api.get<BillPageResponse>(`/api/bills/households/${householdId}/bills/${billId}/detail`);

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

export interface IncomePage {
  items: IncomeSource[];
}

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

// ─── Contributions ─────────────────────────────────────────────────────────────

export const fetchContributions = () =>
  api.get<{ contributionsByMonth?: ContributionPeriod[]; totalMonthlyIncome?: number }>("/api/bills/overview");

export const fetchHouseholdContributions = (householdId: string) =>
  api.get<ContributionPeriod[]>(`/api/bills/households/${householdId}/contributions`);

export const deleteHousehold = (householdId: string) =>
  api.delete(`/api/bills/households/${householdId}`);

export const transferOwnership = (householdId: string, newOwnerId: string) =>
  api.post<Household>(`/api/bills/households/${householdId}/transfer-ownership`, { newOwnerId });
