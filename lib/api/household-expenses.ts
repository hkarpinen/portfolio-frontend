import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type {
  HouseholdExpense,
  HouseholdExpenseListResponse,
  HouseholdExpenseDetailResponse,
  ExpenseSplit,
} from "@/types/finance";

export const fetchHouseholdExpenses = (householdId: string) =>
  api.get<HouseholdExpenseListResponse>(`/api/finance/households/${householdId}/expenses`);

/** Server-side (RSC) version — forwards cookie so callerId is known and callerIsPaid is populated. */
export const fetchHouseholdExpensesServer = (householdId: string, cookieHeader: string) =>
  serverFetch<HouseholdExpenseListResponse>(`/api/finance/households/${householdId}/expenses`, cookieHeader);

export const fetchHouseholdExpenseDetail = (householdId: string, householdExpenseId: string) =>
  api.get<HouseholdExpenseDetailResponse>(`/api/finance/households/${householdId}/expenses/${householdExpenseId}/detail`);

export const updateHouseholdExpense = (
  householdId: string,
  householdExpenseId: string,
  body: {
    title: string;
    amount: number;
    currency: string;
    category: string;
    dueDate: string;
    description?: string;
    recurrenceFrequency?: string;
  }
) => api.put<HouseholdExpense>(`/api/finance/households/${householdId}/expenses/${householdExpenseId}`, { expenseId: householdExpenseId, ...body });

export const deleteHouseholdExpense = (householdId: string, householdExpenseId: string) =>
  api.delete(`/api/finance/households/${householdId}/expenses/${householdExpenseId}`);

export const payHouseholdExpense = (householdId: string, householdExpenseId: string, occurrenceDate: string) =>
  api.post(`/api/finance/households/${householdId}/expenses/${householdExpenseId}/payments`, { occurrenceDate });

export const unpayHouseholdExpense = (householdId: string, householdExpenseId: string, occurrenceDate: string) =>
  api.delete(`/api/finance/households/${householdId}/expenses/${householdExpenseId}/payments`, { occurrenceDate });

export const addExpenseSplit = (
  householdId: string,
  householdExpenseId: string,
  body: { membershipId: string; amount: number; currency: string }
) => api.post<ExpenseSplit>(`/api/finance/households/${householdId}/expenses/${householdExpenseId}/splits`, body);

export const removeSplit = (householdId: string, householdExpenseId: string, splitId: string) =>
  api.delete(`/api/finance/households/${householdId}/expenses/${householdExpenseId}/splits/${splitId}`);

export const createHouseholdExpense = (
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
) => api.post<HouseholdExpense>(`/api/finance/households/${householdId}/expenses`, body);
