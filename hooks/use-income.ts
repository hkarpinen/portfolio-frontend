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
import type { IncomeListResponse, TaxWithholdingProfile, PayrollDeduction } from "@/types/finance";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions() });
    },
  });
}

export function useDeleteIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incomeId: string) => deleteIncomeSource(incomeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions() });
    },
  });
}

export function useUpdateIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeId, body }: { incomeId: string; body: Parameters<typeof updateIncomeSource>[1] }) =>
      updateIncomeSource(incomeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions() });
    },
  });
}

export function useSetTaxProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeId, taxProfile }: { incomeId: string; taxProfile: TaxWithholdingProfile | null }) =>
      setTaxProfile(incomeId, taxProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions() });
    },
  });
}

export function useAddDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeId, deduction }: { incomeId: string; deduction: PayrollDeduction }) =>
      addDeduction(incomeId, deduction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions() });
    },
  });
}

export function useRemoveDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeId, type, label }: { incomeId: string; type: string; label: string }) =>
      removeDeduction(incomeId, type, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.income() });
      queryClient.invalidateQueries({ queryKey: financeKeys.householdContributions() });
    },
  });
}

export function useNetPayBreakdown(incomeId: string, year?: number, month?: number) {
  return useQuery({
    queryKey: ["netPayBreakdown", incomeId, year, month],
    queryFn: () => fetchNetPayBreakdown(incomeId, year, month),
    enabled: !!incomeId,
    staleTime: 1000 * 60 * 5,
  });
}
