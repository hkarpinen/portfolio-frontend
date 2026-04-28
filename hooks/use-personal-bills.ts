import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPersonalBills,
  createPersonalBill,
  updatePersonalBill,
  deletePersonalBill,
} from "@/lib/api/personal-bills";
import { billsKeys } from "@/lib/query-keys";
import type { PersonalBillPage } from "@/types/bills";

export function usePersonalBills(initialData?: PersonalBillPage) {
  return useQuery({
    queryKey: billsKeys.personalBills(),
    queryFn: fetchPersonalBills,
    initialData,
  });
}

export function useCreatePersonalBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPersonalBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.personalBills() });
    },
  });
}

export function useUpdatePersonalBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updatePersonalBill>[1] }) =>
      updatePersonalBill(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.personalBills() });
    },
  });
}

export function useDeletePersonalBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePersonalBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKeys.personalBills() });
    },
  });
}
