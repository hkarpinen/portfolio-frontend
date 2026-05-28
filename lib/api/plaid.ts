import { z } from "zod";
import { api } from "@/lib/api-client";

// ── Schemas / types mirroring the backend Connections contracts ──────────────

export const LinkedAccountResponseSchema = z.object({
  accountId: z.string(),
  name: z.string(),
  officialName: z.string().nullable(),
  mask: z.string().nullable(),
  type: z.string(),
  subtype: z.string().nullable(),
  currency: z.string(),
  currentBalance: z.number().nullable(),
  availableBalance: z.number().nullable(),
});
export type LinkedAccountResponse = z.infer<typeof LinkedAccountResponseSchema>;

/** @deprecated Use Connection instead */
export type PlaidAccountResponse = LinkedAccountResponse;

const ConnectionStatusSchema = z.enum(["Healthy", "LoginRequired", "Revoked", "Error"]);

export const ConnectionSchema = z.object({
  connectionId: z.string(),
  institutionName: z.string(),
  status: ConnectionStatusSchema,
  lastSyncedAt: z.string().nullable(),
  createdAt: z.string(),
  accounts: z.array(LinkedAccountResponseSchema),
});
export type Connection = z.infer<typeof ConnectionSchema>;

/** @deprecated Use Connection instead */
export type PlaidItem = Connection;

export const SyncResultSchema = z.object({
  connectionId: z.string(),
  added: z.number(),
  modified: z.number(),
  removed: z.number(),
  hasMore: z.boolean(),
  syncedAt: z.string(),
});
export type SyncResult = z.infer<typeof SyncResultSchema>;

const RecurringFrequencySchema = z.enum([
  "Daily",
  "Weekly",
  "BiWeekly",
  "Monthly",
  "Quarterly",
  "SemiAnnually",
  "Annually",
]);

export const RecurringSuggestionSchema = z.object({
  suggestionId: z.string(),
  connectionId: z.string(),
  accountId: z.string(),
  direction: z.enum(["Inflow", "Outflow"]),
  description: z.string(),
  merchantName: z.string().nullable(),
  frequency: RecurringFrequencySchema,
  averageAmount: z.number(),
  lastAmount: z.number(),
  currency: z.string(),
  firstDate: z.string(),
  lastDate: z.string(),
  predictedNextDate: z.string().nullable(),
  isActive: z.boolean(),
  isLinked: z.boolean(),
});
export type RecurringSuggestion = z.infer<typeof RecurringSuggestionSchema>;

/** @deprecated Use RecurringSuggestion instead */
export type RecurringStream = RecurringSuggestion;

export const ConnectionTransactionSchema = z.object({
  transactionId: z.string(),
  accountId: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  name: z.string(),
  merchantName: z.string().nullable(),
  primaryCategory: z.string().nullable(),
  pending: z.boolean(),
  isLinked: z.boolean(),
});
export type ConnectionTransaction = z.infer<typeof ConnectionTransactionSchema>;

// ── Ad-hoc response shapes ───────────────────────────────────────────────────

const LinkTokenSchema = z.object({
  linkToken: z.string(),
  expiration: z.string(),
});

const ConnectionListSchema = z.object({ connections: z.array(ConnectionSchema) });

const TransactionsPageSchema = z.object({
  items: z.array(ConnectionTransactionSchema),
  totalCount: z.number(),
});

const SuggestionsListSchema = z.object({
  suggestions: z.array(RecurringSuggestionSchema),
});

const AcceptedSuggestionSchema = z.object({
  suggestionId: z.string(),
  linkedEntityId: z.string(),
  linkedEntityType: z.string(),
});

// ── API calls ───────────────────────────────────────────────────────────────

export const createLinkToken = () =>
  api.parsed.post("/api/finance/connections/link-token", LinkTokenSchema);

export const exchangePublicToken = (body: {
  publicToken: string;
  institutionId?: string | null;
  institutionName?: string | null;
}) => api.parsed.post("/api/finance/connections/exchange", ConnectionSchema, body);

export const listConnections = () =>
  api.parsed.get("/api/finance/connections", ConnectionListSchema);

/** @deprecated Use listConnections instead */
export const listPlaidItems = listConnections;

export const syncConnection = (connectionId: string) =>
  api.parsed.post(`/api/finance/connections/${connectionId}/sync`, SyncResultSchema);

/** @deprecated Use syncConnection instead */
export const syncPlaidItem = syncConnection;

export const listConnectionTransactions = (connectionId: string, page = 1, pageSize = 50) =>
  api.parsed.get(
    `/api/finance/connections/${connectionId}/transactions?page=${page}&pageSize=${pageSize}`,
    TransactionsPageSchema,
  );

/** @deprecated Use listConnectionTransactions instead */
export const listPlaidTransactions = listConnectionTransactions;

export const refreshSuggestions = (connectionId: string) =>
  api.parsed.post(
    `/api/finance/connections/${connectionId}/suggestions/refresh`,
    SuggestionsListSchema,
  );

/** @deprecated Use refreshSuggestions instead */
export const refreshRecurring = refreshSuggestions;

export const listSuggestions = () =>
  api.parsed.get("/api/finance/connections/suggestions", SuggestionsListSchema);

/** @deprecated Use listSuggestions instead */
export const listRecurring = listSuggestions;

export const acceptSuggestion = (suggestionId: string) =>
  api.parsed.post(
    `/api/finance/connections/suggestions/${suggestionId}/accept`,
    AcceptedSuggestionSchema,
  );

/** @deprecated Use acceptSuggestion instead */
export const acceptRecurring = acceptSuggestion;

export const disconnectConnection = (connectionId: string) =>
  api.delete(`/api/finance/connections/${connectionId}`);

/** @deprecated Use disconnectConnection instead */
export const unlinkPlaidItem = disconnectConnection;
