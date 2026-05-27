"use client";

import { useState } from "react";
import { useDeleteIncomeSource, useIncome, useNetPayBreakdown, useUpdateIncomeSource } from "@/hooks/use-income";
import type { IncomeListResponse, IncomeSource } from "@/types/finance";
import { DeleteIconButton } from "@/components/editorial/delete-icon-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IncomeDetailPanel, PERIODS, type Period } from "./income-detail-panel";
import { ManageDeductionsModal } from "./manage-deductions-modal";
import { toMonthlyAmount } from "@/lib/utils";
import { incomeSchema, FREQUENCIES, FREQUENCY_LABELS, type IncomeFormData } from "./_income-form-shared";
import { Input, SelectField, Icon } from "@/components/editorial";
import { EmptyState } from "@/components/editorial/empty-state";
import { Btn } from "@/components/editorial/button";

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
        className="bg-paper py-[14px] px-[16px] shadow-stamp border-ink"
      >
        {/* Single row: name · freq — amounts — icon actions — chevron */}
        <div
          role="button"
          tabIndex={0}
          className="flex items-center gap-6 cursor-pointer"
          onClick={() => setExpanded((e) => !e)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((v) => !v); } }}
          aria-expanded={expanded}
          aria-controls={`income-detail-${source.incomeId}`}
          aria-label={`${source.source} — expand for pay breakdown`}
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
          <div className="flex items-center gap-5 shrink-0" aria-label={`Gross ${periodLabel}: $${(grossMonthly * factor).toFixed(2)}${netMonthly !== null && netMonthly !== grossMonthly ? `, net: $${(netMonthly * factor).toFixed(2)}` : ""}`}>
            <div className="text-right">
              <div className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em] mb-[1px]">
                Gross · {periodLabel}
              </div>
              <span className="font-serif font-bold text-md text-ink tracking-snug tabular-nums">
                ${(grossMonthly * factor).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {netMonthly !== null && netMonthly !== grossMonthly && (
              <>
                <span className="text-[var(--border-2)]" aria-hidden="true"><Icon name="arrowRight" size={10} strokeWidth={2.5} /></span>
                <div className="text-right">
                  <div className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em] mb-[1px]">Net</div>
                  <span className="font-serif font-bold text-md text-ink tracking-snug tabular-nums">
                    ${(netMonthly * factor).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Icon actions — stopPropagation so they don't toggle expand */}
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            {/* Edit icon button */}
            <button
              type="button"
              onClick={() => { setEditOpen((v) => !v); setExpanded(false); }}
              title={editOpen ? "Close edit form" : "Edit income source"}
              aria-label={editOpen ? `Close edit form for ${source.source}` : `Edit ${source.source}`}
              aria-expanded={editOpen}
              aria-controls={`income-edit-${source.incomeId}`}
              className="w-16 h-16 flex items-center justify-center cursor-pointer shrink-0"
              style={{ border: "none", background: editOpen ? "rgba(178,42,26,0.08)" : "var(--paper-2)", color: editOpen ? "var(--red)" : "var(--text-3)" }}
            >
              <Icon name="edit" size={13} strokeWidth={2} />
            </button>

            {/* Deductions icon button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              title={hasDeductions ? "Manage deductions" : "Add deductions"}
              aria-label={hasDeductions ? `Manage deductions for ${source.source}` : `Add deductions to ${source.source}`}
              className="w-16 h-16 flex items-center justify-center cursor-pointer shrink-0"
              style={{ border: "none", background: hasDeductions ? "rgba(178,42,26,0.08)" : "var(--paper-2)", color: hasDeductions ? "var(--red)" : "var(--text-3)" }}
            >
              <Icon name="dollar" size={14} strokeWidth={2} />
            </button>

            <DeleteIconButton
              onClick={(e) => { e.stopPropagation(); onDelete(source.incomeId); }}
              disabled={deleteDisabled}
              label={`Remove ${source.source}`}
            />
          </div>

          {/* Chevron */}
          <span className={`shrink-0 inline-flex text-ink-3 transition-transform duration-200${expanded ? " rotate-180" : ""}`} aria-hidden="true">
            <Icon name="chevDown" size={14} />
          </span>
        </div>

        {/* Deduction breakdown tag pills */}
        {(source.deductions?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-[6px] mt-[10px]">
            {source.deductions!.map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-[4px] py-[2px] px-[8px] text-sm font-semibold uppercase tracking-[0.06em]"
                style={{ background: "var(--paper-3)", color: "var(--ink-3)", border: "1px solid var(--rule-soft)" }}
              >
                {d.label}
                <span className="text-ink-4">·</span>
                {d.method === "PercentOfGross" ? `${d.value}%` : `$${d.value}`}
              </span>
            ))}
            {source.taxProfile && (
              <span
                className="inline-flex items-center gap-[4px] py-[2px] px-[8px] text-sm font-semibold uppercase tracking-[0.06em]"
                style={{ background: "rgba(178,42,26,0.06)", color: "var(--red)", border: "1px solid rgba(178,42,26,0.18)" }}
              >
                Tax profile · {source.taxProfile.stateCode}
              </span>
            )}
          </div>
        )}

        {/* Inline edit form */}
        {editOpen && (
          <form
            id={`income-edit-${source.incomeId}`}
            onSubmit={handleSubmit(onEditSubmit)}
            className="mt-[14px] pt-[14px] flex flex-col gap-5 border-t border-ink"
            aria-label={`Edit ${source.source}`}
            noValidate
          >
            <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em] m-0">Edit income source</p>

            <div className="grid gap-5 grid-cols-2">
              <Input label="Source name" error={editErrors.source?.message} {...register("source")} />
              <SelectField label="Currency" error={editErrors.currency?.message} {...register("currency")}>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CAD">CAD — Canadian Dollar</option>
              </SelectField>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                label="Amount"
                error={editErrors.amount?.message}
                {...register("amount")}
              />
              <SelectField label="Amount quoted as" error={editErrors.quotedAs?.message} {...register("quotedAs")}>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
              </SelectField>
              <SelectField label="Paid every" error={editErrors.paidEvery?.message} {...register("paidEvery")}>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
              </SelectField>
              <Input type="date" label="Start date" error={editErrors.startDate?.message} {...register("startDate")} />
              <Input type="date" label="Last paycheck date" error={editErrors.lastPaycheckDate?.message} {...register("lastPaycheckDate")} />
            </div>

            {updateIncome.isError && (
              <p className="text-base text-red m-0" role="alert">Failed to save. Please try again.</p>
            )}
            <div className="flex gap-4 justify-end">
              <Btn type="button" variant="secondary" size="xs" onClick={() => { setEditOpen(false); resetForm(); }}>
                Cancel
              </Btn>
              <Btn type="submit" variant="primary" size="xs" loading={updateIncome.isPending}>
                {updateIncome.isPending ? "Saving…" : "Save changes"}
              </Btn>
            </div>
          </form>
        )}

        {/* Expandable net-pay breakdown */}
        <div id={`income-detail-${source.incomeId}`}>
          {expanded && <IncomeDetailPanel incomeId={source.incomeId} period={period} onPeriodChange={setPeriod} />}
        </div>
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
      <EmptyState
        glyph={<Icon name="dollar" size={24} strokeWidth={2} />}
        title="No income sources yet"
        body="Add a salary, freelance contract, or any other income stream to start tracking your take-home pay."
        cta={{ label: "+ Add income source", href: "/income/new" }}
      />
    );
  }

  return (
    <section aria-label="Income sources">
      <h2 className="ed-h3 mb-6">Income <em>sources</em></h2>
      <div
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        role="status"
      >
        {deleteIncome.isPending ? "Removing income source…" : ""}
      </div>
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
    </section>
  );
}
