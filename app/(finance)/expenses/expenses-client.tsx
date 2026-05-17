"use client";

import { useState } from "react";
import { useOverview } from "@/hooks/use-household";

import { BudgetView } from "../../(bills)/contributions/contributions-view";
import { ExpenseList } from "./expense-list";
import Link from "next/link";
import type { ExpensePage, ContributionPeriodSummary } from "@/types/finance";


// ── Financial summary ─────────────────────────────────────────────────────────

function FinancialSummary({ initialMonths }: { initialMonths: ContributionPeriodSummary[] }) {
  const months = initialMonths;
  const nowKey = new Date().toISOString().slice(0, 7);
  const current = months.find((m) => m.periodStart.slice(0, 7) === nowKey);

  const income      = current?.projectedIncome ?? 0;
  const netIncome   = current?.projectedNetIncome ?? income;
  const obligations = (current?.totalDue ?? 0) + (current?.personalBillsDue ?? 0);
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
    { label: "Net income",       value: `$${netIncome.toFixed(0)}`,                                               color: "var(--text)" },
    { label: "Obligations",      value: `$${obligations.toFixed(0)}`,                                             color: "var(--text)" },
    { label: "Disposable",       value: `${netOver ? "−" : "+"}$${Math.abs(disposable).toFixed(0)}`,              sub: disposableLabel, color: netOver ? "var(--danger)" : "var(--success)" },
    ...(overdue > 0 ? [{ label: "Overdue", value: String(overdue), color: "var(--danger)" }] : []),
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap py-[10px] px-[14px] bg-paper shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
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

// ── Main export ───────────────────────────────────────────────────────────────

type Tab = "payments" | "manage";

const TABS: { key: Tab; label: string }[] = [
  { key: "payments", label: "Schedule" },
  { key: "manage",   label: "Manage expenses" },
];

export function ExpensesClient({
  initialMonths,
  initialExpenses,
}: {
  initialMonths: ContributionPeriodSummary[];
  initialExpenses: ExpensePage;
}) {
  const [tab, setTab] = useState<Tab>("payments");
  const { data: liveMonths } = useOverview(initialMonths);
  const months = liveMonths ?? initialMonths;

  return (
    <div className="flex flex-col gap-8">
      {/* Financial summary */}
      <FinancialSummary initialMonths={months} />

      {/* Tab bar */}
      <div className="flex gap-0" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="py-5 px-8 text-base bg-transparent mb-[-1px] cursor-pointer" style={{ fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? "var(--text)" : "var(--text-3)", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: tab === t.key ? "3px solid var(--red)" : "2px solid transparent", transition: "color 110ms" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "payments" ? (
        <BudgetView months={months} />
      ) : (
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <p className="text-base text-ink-3 m-0">
              Manage your recurring personal expense definitions — phone, gym, streaming, insurance.
            </p>
            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-3 py-4 px-8 bg-red text-white text-base font-semibold no-underline shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add expense
            </Link>
          </div>
          <ExpenseList initialData={initialExpenses} />
        </div>
      )}
    </div>
  );
}
