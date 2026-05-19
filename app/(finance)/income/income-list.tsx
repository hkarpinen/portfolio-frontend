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
                <span style={{ color: "var(--border-2)" }}><Icon name="arrowRight" size={10} strokeWidth={2.5} /></span>
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
              aria-label="Edit income"
              className="w-16 h-16 flex items-center justify-center cursor-pointer shrink-0" style={{ border: "none", background: editOpen ? "rgba(178,42,26,0.08)" : "var(--paper-2)", color: editOpen ? "var(--red)" : "var(--text-3)" }}
            >
              <Icon name="edit" size={13} strokeWidth={2} />
            </button>

            {/* Deductions icon button */}
            <button
              onClick={() => setModalOpen(true)}
              title="Manage deductions"
              aria-label="Manage deductions"
              className="w-16 h-16 flex items-center justify-center cursor-pointer shrink-0" style={{ border: "none", background: hasDeductions ? "rgba(178,42,26,0.08)" : "var(--paper-2)", color: hasDeductions ? "var(--red)" : "var(--text-3)" }}
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
          <span className="shrink-0" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms", display: "inline-flex", color: "var(--text-3)" }}>
            <Icon name="chevDown" size={14} />
          </span>
        </div>

        {/* Inline edit form */}
        {editOpen && (
          <form
            onSubmit={handleSubmit(onEditSubmit)}
            className="mt-[14px] pt-[14px] flex flex-col gap-5" style={{ borderTop: "1.5px solid var(--ink)" }}
          >
            <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em] m-0">Edit income source</p>

            <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Input label="Source name" error={editErrors.source?.message} {...register("source")} />
              <Input label="Currency" error={editErrors.currency?.message} {...register("currency")} />
              <Input type="number" step="0.01" label="Amount" error={editErrors.amount?.message} {...register("amount")} />
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
              <p className="text-base text-red m-0">Failed to save. Please try again.</p>
            )}
            <div className="flex gap-4 justify-end">
              <button type="button" onClick={() => { setEditOpen(false); resetForm(); }}
                className="py-[6px] px-[14px] bg-paper-2 text-base font-semibold text-ink-2 cursor-pointer border-ink">
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
      <div className="bg-paper py-24 px-12 text-center flex flex-col items-center gap-5 mb-12 shadow-stamp border-ink">
        <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center">
          <span style={{ color: "var(--ink)" }}><Icon name="dollar" size={24} strokeWidth={2} /></span>
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
