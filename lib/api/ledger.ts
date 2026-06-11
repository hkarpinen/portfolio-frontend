import { z } from "zod";
import { api } from "@/lib/api-client";
import { parsedServerFetch } from "@/lib/server-api-client";

/**
 * Group double-entry ledger — mirrors finance `LedgerViewDto`. Group-scoped by the
 * opaque GroupId; finance knows nothing of "household". Balances are derived from
 * postings (never stored); `isBalanced` is the trial-balance health check.
 */
export const AccountBalanceSchema = z.object({
  accountId: z.string(),
  code: z.string(),
  name: z.string(),
  accountType: z.enum(["Asset", "Liability", "Equity", "Income", "Expense"]),
  normalBalance: z.enum(["Debit", "Credit"]),
  balance: z.number(),
});
export type AccountBalance = z.infer<typeof AccountBalanceSchema>;

export const LedgerViewSchema = z.object({
  ledgerId: z.string(),
  currency: z.string(),
  accounts: z.array(AccountBalanceSchema),
  totalDebits: z.number(),
  totalCredits: z.number(),
  isBalanced: z.boolean(),
});
export type LedgerView = z.infer<typeof LedgerViewSchema>;

export const fetchGroupLedger = (groupId: string) =>
  api.parsed.get(`/api/finance/groups/${groupId}/ledger`, LedgerViewSchema);

/** One posting on an account, with the running balance after it — mirrors finance `StatementLineDto`. */
export const StatementLineSchema = z.object({
  entryId: z.string(),
  date: z.string(),
  description: z.string(),
  source: z.string().nullish(),
  direction: z.enum(["Debit", "Credit"]),
  amount: z.number(),
  runningBalance: z.number(),
  isReversal: z.boolean(),
});
export type StatementLine = z.infer<typeof StatementLineSchema>;

/** An account's statement (posting history + running balance) — mirrors finance `AccountStatementDto`. */
export const AccountStatementSchema = z.object({
  accountId: z.string(),
  code: z.string(),
  name: z.string(),
  accountType: z.enum(["Asset", "Liability", "Equity", "Income", "Expense"]),
  normalBalance: z.enum(["Debit", "Credit"]),
  currency: z.string(),
  balance: z.number(),
  lines: z.array(StatementLineSchema),
});
export type AccountStatement = z.infer<typeof AccountStatementSchema>;

export const fetchAccountStatement = (groupId: string, accountId: string) =>
  api.parsed.get(
    `/api/finance/groups/${groupId}/accounts/${accountId}/statement`,
    AccountStatementSchema,
  );

/** The caller's net position per group + total — mirrors finance `UserPositionDto`. Derived from
 * the group ledgers' member-equity accounts (no user ledger). */
export const GroupPositionSchema = z.object({
  groupId: z.string(),
  currency: z.string(),
  net: z.number(),
});
export const UserPositionSchema = z.object({
  total: z.number(),
  currency: z.string().nullish(),
  groups: z.array(GroupPositionSchema),
});
export type UserPosition = z.infer<typeof UserPositionSchema>;

export const fetchUserPosition = () =>
  api.parsed.get(`/api/finance/me/position`, UserPositionSchema);

export const fetchUserPositionServer = (cookieHeader: string) =>
  parsedServerFetch(`/api/finance/me/position`, UserPositionSchema, cookieHeader);
