import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchIncome,
  createIncomeSource,
  deleteIncomeSource,
} from "@/lib/api/income";
import { billsKeys } from "@/lib/query-keys";
import type { IncomePage } from "@/types/bills";

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
