import { api } from "@/lib/api-client";
import { parsedServerFetch } from "@/lib/server-api-client";
import { IncomeSourceSchema, IncomeListResponseSchema } from "@/types/income";
import {
  NetPayBreakdownSchema,
  NetPaySummarySchema,
  type TaxWithholdingProfile,
} from "@/types/tax";
import type { PayrollDeduction } from "@/types/deductions";

export const fetchIncome = () =>
  api.parsed.get("/api/finance/income", IncomeListResponseSchema);

export const fetchHouseholdIncome = (householdId: string) =>
  api.parsed.get(`/api/finance/groups/${householdId}/income`, IncomeListResponseSchema);

export const createIncomeSource = (body: {
  source: string;
  amount: number;
  currency: string;
  quotedAs: string;
  paidEvery: string;
  startDate: string;
  lastPaycheckDate?: string;
  householdId?: string;
  initialDeductions?: PayrollDeduction[];
}) => api.parsed.post("/api/finance/income", IncomeSourceSchema, body);

export const deleteIncomeSource = (incomeId: string) =>
  api.delete(`/api/finance/income/${incomeId}`);

export const updateIncomeSource = (
  incomeId: string,
  body: {
    source: string;
    amount: number;
    currency: string;
    quotedAs: string;
    paidEvery: string;
    startDate: string;
    lastPaycheckDate?: string;
  },
) =>
  api.parsed.put(`/api/finance/income/${incomeId}`, IncomeSourceSchema, { incomeId, ...body });

export const setTaxProfile = (incomeId: string, taxProfile: TaxWithholdingProfile | null) =>
  api.parsed.put(`/api/finance/income/${incomeId}/tax-profile`, IncomeSourceSchema, {
    incomeId,
    taxProfile: taxProfile
      ? {
          filingStatus: taxProfile.filingStatus,
          stateCode: taxProfile.stateCode,
          federalAllowances: taxProfile.federalAllowances,
          stateAllowances: taxProfile.stateAllowances,
        }
      : null,
  });

export const addDeduction = (incomeId: string, deduction: PayrollDeduction) =>
  api.parsed.post(`/api/finance/income/${incomeId}/deductions`, IncomeSourceSchema, {
    incomeId,
    deduction: {
      type: deduction.type,
      label: deduction.label,
      method: deduction.method,
      value: deduction.value,
      isEmployerSponsored: deduction.isEmployerSponsored,
      frequency: deduction.frequency ?? "Monthly",
      isTaxExempt: deduction.isTaxExempt,
    },
  });

export const removeDeduction = (incomeId: string, type: string, label: string) =>
  api.parsed.delete(`/api/finance/income/${incomeId}/deductions`, IncomeSourceSchema, {
    incomeId,
    deductionType: type,
    label,
  });

export const fetchNetPayBreakdown = (incomeId: string, year?: number, month?: number) => {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return api.parsed.get(
    `/api/finance/income/${incomeId}/net-pay?year=${y}&month=${m}`,
    NetPayBreakdownSchema,
  );
};

export const fetchIncomeServer = (cookieHeader: string) =>
  parsedServerFetch("/api/finance/income", IncomeListResponseSchema, cookieHeader);

/** Server-side variant of {@link fetchNetPayBreakdown} — used by the
 *  per-row detail panel so the displayed Net/Tax figures reflect
 *  tax-profile-based withholdings (not just manually-added deductions). */
export const fetchNetPayBreakdownServer = (
  incomeId: string,
  cookieHeader: string,
  year?: number,
  month?: number,
) => {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return parsedServerFetch(
    `/api/finance/income/${incomeId}/net-pay?year=${y}&month=${m}`,
    NetPayBreakdownSchema,
    cookieHeader,
  );
};

/** Aggregate net-pay across every active income source for the caller in
 *  the given month. One round-trip; replaces N+1 per-source fan-out. */
export const fetchNetPaySummaryServer = (cookieHeader: string, year?: number, month?: number) => {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return parsedServerFetch(
    `/api/finance/income/net-pay/summary?year=${y}&month=${m}`,
    NetPaySummarySchema,
    cookieHeader,
  );
};

export const fetchHouseholdIncomeServer = (householdId: string, cookieHeader: string) =>
  parsedServerFetch(
    `/api/finance/income?householdId=${householdId}`,
    IncomeListResponseSchema,
    cookieHeader,
  );
