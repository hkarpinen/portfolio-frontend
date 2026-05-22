"use client";

import { useState } from "react";
import { useOverview } from "@/hooks/use-household";

import { BudgetView } from "../../(household)/contributions/contributions-view";
import { ExpenseList } from "./expense-list";
import { Icon } from "@/components/editorial/icon";
import Link from "next/link";
import type { ExpensePage, ContributionPeriodSummary } from "@/types/finance";
import { FinancialSummary } from "./financial-summary";


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
              <Icon name="plus" size={13} strokeWidth={2.5} />
              Add expense
            </Link>
          </div>
          <ExpenseList initialData={initialExpenses} />
        </div>
      )}
    </div>
  );
}
