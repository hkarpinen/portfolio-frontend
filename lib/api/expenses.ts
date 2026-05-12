import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type { Expense, ExpensePage } from "@/types/finance";

export const fetchExpenses = () =>
  api.get<ExpensePage>("/api/finance/expenses");

export const createExpense = (body: {
  title: string;
  amount: number;
  currency: string;
  category: string;
  dueDate: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  description?: string;
}) => api.post<Expense>("/api/finance/expenses", body);

export const updateExpense = (id: string, body: {
  title: string;
  amount: number;
  currency: string;
  category: string;
  dueDate: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  description?: string;
}) => api.put<Expense>(`/api/finance/expenses/${id}`, body);

export const deleteExpense = (id: string) =>
  api.delete(`/api/finance/expenses/${id}`);

export const payExpense = (id: string, occurrenceDate: string) =>
  api.post(`/api/finance/expenses/${id}/payments`, { occurrenceDate });

export const unpayExpense = (id: string, occurrenceDate: string) =>
  api.delete(`/api/finance/expenses/${id}/payments`, { occurrenceDate });

export const fetchExpensesServer = (cookieHeader: string) =>
  serverFetch<ExpensePage>("/api/finance/expenses", cookieHeader);
