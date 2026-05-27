"use client";

import { usePayHouseholdExpense, useUnpayHouseholdExpense } from "@/hooks/use-expenses";
import { Icon } from "@/components/editorial/icon";

interface Props {
  householdId: string;
  householdExpenseId: string;
  isPaid?: boolean;
  occurrenceDate?: string;
}

export function MarkPaidButton({ householdId, householdExpenseId, isPaid = false, occurrenceDate }: Props) {
  const payMutation = usePayHouseholdExpense(householdId, householdExpenseId);
  const unpayMutation = useUnpayHouseholdExpense(householdId, householdExpenseId);
  const isPending = payMutation.isPending || unpayMutation.isPending;

  const handleClick = () => {
    const occ = occurrenceDate ?? new Date().toISOString();
    if (isPaid) {
      unpayMutation.mutate(occ);
    } else {
      payMutation.mutate(occ);
    }
  };

  if (isPaid) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-3 py-[6px] px-[14px] rounded-full text-base font-semibold cursor-pointer disabled:cursor-not-allowed transition-[background] duration-[110ms] disabled:opacity-70"
        /* background/color/border use color-mix() — no Tailwind equivalent */
        style={{
          background: isPending ? "var(--paper-3)" : "color-mix(in oklch, var(--success) 14%, transparent)",
          color: isPending ? "var(--text-3)" : "var(--success)",
          border: "1px solid color-mix(in oklch, var(--success) 30%, transparent)",
        }}
      >
        <Icon name="check" size={12} strokeWidth={2.5} />
        Paid
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-3 py-[6px] px-[14px] rounded-full text-base font-medium cursor-pointer disabled:cursor-not-allowed transition-[background] duration-[110ms] disabled:opacity-70"
      /* background/color use CSS token expressions; border uses oklch literal */
      style={{
        background: isPending ? "var(--paper-3)" : "var(--success-s)",
        color: isPending ? "var(--text-3)" : "var(--success)",
        border: "1px solid oklch(68% 0.18 152 / 0.25)",
      }}
    >
      {isPending ? (
        /* border and animation use custom values — kept as inline style */
        <div className="w-6 h-6 rounded-full" style={{ border: "1.5px solid var(--text-3)", borderTopColor: "var(--success)", animation: "spin 0.8s linear infinite" }} />
      ) : (
        <Icon name="check" size={12} strokeWidth={2.5} />
      )}
      {isPending ? "Updating…" : "Mark Paid"}
    </button>
  );
}
