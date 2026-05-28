import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchIncome,
  createIncomeSource,
  deleteIncomeSource,
  updateIncomeSource,
  setTaxProfile,
  addDeduction,
  removeDeduction,
  fetchNetPayBreakdown,
} from "@/lib/api/income";
import { financeKeys } from "@/lib/query-keys";
import { invalidatePersonalIncome } from "@/lib/cache-invalidation";
import type { IncomeListResponse } from "@/types/income";
import type { TaxWithholdingProfile } from "@/types/tax";
import type { PayrollDeduction } from "@/types/deductions";

export function useIncome(initialData?: IncomeListResponse) {
  return useQuery({
    queryKey: financeKeys.income(),
    queryFn: fetchIncome,
    staleTime: 60_000,
    initialData,
  });
}

export function useCreateIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIncomeSource,
    onSuccess: () => invalidatePersonalIncome(queryClient),
  });
}

export function useDeleteIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incomeId: string) => deleteIncomeSource(incomeId),
    onSuccess: () => invalidatePersonalIncome(queryClient),
  });
}

export function useUpdateIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      incomeId,
      body,
    }: {
      incomeId: string;
      body: Parameters<typeof updateIncomeSource>[1];
    }) => updateIncomeSource(incomeId, body),
    onSuccess: () => invalidatePersonalIncome(queryClient),
  });
}

export function useSetTaxProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      incomeId,
      taxProfile,
    }: {
      incomeId: string;
      taxProfile: TaxWithholdingProfile | null;
    }) => setTaxProfile(incomeId, taxProfile),
    onSuccess: () => invalidatePersonalIncome(queryClient),
  });
}

export function useAddDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeId, deduction }: { incomeId: string; deduction: PayrollDeduction }) =>
      addDeduction(incomeId, deduction),
    onSuccess: () => invalidatePersonalIncome(queryClient),
  });
}

export function useRemoveDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeId, type, label }: { incomeId: string; type: string; label: string }) =>
      removeDeduction(incomeId, type, label),
    onSuccess: () => invalidatePersonalIncome(queryClient),
  });
}

export function useNetPayBreakdown(incomeId: string, year?: number, month?: number) {
  return useQuery({
    queryKey: financeKeys.netPayBreakdown(incomeId, year, month),
    queryFn: () => fetchNetPayBreakdown(incomeId, year, month),
    enabled: !!incomeId,
    staleTime: 1000 * 60 * 5,
  });
}
