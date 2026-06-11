"use client";

import { DeleteIconButton, Icon } from "@/components/editorial";
import { useState } from "react";
import { useNetPayBreakdown } from "@/hooks/use-income";
import type { IncomeSource } from "@/types/income";

import { IncomeDetailPanel, PERIODS, type Period } from "./income-detail-panel";
import { ManageDeductionsModal } from "./manage-deductions-modal";
import { IncomeCardEditForm } from "./income-card-edit-form";
import { toMonthlyAmount } from "@/lib/utils";
import { formatAmount } from "@/lib/formatting";

function toMonthly(s: IncomeSource): number {
  return toMonthlyAmount(s.amount, s.quotedAs);
}

/**
 * One row in the income list — collapsible card with gross/net summary,
 * deduction chips, expandable net-pay breakdown, and inline edit/manage
 * forms. The list component just renders these.
 */
export function IncomeCard({
  source,
  onDelete,
  deleteDisabled,
}: {
  source: IncomeSource;
  onDelete: (id: string) => void;
  deleteDisabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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
      <div className="border-ink bg-paper px-8 py-7 shadow-stamp">
        <CardHeaderRow
          source={source}
          expanded={expanded}
          editOpen={editOpen}
          hasDeductions={hasDeductions}
          grossMonthly={grossMonthly}
          netMonthly={netMonthly}
          periodLabel={periodLabel}
          factor={factor}
          deleteDisabled={deleteDisabled}
          onToggleExpand={() => setExpanded((e) => !e)}
          onToggleEdit={() => {
            setEditOpen((v) => !v);
            setExpanded(false);
          }}
          onOpenModal={() => setModalOpen(true)}
          onDelete={() => onDelete(source.incomeId)}
        />

        {(source.deductions?.length ?? 0) > 0 && <DeductionChips source={source} />}

        {editOpen && <IncomeCardEditForm source={source} onClose={() => setEditOpen(false)} />}

        <div id={`income-detail-${source.incomeId}`}>
          {expanded && (
            <IncomeDetailPanel
              incomeId={source.incomeId}
              period={period}
              onPeriodChange={setPeriod}
            />
          )}
        </div>
      </div>

      {modalOpen && <ManageDeductionsModal source={source} onClose={() => setModalOpen(false)} />}
    </>
  );
}

// ─── Sub-components (private to this file) ────────────────────────────────────

function CardHeaderRow({
  source,
  expanded,
  editOpen,
  hasDeductions,
  grossMonthly,
  netMonthly,
  periodLabel,
  factor,
  deleteDisabled,
  onToggleExpand,
  onToggleEdit,
  onOpenModal,
  onDelete,
}: {
  source: IncomeSource;
  expanded: boolean;
  editOpen: boolean;
  hasDeductions: boolean;
  grossMonthly: number;
  netMonthly: number | null;
  periodLabel: string;
  factor: number;
  deleteDisabled: boolean;
  onToggleExpand: () => void;
  onToggleEdit: () => void;
  onOpenModal: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex cursor-pointer items-center gap-6"
      onClick={onToggleExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleExpand();
        }
      }}
      aria-expanded={expanded}
      aria-controls={`income-detail-${source.incomeId}`}
      aria-label={`${source.source} — expand for pay breakdown`}
    >
      {/* Left: name + frequency */}
      <div className="min-w-0 flex-1">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-md font-semibold text-ink">
          {source.source}
        </p>
        <p className="mt-1 text-base capitalize text-ink-3">
          {source.paidEvery?.toLowerCase() ?? "biweekly"}
          {source.currency ? ` · ${source.currency}` : ""}
        </p>
      </div>

      {/* Amounts */}
      <div
        className="flex shrink-0 items-center gap-5"
        aria-label={`Gross ${periodLabel}: $${formatAmount(grossMonthly * factor)}${netMonthly !== null && netMonthly !== grossMonthly ? `, net: $${formatAmount(netMonthly * factor)}` : ""}`}
      >
        <div className="text-right">
          <div className="mb-0.5 text-sm font-bold uppercase tracking-[0.08em] text-ink-3">
            Gross · {periodLabel}
          </div>
          <span className="font-serif text-md font-bold tabular-nums tracking-snug text-ink">
            ${formatAmount(grossMonthly * factor)}
          </span>
        </div>
        {netMonthly !== null && netMonthly !== grossMonthly && (
          <>
            <span className="text-[var(--border-2)]" aria-hidden="true">
              <Icon name="arrowRight" size={10} strokeWidth={2.5} />
            </span>
            <div className="text-right">
              <div className="mb-0.5 text-sm font-bold uppercase tracking-[0.08em] text-ink-3">
                Net
              </div>
              <span className="font-serif text-md font-bold tabular-nums tracking-snug text-ink">
                ${formatAmount(netMonthly * factor)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Icon actions — stopPropagation so they don't toggle expand */}
      <div
        className="flex shrink-0 items-center gap-2"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onToggleEdit}
          title={editOpen ? "Close edit form" : "Edit income source"}
          aria-label={editOpen ? `Close edit form for ${source.source}` : `Edit ${source.source}`}
          aria-expanded={editOpen}
          aria-controls={`income-edit-${source.incomeId}`}
          className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center"
          style={{
            border: "none",
            background: editOpen ? "rgba(178,42,26,0.08)" : "var(--paper-2)",
            color: editOpen ? "var(--red)" : "var(--text-3)",
          }}
        >
          <Icon name="edit" size={13} strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={onOpenModal}
          title={hasDeductions ? "Manage deductions" : "Add deductions"}
          aria-label={
            hasDeductions
              ? `Manage deductions for ${source.source}`
              : `Add deductions to ${source.source}`
          }
          className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center"
          style={{
            border: "none",
            background: hasDeductions ? "rgba(178,42,26,0.08)" : "var(--paper-2)",
            color: hasDeductions ? "var(--red)" : "var(--text-3)",
          }}
        >
          <Icon name="dollar" size={14} strokeWidth={2} />
        </button>

        <DeleteIconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={deleteDisabled}
          label={`Remove ${source.source}`}
        />
      </div>

      <span
        className={`inline-flex shrink-0 text-ink-3 transition-transform duration-200${expanded ? "rotate-180" : ""}`}
        aria-hidden="true"
      >
        <Icon name="chevDown" size={14} />
      </span>
    </div>
  );
}

function DeductionChips({ source }: { source: IncomeSource }) {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {source.deductions!.map((d, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-2 px-4 py-1 text-sm font-semibold uppercase tracking-[0.06em]"
          style={{
            background: "var(--paper-3)",
            color: "var(--ink-3)",
            border: "1px solid var(--rule-soft)",
          }}
        >
          {d.label}
          <span className="text-ink-4">·</span>
          {d.method === "PercentOfGross" ? `${d.value}%` : `$${d.value}`}
        </span>
      ))}
      {source.taxProfile && (
        <span
          className="inline-flex items-center gap-2 px-4 py-1 text-sm font-semibold uppercase tracking-[0.06em]"
          style={{
            background: "rgba(178,42,26,0.06)",
            color: "var(--red)",
            border: "1px solid rgba(178,42,26,0.18)",
          }}
        >
          Tax profile · {source.taxProfile.stateCode}
        </span>
      )}
    </div>
  );
}
