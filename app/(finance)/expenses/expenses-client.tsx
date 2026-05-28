"use client";

import { DepartmentHead, EmptyDispatch, Ticker } from "@/components/editorial";
import { useOverview } from "@/hooks/use-household";
import { useIncome } from "@/hooks/use-income";
import { ExpenseList } from "./expense-list";
import { FinancialSummary } from "./financial-summary";
import { OneTimeTable } from "./one-time-table";
import { SharedSplitsTable, groupSharedSplitsByBill } from "./shared-splits-table";
import { computeIncomeMonthly } from "./expenses-derivations";

import { buildExpensesTicker, type UpcomingBill } from "@/lib/finance/editorial-copy";
import { formatCurrency } from "@/lib/formatting";
import type { ExpensePage, ExpenseItem } from "@/types/expense";
import type { ContributionPeriod } from "@/types/contributions";
import type { IncomeSource } from "@/types/income";

interface ExpensesClientProps {
  initialMonths: ContributionPeriod[];
  initialExpenses: ExpensePage;
  initialIncome: IncomeSource[];
  householdNamesById: Record<string, string>;
  monthName: string;
}

export function ExpensesClient({
  initialMonths,
  initialExpenses,
  initialIncome,
  householdNamesById,
  monthName,
}: ExpensesClientProps) {
  const { data: liveMonths } = useOverview(initialMonths);
  const months = liveMonths ?? initialMonths;
  const { data: liveIncome } = useIncome({ items: initialIncome });
  const incomeSources: IncomeSource[] = liveIncome?.items ?? initialIncome;

  // Pick out the current month from the contribution-period list and derive
  // every projection the page renders from it.
  const nowKey = new Date().toISOString().slice(0, 7);
  const currentPeriod = months.find((m) => m.periodStart.slice(0, 7) === nowKey);
  const oneTimeBills: ExpenseItem[] = (currentPeriod?.personalBills ?? []).filter(
    (b) => !b.recurrenceFrequency,
  );
  const sharedSplitGroups = groupSharedSplitsByBill(currentPeriod?.contributions ?? []);

  // Ticker = month totals plus the next few upcoming bills by due date.
  const { monthlyGross, monthlyNet } = computeIncomeMonthly(incomeSources);
  const obligations = (currentPeriod?.totalDue ?? 0) + (currentPeriod?.personalBillsDue ?? 0);
  const disposable = monthlyNet - obligations;

  const upcoming: UpcomingBill[] = [
    ...(currentPeriod?.personalBills ?? []).map((b) => ({
      title: b.title,
      amount: b.amount,
      dueDate: b.dueDate,
    })),
    ...(currentPeriod?.contributions ?? []).map((c) => ({
      title: c.billTitle,
      amount: Number(c.amount),
      dueDate: c.dueDate,
    })),
  ]
    .filter((b) => new Date(b.dueDate).getTime() >= Date.now() - 86_400_000)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const tickerItems = buildExpensesTicker({
    disposable,
    totalOut: obligations,
    income: monthlyGross,
    upcoming,
    monthName,
  });

  // Department head counts/totals for each section header.
  const personalRecurringBills = (currentPeriod?.personalBills ?? []).filter(
    (b) => b.recurrenceFrequency,
  );
  const personalRecurringCount = personalRecurringBills.length;
  const personalRecurringTotal = personalRecurringBills.reduce((s, b) => s + b.amount, 0);
  const sharedTotal = sharedSplitGroups.reduce((s, g) => s + g.monthlyAmount, 0);
  const oneTimeTotal = oneTimeBills.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex flex-col gap-10">
      <Ticker items={tickerItems} ariaLabel="This month's financial figures" />

      <FinancialSummary
        initialMonths={months}
        incomeSources={incomeSources}
        monthName={monthName}
      />

      <section className="flex flex-col gap-5">
        <DepartmentHead
          kicker="Recurring · Personal"
          count={`${personalRecurringCount} bill${personalRecurringCount === 1 ? "" : "s"} · ${formatCurrency(personalRecurringTotal, "USD", { precision: 0 })}/mo`}
          title="Personal <em>recurring</em>"
          deck="Bills you owe on a schedule. Edit cadence and category from the row."
        />
        <ExpenseList initialData={initialExpenses} />
      </section>

      <section className="flex flex-col gap-5">
        <DepartmentHead
          kicker="Shared · Households"
          count={`${sharedSplitGroups.length} bill${sharedSplitGroups.length === 1 ? "" : "s"} · ${formatCurrency(sharedTotal, "USD", { precision: 0 })}/mo`}
          title="Shared <em>household splits</em>"
          deck="Your share of recurring bills across every household you contribute to."
        />
        {sharedSplitGroups.length > 0 ? (
          <SharedSplitsTable groups={sharedSplitGroups} householdNamesById={householdNamesById} />
        ) : (
          <EmptyDispatch>
            No shared household bills <em>due</em> this month
          </EmptyDispatch>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <DepartmentHead
          kicker={`One-time · ${monthName}`}
          count={
            oneTimeBills.length > 0
              ? `${oneTimeBills.length} expense${oneTimeBills.length === 1 ? "" : "s"} · ${formatCurrency(oneTimeTotal, "USD", { precision: 0 })}`
              : "—"
          }
          title="One time <em>this month</em>"
          deck="Non-recurring outlays posted to the current period."
        />
        <OneTimeTable bills={oneTimeBills} />
      </section>
    </div>
  );
}
