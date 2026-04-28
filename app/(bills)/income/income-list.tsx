"use client";

import { useDeleteIncomeSource, useIncome } from "@/hooks/use-income";
import type { IncomePage } from "@/types/bills";
import type { IncomeSource } from "@/types/bills";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";

export function IncomeList({ initialData }: { initialData: IncomePage }) {
  // initialData seeds the cache so there's no loading state on first render.
  // Any mutation that invalidates billsKeys.income() will trigger a refetch here.
  const { data } = useIncome(initialData);
  const sources: IncomeSource[] = data?.items ?? [];
  const deleteIncome = useDeleteIncomeSource();

  function handleDelete(incomeId: string) {
    deleteIncome.mutate(incomeId);
  }

  if (sources.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        marginBottom: "24px",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
        </div>
        <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--text)" }}>
          No income sources yet
        </p>
        <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Add one below to start tracking coverage.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
      {sources.map((source) => (
        <div
          key={source.incomeId}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div>
            <p style={{ fontWeight: "600", fontSize: "14px", color: "var(--text)" }}>{source.source}</p>
            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px", textTransform: "capitalize" }}>
              {source.frequency?.toLowerCase() ?? "monthly"}{source.currency ? ` · ${source.currency}` : ""}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "16px", color: "var(--text)" }}>
              {source.currency ?? "USD"} {source.amount.toFixed(2)}
            </span>
            <DeleteIconButton
              onClick={() => handleDelete(source.incomeId)}
              disabled={deleteIncome.isPending}
              label={`Remove ${source.source}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
