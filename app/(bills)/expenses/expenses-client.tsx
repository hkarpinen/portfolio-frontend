"use client";

import { useState } from "react";
import { useOverview } from "@/hooks/use-household";
import { BudgetView } from "../contributions/contributions-view";
import { ExpenseList } from "./expense-list";
import Link from "next/link";
import type { ExpensePage, ContributionPeriodSummary } from "@/types/finance";


// ── Financial summary ─────────────────────────────────────────────────────────

function FinancialSummary({ initialMonths }: { initialMonths: ContributionPeriodSummary[] }) {
  const { data: overview } = useOverview();
  const months = overview?.contributionsByMonth ?? initialMonths;
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
    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap",
                  padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-sm)" }}>
      {monthLabel && (
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-2)", marginRight: "4px" }}>
          {monthLabel}
        </span>
      )}
      {stats.map((s, i) => (
        <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: "4px",
                                     fontSize: "12px", color: "var(--text-3)" }}>
          {i > 0 && <span style={{ color: "var(--border-2)", userSelect: "none", margin: "0 2px" }}>·</span>}
          {s.label}{" "}
          <span style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "13px", color: s.color }}>{s.value}</span>
          {s.sub && <span style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 500 }}>({s.sub})</span>}
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Financial summary */}
      <FinancialSummary initialMonths={initialMonths} />

      {/* Tab bar */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: "0" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "var(--text)" : "var(--text-3)",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: "-1px",
              cursor: "pointer",
              transition: "color 110ms",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "payments" ? (
        <BudgetView months={initialMonths} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "13px", color: "var(--text-3)", margin: 0 }}>
              Manage your recurring personal expense definitions — phone, gym, streaming, insurance.
            </p>
            <Link
              href="/expenses/new"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "10px",
                background: "var(--accent)", color: "#fff",
                fontSize: "13px", fontWeight: "600", textDecoration: "none",
                flexShrink: 0,
              }}
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
