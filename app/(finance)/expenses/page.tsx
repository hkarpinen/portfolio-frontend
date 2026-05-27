import { getCookieHeader } from "@/lib/server-cookies";
import { fetchExpensesServer } from "@/lib/api/expenses";
import { fetchContributionSummaryServer, listHouseholdsServer } from "@/lib/api/households";
import type { HouseholdSummaryDto } from "@/lib/api/households";
import { fetchIncomeServer } from "@/lib/api/income";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { ExpensesClient } from "./expenses-client";
import {
  currentMonthName,
  expensesHeadline,
  expensesDeck,
} from "@/lib/finance/editorial-copy";
import { toMonthlyAmount } from "@/lib/utils";
import type { Expense, IncomeSource } from "@/types/finance";

export const dynamic = "force-dynamic";

/** Mirrors the calculation inside FinancialSummary so the headline + deck
 *  derived here read the same figures the lede block will render. */
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

export default async function ExpensesPage() {
  const cookieHeader = await getCookieHeader();
  const [page, months, incomePage, householdsList] = await Promise.all([
    fetchExpensesServer(cookieHeader),
    fetchContributionSummaryServer(cookieHeader),
    fetchIncomeServer(cookieHeader),
    listHouseholdsServer(cookieHeader),
  ]);

  const initialExpenses = page ?? { items: [] as Expense[], totalCount: 0 };
  const initialMonths = months ?? [];
  const initialIncome: IncomeSource[] = incomePage?.items ?? [];
  const householdNamesById: Record<string, string> = Object.fromEntries(
    (householdsList ?? []).map((h: HouseholdSummaryDto) => [h.id, h.name]),
  );

  // Use a server-side render date so the masthead is stable across the
  // initial paint and the hydration step.
  const now = new Date();
  const monthName = currentMonthName(now);

  // Headline + deck are derived server-side from the same figures the
  // FinancialSummary lede will render, so the front-page reads as one
  // composition rather than two views of two truths.
  const nowKey = now.toISOString().slice(0, 7);
  const currentPeriod = initialMonths.find((m) => m.periodStart.slice(0, 7) === nowKey);
  const { monthlyGross, monthlyNet } = computeIncomeMonthly(initialIncome);
  const sharedDue = currentPeriod?.totalDue ?? 0;
  const personalDue = currentPeriod?.personalBillsDue ?? 0;
  const totalOut = sharedDue + personalDue;
  const disposable = monthlyNet - totalOut;
  const recurringCount = (currentPeriod?.personalBills ?? []).filter((b) => b.recurrenceFrequency).length;
  const oneTimeCount = (currentPeriod?.personalBills ?? []).filter((b) => !b.recurrenceFrequency).length;
  const sharedBillCount = new Set((currentPeriod?.contributions ?? []).map((c) => c.billId)).size;

  const headline = expensesHeadline({ disposable, income: monthlyGross, monthName });
  const deck = expensesDeck({
    income: monthlyGross,
    totalOut,
    recurringCount,
    oneTimeCount,
    sharedBillCount,
  });

  return (
    <div className="page-enter flex flex-col gap-6">
      <EditorialPageHead
        kicker={`${monthName} edition`}
        title={headline}
        deck={deck}
      />

      <ExpensesClient
        initialMonths={initialMonths}
        initialExpenses={initialExpenses}
        initialIncome={initialIncome}
        householdNamesById={householdNamesById}
        monthName={monthName}
      />
    </div>
  );
}
