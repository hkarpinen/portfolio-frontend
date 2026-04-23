"use client";

import { usePayBill } from "@/hooks/use-bills";

interface Props {
  householdId: string;
  billId: string;
}

export function MarkPaidButton({ householdId, billId }: Props) {
  const mutation = usePayBill(householdId, billId);
  const handleClick = () => mutation.mutate();

  return (
    <button
      onClick={handleClick}
      disabled={mutation.isPending}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "6px 14px", borderRadius: "9999px",
        background: mutation.isPending ? "var(--surface-3)" : "var(--success-s)",
        color: mutation.isPending ? "var(--text-3)" : "var(--success)",
        border: "1px solid oklch(68% 0.18 152 / 0.25)",
        fontSize: "12px", fontWeight: "500",
        cursor: mutation.isPending ? "not-allowed" : "pointer",
        transition: "background 110ms",
        opacity: mutation.isPending ? 0.7 : 1,
      }}
    >
      {mutation.isPending ? (
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
      {mutation.isPending ? "Marking…" : "Mark Paid"}
    </button>
  );
}
