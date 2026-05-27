"use client";

import Link from "next/link";
import { useOverview } from "@/hooks/use-household";
import { useIncome } from "@/hooks/use-income";
import { ExpenseList } from "./expense-list";
import { FinancialSummary } from "./financial-summary";
import { Ticker } from "@/components/editorial/ticker";
import { DepartmentHead } from "@/components/editorial/department-head";
import { SourceNote } from "@/components/editorial/source-note";
import { EmptyDispatch } from "@/components/editorial/empty-dispatch";
import { toMonthlyAmount } from "@/lib/utils";
import { buildExpensesTicker, type UpcomingBill } from "@/lib/finance/editorial-copy";
import type {
  ExpensePage, ContributionPeriodSummary, ExpenseItem, IncomeSource, ContributionItem, PayrollDeduction,
} from "@/types/finance";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const fmtUsd = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);

const fmt0 = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;

function OneTimeTable({ bills }: { bills: ExpenseItem[] }) {
  const total = bills.reduce((sum, b) => sum + b.amount, 0);

  if (bills.length === 0) {
    return (
      <EmptyDispatch>No one-time expenses <em>posted</em> this month</EmptyDispatch>
    );
  }

  return (
    <div className="overflow-x-auto" role="region" aria-label="One-time expenses this month">
      <table className="ed-agate">
        <caption className="sr-only">
          One-time expenses this month — {bills.length} item{bills.length !== 1 ? "s" : ""}, total {fmtUsd(total)}
        </caption>
        <thead>
          <tr>
            <th scope="col">Expense</th>
            <th scope="col">Date</th>
            <th scope="col">Category</th>
            <th scope="col" className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b.expenseId}>
              <td>{b.title}</td>
              <td className="muted"><time dateTime={b.dueDate}>{formatDate(b.dueDate)}</time></td>
              <td className="muted">{b.category ?? "—"}</td>
              <td className="num">
                <span className="ed-agate-currency">{b.currency ?? "USD"}</span>
                {b.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Total · {bills.length} expense{bills.length !== 1 ? "s" : ""}</td>
            <td className="num">{fmtUsd(total)}</td>
          </tr>
        </tfoot>
      </table>
      <SourceNote source="Your ledger" meta={[`${bills.length} item${bills.length !== 1 ? "s" : ""}`]} />
    </div>
  );
}

/** Group a month's contribution items by their underlying bill so a
 *  biweekly schedule (2 occurrences) renders as one row at the summed
 *  monthly amount. */
