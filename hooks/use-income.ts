import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchIncome,
  createIncomeSource,
  deleteIncomeSource,
  setTaxProfile,
  addDeduction,
  removeDeduction,
  fetchNetPayBreakdown,
} from "@/lib/api/income";
import { billsKeys } from "@/lib/query-keys";
import type { IncomePage, TaxWithholdingProfile, PayrollDeduction } from "@/types/bills";

export function useIncome(initialData?: IncomePage) {
  return useQuery({
    queryKey: billsKeys.income(),
    queryFn: fetchIncome,
    initialData,
  });
}

export function useCreateIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIncomeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.income() });
      queryClient.invalidateQueries({ queryKey: billsKeys.contributions() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
    },
  });
}

export function useDeleteIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incomeId: string) => deleteIncomeSource(incomeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.income() });
      queryClient.invalidateQueries({ queryKey: billsKeys.contributions() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
    },
  });
}

export function useSetTaxProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeId, taxProfile }: { incomeId: string; taxProfile: TaxWithholdingProfile | null }) =>
      setTaxProfile(incomeId, taxProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.income() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
    },
  });
}

export function useAddDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeId, deduction }: { incomeId: string; deduction: PayrollDeduction }) =>
      addDeduction(incomeId, deduction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.income() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
    },
  });
}

export function useRemoveDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeId, type, label }: { incomeId: string; type: string; label: string }) =>
      removeDeduction(incomeId, type, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.income() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overview() });
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
