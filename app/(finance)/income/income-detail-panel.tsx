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
      <div style={{ padding: "16px 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "16px", height: "16px", borderRadius: "50%",
          border: "2px solid var(--accent)", borderTopColor: "transparent",
          animation: "spin 0.7s linear infinite",
        }} />
        <span style={{ fontSize: "var(--ts-label)", color: "var(--text-3)" }}>Loading breakdown…</span>
      </div>
    );
  }

  if (!data) return null;

  const { grossPay, deductions, netPay } = data;
  const totalDeductions = grossPay - netPay;
  const { factor, label } = PERIODS.find((p) => p.value === period)!;

  return (
    <div style={{ paddingTop: "14px" }}>
      <div style={{ height: "1px", background: "var(--border)", marginBottom: "12px" }} />

      {/* ── Period picker ── */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: period === p.value ? "var(--accent)" : "var(--border)",
              background: period === p.value ? "var(--accent-subtle)" : "transparent",
              color: period === p.value ? "var(--accent)" : "var(--text-3)",
              fontSize: "var(--ts-meta)",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 120ms",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Gross Pay ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "var(--ts-label)", fontWeight: "600", color: "var(--text-2)" }}>Gross Pay</span>
        <span style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "var(--ts-body)", color: "var(--text)" }}>
          {money(grossPay * factor)}
        </span>
      </div>

      {/* ── Deductions block ── */}
      {deductions.length > 0 ? (
        <div style={{ borderRadius: "10px", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "10px" }}>
          <div style={{ padding: "6px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Deductions
            </span>
          </div>
          {deductions.map((d, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 12px",
              borderBottom: i < deductions.length - 1 ? "1px solid var(--border)" : undefined,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, flex: 1, marginRight: "10px" }}>
                <span style={{ fontSize: "var(--ts-label)", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.label}
                </span>
                {d.isEmployerSponsored && (
                  <span style={{ flexShrink: 0, fontSize: "var(--ts-meta)", fontWeight: "600", padding: "1px 5px", borderRadius: "9999px", background: "var(--success-s)", color: "var(--success)" }}>
                    Employer
                  </span>
                )}
              </div>
              <span style={{ fontFamily: "var(--ff-display)", fontWeight: "600", fontSize: "var(--ts-label)", color: "var(--danger)", flexShrink: 0 }}>
                -{money(d.amount * factor)}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px", background: "var(--surface-2)", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</span>
            <span style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "var(--ts-label)", color: "var(--danger)" }}>
              -{money(totalDeductions * factor)}
            </span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", padding: "2px 0 10px", fontStyle: "italic" }}>No deductions configured</p>
      )}

      {/* ── Net Take-Home ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px", borderRadius: "10px",
        background: "var(--accent-subtle)", border: "1px solid var(--accent-border)",
      }}>
        <span style={{ fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Net Take-Home
        </span>
        <span style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-body)", color: "var(--accent)" }}>
          {money(netPay * factor)}
        </span>
      </div>
    </div>
  );
}
