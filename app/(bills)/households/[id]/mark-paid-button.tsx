"use client";

import { usePayHouseholdExpense, useUnpayHouseholdExpense } from "@/hooks/use-expenses";

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
        title="Click to mark unpaid"
        style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "6px 14px", borderRadius: "9999px",
          background: isPending ? "var(--surface-3)" : "color-mix(in oklch, var(--success) 14%, transparent)",
          color: isPending ? "var(--text-3)" : "var(--success)",
          border: "1px solid color-mix(in oklch, var(--success) 30%, transparent)",
          fontSize: "12px", fontWeight: "600",
          cursor: isPending ? "not-allowed" : "pointer",
          transition: "background 110ms",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Paid
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "6px 14px", borderRadius: "9999px",
        background: isPending ? "var(--surface-3)" : "var(--success-s)",
        color: isPending ? "var(--text-3)" : "var(--success)",
        border: "1px solid oklch(68% 0.18 152 / 0.25)",
        fontSize: "12px", fontWeight: "500",
        cursor: isPending ? "not-allowed" : "pointer",
        transition: "background 110ms",
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {isPending ? (
        <div style={{
          width: "12px", height: "12px", borderRadius: "9999px",
          border: "1.5px solid var(--text-3)", borderTopColor: "var(--success)",
          animation: "spin 0.8s linear infinite",
        }} />
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {isPending ? "Updating…" : "Mark Paid"}
    </button>
  );
}
