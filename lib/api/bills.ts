import { api } from "@/lib/api-client";
import type {
  Bill,
  BillPageResponse,
  BillSplit,
} from "@/types/bills";

export const fetchBillDetail = (householdId: string, billId: string) =>
  api.get<BillPageResponse>(`/api/finance/households/${householdId}/bills/${billId}/detail`);

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
) => api.put<Bill>(`/api/finance/households/${householdId}/bills/${billId}`, { billId, ...body });

export const deleteBill = (householdId: string, billId: string) =>
  api.delete(`/api/finance/households/${householdId}/bills/${billId}`);

export const payBill = (householdId: string, billId: string) =>
  api.post(`/api/finance/households/${householdId}/bills/${billId}/pay`);

export const addSplit = (
  householdId: string,
  billId: string,
  body: { membershipId: string; amount: number; currency: string }
) => api.post<BillSplit>(`/api/finance/households/${householdId}/bills/${billId}/splits`, body);

export const removeSplit = (householdId: string, billId: string, splitId: string) =>
  api.delete(`/api/finance/households/${householdId}/bills/${billId}/splits/${splitId}`);

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
) => api.post<Bill>(`/api/finance/households/${householdId}/bills`, body);
