import { api } from "@/lib/api-client";
import { parsedServerFetch } from "@/lib/server-api-client";
import { ExpenseSchema, ExpenseListResponseSchema } from "@/types/expense";

export const fetchExpenses = () =>
  api.parsed.get("/api/finance/expenses", ExpenseListResponseSchema);

export const createExpense = (body: {
  title: string;
  amount: number;
  currency: string;
  category: string;
  dueDate: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  description?: string;
}) => api.parsed.post("/api/finance/expenses", ExpenseSchema, body);

export const updateExpense = (
  id: string,
  body: {
    title: string;
    amount: number;
    currency: string;
    category: string;
    dueDate: string;
    recurrenceFrequency?: string;
    recurrenceStartDate?: string;
    description?: string;
  },
) => api.parsed.put(`/api/finance/expenses/${id}`, ExpenseSchema, body);

export const deleteExpense = (id: string) => api.delete(`/api/finance/expenses/${id}`);

export const payExpense = (id: string, occurrenceDate: string) =>
  api.post(`/api/finance/expenses/${id}/payments`, { occurrenceDate });

export const unpayExpense = (id: string, occurrenceDate: string) =>
  api.delete(`/api/finance/expenses/${id}/payments`, { occurrenceDate });

export const fetchExpensesServer = (cookieHeader: string) =>
  parsedServerFetch("/api/finance/expenses", ExpenseListResponseSchema, cookieHeader);
