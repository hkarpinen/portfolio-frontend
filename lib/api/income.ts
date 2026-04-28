import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type { IncomeSource, IncomePage } from "@/types/bills";

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

export const fetchIncomeServer = (cookieHeader: string) =>
  serverFetch<IncomePage>("/api/bills/income", cookieHeader);

export const fetchHouseholdIncomeServer = (householdId: string, cookieHeader: string) =>
  serverFetch<IncomePage>(`/api/bills/income?householdId=${householdId}`, cookieHeader);
