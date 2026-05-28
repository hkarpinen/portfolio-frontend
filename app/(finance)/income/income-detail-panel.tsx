"use client";

import { Spinner } from "@/components/editorial";
import { useNetPayBreakdown } from "@/hooks/use-income";

export type Period = "weekly" | "biweekly" | "monthly" | "annually";

export const PERIODS: { value: Period; label: string; factor: number }[] = [
  { value: "weekly", label: "Weekly", factor: 12 / 52 },
  { value: "biweekly", label: "Bi-wk", factor: 12 / 26 },
  { value: "monthly", label: "Monthly", factor: 1 },
  { value: "annually", label: "Annually", factor: 12 },
];

interface IncomeDetailPanelProps {
  incomeId: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
}

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function IncomeDetailPanel({ incomeId, period, onPeriodChange }: IncomeDetailPanelProps) {
  const now = new Date();
  const { data, isLoading } = useNetPayBreakdown(incomeId, now.getFullYear(), now.getMonth() + 1);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-[16px_0_4px]" role="status">
        <Spinner size={20} className="text-ink" />
        <span className="text-base text-ink-3">Loading breakdown…</span>
      </div>
    );
  }

  if (!data) return null;

  const { grossPay, deductions, netPay } = data;
  const totalDeductions = grossPay - netPay;
  const { factor } = PERIODS.find((p) => p.value === period)!;

  return (
    <div className="pt-[14px]">
      <div className="mb-6 h-[1px] bg-[var(--ink-3)]" />

      {/* ── Period picker ── */}
      <div className="mb-[14px] flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className="flex-1 cursor-pointer p-[5px_0] text-sm font-semibold transition-all duration-[120ms]"
            /* border/background/color all toggle on period === p.value — dynamic, kept as inline style */
            style={{
              border: "1px solid",
              borderColor: period === p.value ? "var(--red)" : "var(--ink-3)",
              background: period === p.value ? "rgba(178,42,26,0.08)" : "transparent",
              color: period === p.value ? "var(--red)" : "var(--text-3)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Gross Pay ── */}
      <div className="mb-5 flex items-center justify-between">
        <span className="text-base font-semibold text-ink-2">Gross Pay</span>
        <span className="font-serif text-md font-bold text-ink">{money(grossPay * factor)}</span>
      </div>

      {/* ── Deductions block ── */}
      {deductions.length > 0 ? (
        <div className="mb-5 overflow-hidden border-ink">
          <div className="border-b border-ink bg-paper-2 px-6 py-3">
            <span className="text-sm font-bold uppercase tracking-[0.08em] text-ink-3">
              Deductions
            </span>
          </div>
          {deductions.map((d, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-4 px-6${i < deductions.length - 1 ? "border-ink-b" : ""}`}
            >
              <div className="mr-5 flex min-w-0 flex-1 items-center gap-3">
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-base text-ink-2">
                  {d.label}
                </span>
                {d.isEmployerSponsored && (
                  <span className="shrink-0 bg-green-soft px-[5px] py-[1px] text-sm font-semibold text-green">
                    Employer
                  </span>
                )}
              </div>
              <span className="shrink-0 font-serif text-base font-semibold text-red">
                -{money(d.amount * factor)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-ink bg-paper-2 px-6 py-3">
            <span className="text-sm font-bold uppercase tracking-[0.08em] text-ink-3">Total</span>
            <span className="font-serif text-base font-bold text-red">
              -{money(totalDeductions * factor)}
            </span>
          </div>
        </div>
      ) : (
        <p className="p-[2px_0_10px] text-base italic text-ink-3">No deductions configured</p>
      )}

      {/* ── Net Take-Home ── */}
      <div className="flex items-center justify-between border border-accent-border bg-red-soft px-[14px] py-[10px]">
        <span className="text-sm font-bold uppercase tracking-[0.08em] text-red">
          Net Take-Home
        </span>
        <span className="font-serif text-md font-extrabold text-red">{money(netPay * factor)}</span>
      </div>
    </div>
  );
}
