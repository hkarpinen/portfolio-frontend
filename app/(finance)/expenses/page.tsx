import { EditorialPageHead } from "@/components/editorial";
import { getCookieHeader } from "@/lib/server-cookies";
import { fetchExpensesServer } from "@/lib/api/expenses";
import { fetchContributionSummaryServer, listHouseholdsServer } from "@/lib/api/households";
import type { HouseholdSummaryDto } from "@/lib/api/households";
import { fetchIncomeServer } from "@/lib/api/income";

import { ExpensesClient } from "./expenses-client";
import { computeIncomeMonthly } from "./expenses-derivations";
import { currentMonthName, expensesHeadline, expensesDeck } from "@/lib/finance/editorial-copy";
import {
  findCurrentPeriod,
  monthObligations,
  oneTimePersonalBills,
  recurringPersonalBills,
  sharedBillIds,
} from "@/lib/contributions";
import type { Expense } from "@/types/expense";
import type { IncomeSource } from "@/types/income";

export const dynamic = "force-dynamic";

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
  // composition rather than two views of two truths. `now` is plumbed so
  // the SSR pass and the client hydration agree on which period is current.
  const currentPeriod = findCurrentPeriod(initialMonths, now);
  const { monthlyGross, monthlyNet } = computeIncomeMonthly(initialIncome);
  const totalOut = monthObligations(currentPeriod);
  const disposable = monthlyNet - totalOut;
  const recurringCount = recurringPersonalBills(currentPeriod).length;
  const oneTimeCount = oneTimePersonalBills(currentPeriod).length;
  const sharedBillCount = sharedBillIds(currentPeriod).size;

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
      <EditorialPageHead kicker={`${monthName} edition`} title={headline} deck={deck} />

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