function groupSharedSplitsByBill(items: ContributionItem[]) {
  const byBill = new Map<string, {
    billId: string;
    billTitle: string;
    billCategory?: string;
    groupId: string;
    householdName?: string;
    currency: string;
    occurrenceCount: number;
    monthlyAmount: number;
    nextDueDate?: string;
    splitIds: string[];
  }>();
  for (const c of items) {
    const key = c.billId;
    const existing = byBill.get(key);
    if (existing) {
      existing.occurrenceCount += 1;
      existing.monthlyAmount += Number(c.amount);
      existing.splitIds.push(c.splitId);
      if (!existing.nextDueDate || c.dueDate < existing.nextDueDate) {
        existing.nextDueDate = c.dueDate;
      }
    } else {
      byBill.set(key, {
        billId: c.billId,
        billTitle: c.billTitle,
        billCategory: c.billCategory,
        groupId: c.groupId,
        householdName: c.householdName,
        currency: c.currency,
        occurrenceCount: 1,
        monthlyAmount: Number(c.amount),
        nextDueDate: c.dueDate,
        splitIds: [c.splitId],
      });
    }
  }
  return Array.from(byBill.values()).sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

function SharedSplitsTable({
  groups,
  householdNamesById,
}: {
  groups: ReturnType<typeof groupSharedSplitsByBill>;
  householdNamesById: Record<string, string>;
}) {
  const total = groups.reduce((sum, g) => sum + g.monthlyAmount, 0);
  const currency = groups[0]?.currency ?? "USD";

  return (
    <div className="overflow-x-auto" role="region" aria-label="Shared household splits this month">
      <table className="ed-agate">
        <caption className="sr-only">
          Shared household splits this month — {groups.length} bill{groups.length !== 1 ? "s" : ""}, total {fmtUsd(total, currency)}
        </caption>
        <thead>
          <tr>
            <th scope="col">Bill</th>
            <th scope="col">Household</th>
            <th scope="col">Category</th>
            <th scope="col" className="num">Your share</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const householdName = g.householdName || householdNamesById[g.groupId] || "Household";
            return (
              <tr key={g.billId}>
                <td>
                  <Link href={`/household/${g.groupId}/expenses/${g.billId}`}>{g.billTitle}</Link>
                  {g.occurrenceCount > 1 && (
                    <span className="ed-agate-occur">× {g.occurrenceCount}</span>
                  )}
                </td>
                <td className="muted">
                  <Link href={`/household/${g.groupId}`}>{householdName}</Link>
                </td>
                <td className="muted">{g.billCategory ?? "—"}</td>
                <td className="num">
                  <span className="ed-agate-currency">{currency}</span>
                  {g.monthlyAmount.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Total · {groups.length} shared bill{groups.length !== 1 ? "s" : ""}</td>
            <td className="num">{fmtUsd(total, currency)}</td>
          </tr>
        </tfoot>
      </table>
      <SourceNote
        source="Household ledgers"
        meta={[`${groups.length} bill${groups.length !== 1 ? "s" : ""}`, "ranked by monthly amount"]}
      />
    </div>
  );
}

const TAX_TYPES = new Set([
  "FederalIncomeTax", "StateIncomeTax", "SocialSecurity", "Medicare",
]);

function computeIncomeMonthly(sources: IncomeSource[]) {
  let monthlyGross = 0;
  let monthlyDeductions = 0;
  for (const source of sources) {
    const gross = toMonthlyAmount(source.amount, source.quotedAs);
    monthlyGross += gross;
    for (const d of source.deductions ?? []) {
      const base = d.method === "PercentOfGross" ? (d.value / 100) * gross : d.value;
      monthlyDeductions += toMonthlyAmount(base, d.frequency ?? "Monthly");
    }
  }
  return { monthlyGross, monthlyNet: monthlyGross - monthlyDeductions };
}

export function ExpensesClient({
  initialMonths,
  initialExpenses,
  initialIncome,
  householdNamesById,
  monthName,
}: {
  initialMonths: ContributionPeriodSummary[];
  initialExpenses: ExpensePage;
  initialIncome: IncomeSource[];
  householdNamesById: Record<string, string>;
  monthName: string;
}) {
  const { data: liveMonths } = useOverview(initialMonths);
  const months = liveMonths ?? initialMonths;
  const { data: liveIncome } = useIncome({ items: initialIncome });
  const incomeSources: IncomeSource[] = liveIncome?.items ?? initialIncome;

  // Derive one-time expenses for the current month from the contribution period data
  const nowKey = new Date().toISOString().slice(0, 7);
  const currentPeriod = months.find((m) => m.periodStart.slice(0, 7) === nowKey);
  const oneTimeBills: ExpenseItem[] = (currentPeriod?.personalBills ?? []).filter(
    (b) => !b.recurrenceFrequency,
  );
  const sharedSplitGroups = groupSharedSplitsByBill(currentPeriod?.contributions ?? []);

  // Ticker rows: month figures + the next few upcoming bills, ordered by
  // due date. Source: this month's personal recurring + one-time bills.
  const { monthlyGross, monthlyNet } = computeIncomeMonthly(incomeSources);
  const obligations = (currentPeriod?.totalDue ?? 0) + (currentPeriod?.personalBillsDue ?? 0);
  const disposable = monthlyNet - obligations;

  const upcoming: UpcomingBill[] = [
    ...(currentPeriod?.personalBills ?? []).map((b) => ({
      title: b.title, amount: b.amount, dueDate: b.dueDate,
    })),
    ...(currentPeriod?.contributions ?? []).map((c) => ({
      title: c.billTitle, amount: Number(c.amount), dueDate: c.dueDate,
    })),
  ]
    .filter((b) => new Date(b.dueDate).getTime() >= Date.now() - 86_400_000)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const tickerItems = buildExpensesTicker({
    disposable, totalOut: obligations, income: monthlyGross, upcoming, monthName,
  });

  const personalRecurringCount = (currentPeriod?.personalBills ?? []).filter((b) => b.recurrenceFrequency).length;
  const personalRecurringTotal = (currentPeriod?.personalBills ?? [])
    .filter((b) => b.recurrenceFrequency)
    .reduce((s, b) => s + b.amount, 0);
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
          count={`${personalRecurringCount} bill${personalRecurringCount === 1 ? "" : "s"} · ${fmt0(personalRecurringTotal)}/mo`}
          title="Personal <em>recurring</em>"
          deck="Bills you owe on a schedule. Edit cadence and category from the row."
        />
        <ExpenseList initialData={initialExpenses} />
      </section>

      <section className="flex flex-col gap-5">
        <DepartmentHead
          kicker="Shared · Households"
          count={`${sharedSplitGroups.length} bill${sharedSplitGroups.length === 1 ? "" : "s"} · ${fmt0(sharedTotal)}/mo`}
          title="Shared <em>household splits</em>"
          deck="Your share of recurring bills across every household you contribute to."
        />
        {sharedSplitGroups.length > 0 ? (
          <SharedSplitsTable groups={sharedSplitGroups} householdNamesById={householdNamesById} />
        ) : (
          <EmptyDispatch>No shared household bills <em>due</em> this month</EmptyDispatch>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <DepartmentHead
          kicker={`One-time · ${monthName}`}
          count={oneTimeBills.length > 0 ? `${oneTimeBills.length} expense${oneTimeBills.length === 1 ? "" : "s"} · ${fmt0(oneTimeTotal)}` : "—"}
          title="One time <em>this month</em>"
          deck="Non-recurring outlays posted to the current period."
        />
        <OneTimeTable bills={oneTimeBills} />
      </section>
    </div>
  );
}
