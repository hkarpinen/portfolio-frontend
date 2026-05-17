"use client";

import { useState } from "react";
import { useDeleteIncomeSource, useIncome, useNetPayBreakdown, useUpdateIncomeSource } from "@/hooks/use-income";
import type { IncomeListResponse, IncomeSource } from "@/types/finance";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IncomeDetailPanel, PERIODS, type Period } from "./income-detail-panel";
import { ManageDeductionsModal } from "./manage-deductions-modal";
import { toMonthlyAmount } from "@/lib/utils";
import { incomeSchema, FREQUENCIES, FREQUENCY_LABELS, iStyle, Field, onFocusField, onBlurField, type IncomeFormData } from "./_income-form-shared";

function toMonthly(s: IncomeSource): number {
  return toMonthlyAmount(s.amount, s.quotedAs);
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
  const [editOpen, setEditOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("monthly");
  const updateIncome = useUpdateIncomeSource();

  const { register, handleSubmit, reset: resetForm, formState: { errors: editErrors } } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    values: {
      source: source.source,
      amount: String(source.amount),
      currency: source.currency ?? "USD",
      quotedAs: (source.quotedAs as IncomeFormData["quotedAs"]) ?? "Annually",
      paidEvery: (source.paidEvery as IncomeFormData["paidEvery"]) ?? "BiWeekly",
      startDate: source.startDate ? source.startDate.slice(0, 10) : "",
      lastPaycheckDate: source.lastPaycheckDate ? source.lastPaycheckDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    },
  });

  const onEditSubmit = (data: IncomeFormData) => {
    updateIncome.mutate(
      { incomeId: source.incomeId, body: { ...data, amount: Number(data.amount) } },
      { onSuccess: () => { setEditOpen(false); } }
    );
  };
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
        className="bg-paper py-[14px] px-[16px] shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}
      >
        {/* Single row: name · freq — amounts — icon actions — chevron */}
        <div
          className="flex items-center gap-6 cursor-pointer"
          onClick={() => setExpanded((e) => !e)}
        >
          {/* Left: name + frequency */}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-md text-ink overflow-hidden text-ellipsis whitespace-nowrap">
              {source.source}
            </p>
            <p className="text-base text-ink-3 mt-1 capitalize">
              {source.paidEvery?.toLowerCase() ?? "biweekly"}{source.currency ? ` · ${source.currency}` : ""}
            </p>
          </div>

          {/* Amounts */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="text-right">
              <div className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em] mb-[1px]">
                Gross · {periodLabel}
              </div>
              <span className="font-serif font-bold text-md text-ink tracking-snug">
                ${(grossMonthly * factor).toFixed(2)}
              </span>
            </div>
            {netMonthly !== null && netMonthly !== grossMonthly && (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--border-2)" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <div className="text-right">
                  <div className="text-sm font-bold text-red uppercase tracking-[0.08em] mb-[1px]">Net</div>
                  <span className="font-serif font-bold text-md text-red tracking-snug">
                    ${(netMonthly * factor).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Icon actions — stopPropagation so they don't toggle expand */}
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Edit icon button */}
            <button
              onClick={() => { setEditOpen((v) => !v); setExpanded(false); }}
              title="Edit income"
              className="w-16 h-16 flex items-center justify-center cursor-pointer shrink-0" style={{ border: "none", background: editOpen ? "rgba(178,42,26,0.08)" : "var(--paper-2)", color: editOpen ? "var(--red)" : "var(--text-3)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>

            {/* Deductions icon button */}
            <button
              onClick={() => setModalOpen(true)}
              title="Manage deductions"
              className="w-16 h-16 flex items-center justify-center cursor-pointer shrink-0" style={{ border: "none", background: hasDeductions ? "rgba(178,42,26,0.08)" : "var(--paper-2)", color: hasDeductions ? "var(--red)" : "var(--text-3)" }}
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
            className="shrink-0" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Inline edit form */}
        {editOpen && (
          <form
            onSubmit={handleSubmit(onEditSubmit)}
            className="mt-[14px] pt-[14px] flex flex-col gap-5" style={{ borderTop: "1.5px solid var(--ink)" }}
          >
            <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em] m-0">Edit income source</p>

            <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Field label="Source name" error={editErrors.source?.message}>
                <input {...register("source")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField} />
              </Field>
              <Field label="Currency" error={editErrors.currency?.message}>
                <input {...register("currency")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField} />
              </Field>
              <Field label="Amount" error={editErrors.amount?.message}>
                <input type="number" step="0.01" {...register("amount")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField} />
              </Field>
              <Field label="Amount quoted as" error={editErrors.quotedAs?.message}>
                <select {...register("quotedAs")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
                </select>
              </Field>
              <Field label="Paid every" error={editErrors.paidEvery?.message}>
                <select {...register("paidEvery")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField}>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
                </select>
              </Field>
              <Field label="Start date" error={editErrors.startDate?.message}>
                <input type="date" {...register("startDate")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField} />
              </Field>
              <Field label="Last paycheck date" error={editErrors.lastPaycheckDate?.message}>
                <input type="date" {...register("lastPaycheckDate")} style={iStyle} onFocus={onFocusField} onBlur={onBlurField} />
              </Field>
            </div>

            {updateIncome.isError && (
              <p className="text-base text-red m-0">Failed to save. Please try again.</p>
            )}
            <div className="flex gap-4 justify-end">
              <button type="button" onClick={() => { setEditOpen(false); resetForm(); }}
                className="py-[6px] px-[14px] bg-paper-2 text-base font-semibold text-ink-2 cursor-pointer" style={{ border: "1.5px solid var(--ink)" }}>
                Cancel
              </button>
              <button type="submit" disabled={updateIncome.isPending}
                className="py-[6px] px-[14px] bg-red text-base font-semibold text-white cursor-pointer" style={{ border: "none", opacity: updateIncome.isPending ? 0.6 : 1 }}>
                {updateIncome.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}

        {/* Expandable net-pay breakdown */}
        {expanded && <IncomeDetailPanel incomeId={source.incomeId} period={period} onPeriodChange={setPeriod} />}
      </div>

      {modalOpen && (
        <ManageDeductionsModal source={source} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

export function IncomeList({ initialData }: { initialData: IncomeListResponse }) {
  const { data } = useIncome(initialData);
  const sources: IncomeSource[] = data?.items ?? [];
  const deleteIncome = useDeleteIncomeSource();

  if (sources.length === 0) {
    return (
      <div className="bg-paper py-24 px-12 text-center flex flex-col items-center gap-5 mb-12 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
        <div className="w-[56px] h-[56px] bg-[rgba(178,42,26,0.10)] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
        </div>
        <p className="font-serif font-bold text-md text-ink">
          No income sources yet
        </p>
        <p className="text-base text-ink-3">Add one below to start tracking coverage.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mb-12">
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
