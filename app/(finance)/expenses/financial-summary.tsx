import type { ContributionPeriodSummary } from "@/types/finance";

export function FinancialSummary({ initialMonths }: { initialMonths: ContributionPeriodSummary[] }) {
  const months = initialMonths;
  const nowKey = new Date().toISOString().slice(0, 7);
  const current = months.find((m) => m.periodStart.slice(0, 7) === nowKey);

  const income         = current?.projectedIncome ?? 0;
  const netIncome      = current?.projectedNetIncome ?? income;
  const sharedBillsDue = current?.totalDue ?? 0;
  const personalDue    = current?.personalBillsDue ?? 0;
  const obligations    = sharedBillsDue + personalDue;
  // Use backend-computed disposableIncome when available; fall back to local estimate.
  const disposable  = current?.disposableIncome ?? (netIncome - obligations);
  const disposableSource = current?.disposableIncomeSource ?? null;
  const netOver     = disposable < 0;
  const overdue     = (current?.personalBills ?? [])
    .filter((b) => !b.isPaid && new Date(b.dueDate) < new Date()).length;
  const monthLabel  = current
    ? new Date(current.periodStart).toLocaleString("default", { month: "long", year: "numeric" })
    : "";

  const disposableLabel = disposableSource === "balance"
    ? "from account balance"
    : disposableSource === "estimate"
      ? "income estimate"
      : undefined;

  const stats: { label: string; value: string; sub?: string; color: string }[] = [
    { label: "Net income",    value: `$${netIncome.toFixed(0)}`,                                              color: "var(--text)" },
    { label: "Shared",        value: `$${sharedBillsDue.toFixed(0)}`,                                        color: "var(--text)" },
    { label: "Personal",      value: `$${personalDue.toFixed(0)}`,                                           color: "var(--text)" },
    { label: "Disposable",    value: `${netOver ? "−" : "+"}$${Math.abs(disposable).toFixed(0)}`,            sub: disposableLabel, color: netOver ? "var(--danger)" : "var(--success)" },
    ...(overdue > 0 ? [{ label: "Overdue", value: String(overdue), color: "var(--danger)" }] : []),
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap py-[10px] px-[14px] bg-paper shadow-stamp border-ink">
      {monthLabel && (
        <span className="text-base font-semibold text-ink-2 mr-2">
          {monthLabel}
        </span>
      )}
      {stats.map((s, i) => (
        <span key={s.label} className="inline-flex items-center gap-2 text-base text-ink-3">
          {i > 0 && <span className="text-[var(--border-2)] select-none" style={{ margin: "0 2px" }}>·</span>}
          {s.label}{" "}
          <span className="font-serif font-bold text-base" style={{ color: s.color }}>{s.value}</span>
          {s.sub && <span className="text-sm text-ink-3 font-medium">({s.sub})</span>}
        </span>
      ))}
    </div>
  );
}
