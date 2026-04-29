import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type { PersonalBill, PersonalBillPage } from "@/types/bills";

export const fetchPersonalBills = () =>
  api.get<PersonalBillPage>("/api/finance/personal-bills");

export const createPersonalBill = (body: {
  title: string;
  amount: number;
  currency: string;
  category: string;
  dueDate: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  description?: string;
}) => api.post<PersonalBill>("/api/finance/personal-bills", body);

export const updatePersonalBill = (id: string, body: {
  title: string;
  amount: number;
  currency: string;
  category: string;
  dueDate: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  description?: string;
}) => api.put<PersonalBill>(`/api/finance/personal-bills/${id}`, body);

export const deletePersonalBill = (id: string) =>
  api.delete(`/api/finance/personal-bills/${id}`);

export const fetchPersonalBillsServer = (cookieHeader: string) =>
  serverFetch<PersonalBillPage>("/api/finance/personal-bills", cookieHeader);
