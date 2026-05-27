"use client";

import { useNetPayBreakdown } from "@/hooks/use-income";

export type Period = "weekly" | "biweekly" | "monthly" | "annually";

export const PERIODS: { value: Period; label: string; factor: number }[] = [
  { value: "weekly",   label: "Weekly",   factor: 12 / 52 },
  { value: "biweekly", label: "Bi-wk",    factor: 12 / 26 },
  { value: "monthly",  label: "Monthly",  factor: 1 },
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
      <div className="p-[16px_0_4px] flex items-center gap-4">
        <div className="w-8 h-8 border-2 border-[var(--ink-4)] border-t-ink animate-spin" />
        <span className="text-base text-ink-3">Loading breakdown…</span>
      </div>
    );
  }

  if (!data) return null;

  const { grossPay, deductions, netPay } = data;
  const totalDeductions = grossPay - netPay;
  const { factor, label } = PERIODS.find((p) => p.value === period)!;

  return (
    <div className="pt-[14px]">
      <div className="h-[1px] mb-6 bg-[var(--ink-3)]" />

      {/* ── Period picker ── */}
      <div className="flex gap-2 mb-[14px]">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className="flex-1 p-[5px_0] text-sm font-semibold cursor-pointer transition-all duration-[120ms]"
            /* border/background/color all toggle on period === p.value — dynamic, kept as inline style */
            style={{ border: "1px solid", borderColor: period === p.value ? "var(--red)" : "var(--ink-3)", background: period === p.value ? "rgba(178,42,26,0.08)" : "transparent", color: period === p.value ? "var(--red)" : "var(--text-3)" }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Gross Pay ── */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-base font-semibold text-ink-2">Gross Pay</span>
        <span className="font-serif font-bold text-md text-ink">
          {money(grossPay * factor)}
        </span>
      </div>

      {/* ── Deductions block ── */}
      {deductions.length > 0 ? (
        <div className="overflow-hidden mb-5 border-ink">
          <div className="py-3 px-6 bg-paper-2 border-b border-ink">
            <span className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em]">
              Deductions
            </span>
          </div>
          {deductions.map((d, i) => (
            <div key={i} className={`flex justify-between items-center py-4 px-6${i < deductions.length - 1 ? " border-ink-b" : ""}`}>
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-5">
                <span className="text-base text-ink-2 overflow-hidden text-ellipsis whitespace-nowrap">
                  {d.label}
                </span>
                {d.isEmployerSponsored && (
                  <span className="shrink-0 text-sm font-semibold py-[1px] px-[5px] bg-green-soft text-green">
                    Employer
                  </span>
                )}
              </div>
              <span className="font-serif font-semibold text-base text-red shrink-0">
                -{money(d.amount * factor)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center py-3 px-6 bg-paper-2 border-t border-ink">
            <span className="text-sm font-bold text-ink-3 uppercase tracking-[0.08em]">Total</span>
            <span className="font-serif font-bold text-base text-red">
              -{money(totalDeductions * factor)}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-base text-ink-3 p-[2px_0_10px] italic">No deductions configured</p>
      )}

      {/* ── Net Take-Home ── */}
      <div className="flex justify-between items-center py-[10px] px-[14px] bg-red-soft border border-[var(--accent-border)]">
        <span className="text-sm font-bold text-red uppercase tracking-[0.08em]">
          Net Take-Home
        </span>
        <span className="font-serif font-extrabold text-md text-red">
          {money(netPay * factor)}
        </span>
      </div>
    </div>
  );
}
