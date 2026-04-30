"use client";

import { useState } from "react";
import { useDeleteIncomeSource, useIncome, useNetPayBreakdown } from "@/hooks/use-income";
import type { IncomePage, IncomeSource } from "@/types/bills";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { IncomeDetailPanel, PERIODS, type Period } from "./income-detail-panel";
import { ManageDeductionsModal } from "./manage-deductions-modal";
import { toMonthlyAmount } from "@/lib/utils";

function toMonthly(s: IncomeSource): number {
  return toMonthlyAmount(s.amount, s.frequency);
}

// Per-card component so each card can safely call its own hook
function IncomeCard({
  source,
  onDelete,
  deleteDisabled,
}: {
  source: IncomeSource;
  onDelete: (id: string) => void;
  deleteDisabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("monthly");
  const now = new Date();
  const { data: breakdown } = useNetPayBreakdown(
    source.incomeId,
    now.getFullYear(),
    now.getMonth() + 1,
  );

  const { factor, label: periodLabel } = PERIODS.find((p) => p.value === period)!;
  const grossMonthly = toMonthly(source);
  const netMonthly = breakdown?.netPay ?? null;
  const hasDeductions = (source.deductions?.length ?? 0) > 0 || !!source.taxProfile;

  return (
    <>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "14px 16px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Single row: name · freq — amounts — icon actions — chevron */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
          onClick={() => setExpanded((e) => !e)}
        >
          {/* Left: name + frequency */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontWeight: "600", fontSize: "14px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {source.source}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px", textTransform: "capitalize" }}>
              {source.frequency?.toLowerCase() ?? "monthly"}{source.currency ? ` · ${source.currency}` : ""}
            </p>
          </div>

          {/* Amounts */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px" }}>
                Gross · {periodLabel}
              </div>
              <span style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--text)", letterSpacing: "-0.02em" }}>
                ${(grossMonthly * factor).toFixed(2)}
              </span>
            </div>
            {netMonthly !== null && netMonthly !== grossMonthly && (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--border-2)" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px" }}>Net</div>
                  <span style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--accent)", letterSpacing: "-0.02em" }}>
                    ${(netMonthly * factor).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Icon actions — stopPropagation so they don't toggle expand */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            {/* Deductions icon button */}
            <button
              onClick={() => setModalOpen(true)}
              title="Manage deductions"
              style={{
                width: "32px", height: "32px", borderRadius: "8px", border: "none",
                background: hasDeductions ? "var(--accent-subtle)" : "var(--surface-2)",
                color: hasDeductions ? "var(--accent)" : "var(--text-3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </button>

            <DeleteIconButton
              onClick={(e) => { e.stopPropagation(); onDelete(source.incomeId); }}
              disabled={deleteDisabled}
              label={`Remove ${source.source}`}
            />
          </div>

          {/* Chevron */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms", flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Row 2: action buttons */}
        <div style={{ display: "none" }} />

        {/* Expandable net-pay breakdown */}
        {expanded && <IncomeDetailPanel incomeId={source.incomeId} period={period} onPeriodChange={setPeriod} />}
      </div>

      {modalOpen && (
        <ManageDeductionsModal source={source} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

export function IncomeList({ initialData }: { initialData: IncomePage }) {
  const { data } = useIncome(initialData);
  const sources: IncomeSource[] = data?.items ?? [];
  const deleteIncome = useDeleteIncomeSource();

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
        <IncomeCard
          key={source.incomeId}
          source={source}
          onDelete={(id) => deleteIncome.mutate(id)}
          deleteDisabled={deleteIncome.isPending}
        />
      ))}
    </div>
  );
}
