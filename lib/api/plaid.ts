import { api } from "@/lib/api-client";

// ── Types mirroring the backend Connections contracts ────────────────────────

export interface LinkedAccountResponse {
  accountId: string;
  name: string;
  officialName: string | null;
  mask: string | null;
  type: string;
  subtype: string | null;
  currency: string;
  currentBalance: number | null;
  availableBalance: number | null;
}

/** @deprecated Use Connection instead */
export type PlaidAccountResponse = LinkedAccountResponse;

export interface Connection {
  connectionId: string;
  institutionName: string;
  status: "Healthy" | "LoginRequired" | "Revoked" | "Error";
  lastSyncedAt: string | null;
  createdAt: string;
  accounts: LinkedAccountResponse[];
}

/** @deprecated Use Connection instead */
export type PlaidItem = Connection;

export interface SyncResult {
  connectionId: string;
  added: number;
  modified: number;
  removed: number;
  hasMore: boolean;
  syncedAt: string;
}

export interface RecurringSuggestion {
  suggestionId: string;
  connectionId: string;
  accountId: string;
  direction: "Inflow" | "Outflow";
  description: string;
  merchantName: string | null;
  frequency: "Daily" | "Weekly" | "BiWeekly" | "Monthly" | "Quarterly" | "SemiAnnually" | "Annually";
  averageAmount: number;
  lastAmount: number;
  currency: string;
  firstDate: string;
  lastDate: string;
  predictedNextDate: string | null;
  isActive: boolean;
  isLinked: boolean;
}

/** @deprecated Use RecurringSuggestion instead */
export type RecurringStream = RecurringSuggestion;

export interface ConnectionTransaction {
  transactionId: string;
  accountId: string;
  amount: number;
  currency: string;
  date: string;
  name: string;
  merchantName: string | null;
  primaryCategory: string | null;
  pending: boolean;
  isLinked: boolean;
}

// ── API calls ───────────────────────────────────────────────────────────────

export const createLinkToken = () =>
  api.post<{ linkToken: string; expiration: string }>("/api/finance/connections/link-token");

export const exchangePublicToken = (body: {
  publicToken: string;
  institutionId?: string | null;
  institutionName?: string | null;
}) => api.post<Connection>("/api/finance/connections/exchange", body);

export const listConnections = () =>
  api.get<{ connections: Connection[] }>("/api/finance/connections");

/** @deprecated Use listConnections instead */
export const listPlaidItems = listConnections;

export const syncConnection = (connectionId: string) =>
  api.post<SyncResult>(`/api/finance/connections/${connectionId}/sync`);

/** @deprecated Use syncConnection instead */
export const syncPlaidItem = syncConnection;

export const listConnectionTransactions = (connectionId: string, page = 1, pageSize = 50) =>
  api.get<{ items: ConnectionTransaction[]; totalCount: number }>(
    `/api/finance/connections/${connectionId}/transactions?page=${page}&pageSize=${pageSize}`,
  );

/** @deprecated Use listConnectionTransactions instead */
export const listPlaidTransactions = listConnectionTransactions;

export const refreshSuggestions = (connectionId: string) =>
  api.post<{ suggestions: RecurringSuggestion[] }>(
    `/api/finance/connections/${connectionId}/suggestions/refresh`,
  );

/** @deprecated Use refreshSuggestions instead */
export const refreshRecurring = refreshSuggestions;

export const listSuggestions = () =>
  api.get<{ suggestions: RecurringSuggestion[] }>("/api/finance/connections/suggestions");

/** @deprecated Use listSuggestions instead */
export const listRecurring = listSuggestions;

export const acceptSuggestion = (suggestionId: string) =>
  api.post<{ suggestionId: string; linkedEntityId: string; linkedEntityType: string }>(
    `/api/finance/connections/suggestions/${suggestionId}/accept`,
  );

/** @deprecated Use acceptSuggestion instead */
export const acceptRecurring = acceptSuggestion;

export const disconnectConnection = (connectionId: string) =>
  api.delete(`/api/finance/connections/${connectionId}`);

/** @deprecated Use disconnectConnection instead */
export const unlinkPlaidItem = disconnectConnection;
