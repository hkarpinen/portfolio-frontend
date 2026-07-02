import { computeIncomeMonthly } from "./expenses-derivations";
import {
  monthObligations,
  oneTimePersonalBills,
  recurringPersonalBills,
  sharedBillIds,
} from "@/lib/contributions";
import { formatCurrency } from "@/lib/formatting";
import { pluralize } from "@/lib/utils";
import type { ContributionPeriod } from "@/types/contributions";
import type { IncomeSource } from "@/types/income";

// Personal-finance pages assume USD (see audit §5.1 caveat in
// lib/finance/editorial-copy.ts). Inline `formatCurrency(n, "USD", …)`
// rather than re-aliasing.

/**
 * FinancialSummary — top-of-page Terminus `.stats` strip.
 *
 * Mirrors the prototype's 4-up `.stats` block on PAGES['/expenses']: Net this
 * month (green), Expenses, Income (amber), Savings rate (green) — each with a
 * `.delta` sub-line. Swapped from the prior editorial `<LedeStat>` hero so the
 * Money home reads as the dark-terminal Finance overview.
 */
export function FinancialSummary({
  period,
  incomeSources,
  monthName,
}: {
  period: ContributionPeriod | undefined;
  incomeSources: IncomeSource[];
  monthName: string;
}) {
  const current = period;

  // Income comes from the income sources directly so the "in" figure matches
  // the income page's "Gross monthly". The backend's projectedIncome is
  // paycheck-date-counted for the calendar month, which can read as ~half
  // for biweekly schedules in months that only catch one paycheck.
  const { monthlyGross, monthlyNet } = computeIncomeMonthly(incomeSources);
  const income = monthlyGross;
  const netIncome = monthlyNet;

  const totalOut = monthObligations(current);
  const disposable = netIncome - totalOut;
  const netOver = disposable < 0;

  // One-time this month: personal bills without a recurrenceFrequency.
  const oneTimeBills = oneTimePersonalBills(current);

  // Posted-item count across personal recurring, shared splits, and one-time —
  // backs the "Expenses" stat delta (transaction count).
  const personalRecurringBills = recurringPersonalBills(current);
  const personalRecurringCount = personalRecurringBills.length;
  const sharedBillIdSet = sharedBillIds(current);
  const postedCount = personalRecurringCount + sharedBillIdSet.size + oneTimeBills.length;

  // Savings rate = disposable ÷ take-home, clamped to [0, …]. Undefined when
  // there's no income on file (avoid a divide-by-zero "NaN%").
  const savingsRate = netIncome > 0 ? Math.round((disposable / netIncome) * 100) : null;

  return (
    <div className="stats">
      <div className="stat">
        <div className="label">Net · {monthName}</div>
        <div className={`val ${netOver ? "red" : "green"}`}>
          {formatCurrency(disposable, "USD", { precision: 0, signed: true })}
        </div>
        <div className="delta">
          {income > 0
            ? `${formatCurrency(income, "USD", { precision: 0 })} in vs ${formatCurrency(totalOut, "USD", { precision: 0 })} out`
            : "No income on file"}
        </div>
      </div>
      <div className="stat">
        <div className="label">Expenses</div>
        <div className="val">{formatCurrency(totalOut, "USD", { precision: 0 })}</div>
        <div className="delta">
          {postedCount} {pluralize("item", postedCount)} posted
        </div>
      </div>
      <div className="stat">
        <div className="label">Income</div>
        <div className="val amber">{formatCurrency(income, "USD", { precision: 0 })}</div>
        <div className="delta">
          {incomeSources.length} {pluralize("source", incomeSources.length)}
        </div>
      </div>
      <div className="stat">
        <div className="label">Savings rate</div>
        <div className={`val ${savingsRate !== null && savingsRate >= 0 ? "green" : ""}`}>
          {savingsRate !== null ? `${savingsRate}%` : "—"}
        </div>
        <div className="delta">net ÷ take-home</div>
      </div>
    </div>
  );
}
