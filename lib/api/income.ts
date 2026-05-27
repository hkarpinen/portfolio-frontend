import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type { IncomeSource, IncomeListResponse, NetPayBreakdown, NetPaySummary, TaxWithholdingProfile, PayrollDeduction } from "@/types/finance";

export const fetchIncome = () =>
  api.get<IncomeListResponse>("/api/finance/income");

export const fetchHouseholdIncome = (householdId: string) =>
  api.get<IncomeListResponse>(`/api/finance/groups/${householdId}/income`);

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
}) => api.post<IncomeSource>("/api/finance/income", body);

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
  }
) => api.put<IncomeSource>(`/api/finance/income/${incomeId}`, { incomeId, ...body });

export const setTaxProfile = (incomeId: string, taxProfile: TaxWithholdingProfile | null) =>
  api.put<IncomeSource>(`/api/finance/income/${incomeId}/tax-profile`, {
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
  api.post<IncomeSource>(`/api/finance/income/${incomeId}/deductions`, {
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
  api.delete<IncomeSource>(`/api/finance/income/${incomeId}/deductions`, {
    incomeId,
    deductionType: type,
    label,
  });

export const fetchNetPayBreakdown = (incomeId: string, year?: number, month?: number) => {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return api.get<NetPayBreakdown>(
    `/api/finance/income/${incomeId}/net-pay?year=${y}&month=${m}`
  );
};

export const fetchIncomeServer = (cookieHeader: string) =>
  serverFetch<IncomeListResponse>("/api/finance/income", cookieHeader);

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
  return serverFetch<NetPayBreakdown>(
    `/api/finance/income/${incomeId}/net-pay?year=${y}&month=${m}`,
    cookieHeader,
  );
};

/** Aggregate net-pay across every active income source for the caller in
 *  the given month. One round-trip; replaces N+1 per-source fan-out. */
export const fetchNetPaySummaryServer = (
  cookieHeader: string,
  year?: number,
  month?: number,
) => {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return serverFetch<NetPaySummary>(
    `/api/finance/income/net-pay/summary?year=${y}&month=${m}`,
    cookieHeader,
  );
};

export const fetchHouseholdIncomeServer = (householdId: string, cookieHeader: string) =>
  serverFetch<IncomeListResponse>(`/api/finance/income?householdId=${householdId}`, cookieHeader);
