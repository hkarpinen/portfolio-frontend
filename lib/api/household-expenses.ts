import { api } from "@/lib/api-client";
import { parsedServerFetch } from "@/lib/server-api-client";
import {
  HouseholdExpenseSchema,
  HouseholdExpenseListResponseSchema,
  HouseholdExpenseDetailResponseSchema,
  ExpenseSplitSchema,
} from "@/types/household-expense";
import { MemberBalanceListResponseSchema } from "@/types/membership";
import type { MemberBalanceListResponse } from "@/types/membership";

export const fetchHouseholdExpenses = (householdId: string) =>
  api.parsed.get(`/api/finance/groups/${householdId}/expenses`, HouseholdExpenseListResponseSchema);

/** Server-side (RSC) version — forwards cookie so callerId is known and the caller's `isPaid` is populated. */
export const fetchHouseholdExpensesServer = (householdId: string, cookieHeader: string) =>
  parsedServerFetch(
    `/api/finance/groups/${householdId}/expenses`,
    HouseholdExpenseListResponseSchema,
    cookieHeader,
  );

export const fetchHouseholdExpenseDetail = (householdId: string, householdExpenseId: string) =>
  api.parsed.get(
    `/api/finance/groups/${householdId}/expenses/${householdExpenseId}/detail`,
    HouseholdExpenseDetailResponseSchema,
  );

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
  },
) =>
  api.parsed.put(
    `/api/finance/groups/${householdId}/expenses/${householdExpenseId}`,
    HouseholdExpenseSchema,
    { chargeId: householdExpenseId, ...body },
  );

export const deleteHouseholdExpense = (householdId: string, householdExpenseId: string) =>
  api.delete(`/api/finance/groups/${householdId}/expenses/${householdExpenseId}`);

export const payHouseholdExpense = (
  householdId: string,
  householdExpenseId: string,
  occurrenceDate: string,
) =>
  api.post(`/api/finance/groups/${householdId}/expenses/${householdExpenseId}/payments`, {
    occurrenceDate,
  });

export const unpayHouseholdExpense = (
  householdId: string,
  householdExpenseId: string,
  occurrenceDate: string,
) =>
  api.delete(`/api/finance/groups/${householdId}/expenses/${householdExpenseId}/payments`, {
    occurrenceDate,
  });

export const addExpenseSplit = (
  householdId: string,
  householdExpenseId: string,
  body: { userId: string; amount: number; currency: string },
) =>
  api.parsed.post(
    `/api/finance/groups/${householdId}/expenses/${householdExpenseId}/splits`,
    ExpenseSplitSchema,
    body,
  );

export const removeSplit = (householdId: string, householdExpenseId: string, allocationId: string) =>
  api.delete(`/api/finance/groups/${householdId}/expenses/${householdExpenseId}/splits/${allocationId}`);

/** Record a direct settle-up payment from the caller to another member (caller = payer). */
export const settleUpTransfer = (
  householdId: string,
  body: { toUserId: string; amount: number; currency: string },
) => api.post(`/api/finance/groups/${householdId}/settlements/transfer`, body);

/** Per-other-member balances within a household, from the caller's POV. */
export const fetchHouseholdBalances = (householdId: string) =>
  api.parsed.get(`/api/finance/groups/${householdId}/balances`, MemberBalanceListResponseSchema);

/** Server-side counterpart for RSC prefetch (audit §3.4 — household N+1 fix). */
const fetchHouseholdBalancesServer = (householdId: string, cookieHeader: string) =>
  parsedServerFetch(
    `/api/finance/groups/${householdId}/balances`,
    MemberBalanceListResponseSchema,
    cookieHeader,
  );

/**
 * Prefetch the balance map for many households in one render pass. Returns a
 * Record keyed by householdId so the consumer can hand each card its own
 * `initialData` without per-card client fetches. Failures collapse to a
 * missing entry — the badge component falls back to a normal client fetch
 * for any household whose key isn't in the map.
 *
 * The audit (§3.4) measured this as the most visible N+1 on the landing
 * page: one `listHouseholdsServer` + N `useHouseholdBalances` client calls
 * fired in parallel on every visit. Prefetching makes balances arrive in
 * the same response payload as the household list.
 */
export const fetchAllBalancesServer = async (
  householdIds: readonly string[],
  cookieHeader: string,
): Promise<Record<string, MemberBalanceListResponse | null>> => {
  const entries = await Promise.all(
    householdIds.map(
      async (id) => [id, await fetchHouseholdBalancesServer(id, cookieHeader)] as const,
    ),
  );
  return Object.fromEntries(entries);
};

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
    /** Who fronted the vendor: a member paid from their own pocket (`PayerMember`) or it came from
     *  the shared household pot (`GroupCash`). Defaults to `PayerMember` server-side. */
    fundingSource?: "PayerMember" | "GroupCash";
    /** The member who fronted the bill (PayerMember). Defaults to the creator server-side. */
    payerUserId?: string;
    /** Per-member shares. Each member later marks their share paid — back to the payer
     *  (PayerMember) or into the pot (GroupCash); the API absorbs any rounding remainder. */
    allocations?: { userId: string; amount: number; currency: string }[];
  },
) => api.parsed.post(`/api/finance/groups/${householdId}/expenses`, HouseholdExpenseSchema, body);

/** Owner pays the vendor from the shared household account, once all shares are in (collect-first). */
export const markVendorPaid = (householdId: string, householdExpenseId: string, occurrenceDate: string) =>
  api.post(`/api/finance/groups/${householdId}/expenses/${householdExpenseId}/vendor-payment`, {
    occurrenceDate,
  });

/** Undo a vendor payment (back to upcoming/unpaid). */
export const markVendorUnpaid = (
  householdId: string,
  householdExpenseId: string,
  occurrenceDate: string,
) =>
  api.delete(`/api/finance/groups/${householdId}/expenses/${householdExpenseId}/vendor-payment`, {
    occurrenceDate,
  });
