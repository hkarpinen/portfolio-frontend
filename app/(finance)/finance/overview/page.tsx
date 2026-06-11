import { ArrowLink, DepartmentHead, EditorialPageHead, EmptyState, Icon } from "@/components/editorial";
import { getCookieHeader } from "@/lib/server-cookies";
import { fetchContributionSummaryServer, listHouseholdsServer } from "@/lib/api/households";
import type { HouseholdSummaryDto } from "@/lib/api/households";
import { fetchIncomeServer } from "@/lib/api/income";
import { fetchUserPositionServer } from "@/lib/api/ledger";
import { fetchExpensesServer } from "@/lib/api/expenses";
import { ExpensesClient } from "../expenses/expenses-client";
import { currentMonthName } from "@/lib/finance/editorial-copy";
import { formatCurrency } from "@/lib/formatting";
import type { Expense } from "@/types/expense";
import type { IncomeSource } from "@/types/income";

export const dynamic = "force-dynamic";

/**
 * Personal Money home — your whole money picture in one page: where you stand this month
 * (take-home vs obligations), where you net out across every household, and the bills behind it.
 *
 * Merged from the former Overview + Expenses tabs, which both led with the same disposable figure.
 * The one thing Overview uniquely carried — the cross-household net-positions table — now sits
 * between the lede and the bill lists (a single household's money lives in the household itself).
 */
export default async function FinanceOverviewPage() {
  const cookieHeader = await getCookieHeader();
  const [months, incomePage, households, position, expensesPage] = await Promise.all([
    fetchContributionSummaryServer(cookieHeader),
    fetchIncomeServer(cookieHeader),
    listHouseholdsServer(cookieHeader),
    fetchUserPositionServer(cookieHeader),
    fetchExpensesServer(cookieHeader),
  ]);

  const householdList: HouseholdSummaryDto[] = households ?? [];
  const initialMonths = months ?? [];
  const initialIncome: IncomeSource[] = incomePage?.items ?? [];
  const initialExpenses = expensesPage ?? { items: [] as Expense[], totalCount: 0 };
  const householdNamesById: Record<string, string> = Object.fromEntries(
    householdList.map((h) => [h.id, h.name]),
  );

  const now = new Date();
  const monthName = currentMonthName(now);

  // Net position per group — derived straight from the group ledgers (the authoritative source),
  // names resolved from the household list. Only groups with shared activity appear.
  const groups = (position?.groups ?? []).map((g) => ({
    id: g.groupId,
    name: householdNamesById[g.groupId] ?? "Group",
    currency: g.currency,
    net: g.net,
  }));

  const hasAnything =
    initialIncome.length > 0 || householdList.length > 0 || initialMonths.length > 0;

  if (!hasAnything) {
    return (
      <div className="page-enter flex flex-col gap-6">
        <EditorialPageHead
          kicker="Your money"
          title="Where you <em>stand</em>"
          deck="Your take-home, what's going out, and where you net out across every household."
        />
        <EmptyState
          glyph={<Icon name="expenses" size={24} strokeWidth={1.5} />}
          title="Nothing to summarize yet"
          body="Add an income source or a shared expense and your monthly picture builds itself here."
          cta={{ label: "+ Add income", href: "/finance/income/new" }}
          secondaryCta={{ label: "+ Add expense", href: "/finance/expenses/new" }}
        />
      </div>
    );
  }

  // Cross-household net-positions — injected between the financial-summary lede and the bill lists.
  const netPositions = (
    <section className="flex flex-col gap-5">
      <DepartmentHead
        kicker="Across your households"
        count={`${groups.length} ${groups.length === 1 ? "household" : "households"}`}
        title="Household <em>balances</em>"
        deck="What you'd pay or collect to settle up in each household today."
      />
      {groups.length === 0 ? (
        <p className="ed-empty-dispatch">No shared balances across your households yet.</p>
      ) : (
        <table className="ed-agate">
          <thead>
            <tr>
              <th>Household</th>
              <th className="num">Your balance</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const owed = g.net > 0.005;
              const owe = g.net < -0.005;
              return (
                <tr key={g.id}>
                  <td>
                    <ArrowLink href={`/household/${g.id}`}>{g.name}</ArrowLink>
                  </td>
                  <td className="num">
                    <span className={owed ? "text-green" : owe ? "text-red" : "text-ink-3"}>
                      {owed
                        ? `owed ${formatCurrency(g.net, g.currency)}`
                        : owe
                          ? `you owe ${formatCurrency(Math.abs(g.net), g.currency)}`
                          : "settled up"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );

  return (
    <div className="page-enter flex flex-col gap-8">
      <EditorialPageHead
        kicker="Your money"
        title="Where you <em>stand</em>"
        deck="Your take-home, what's going out, where you net out across every household, and the bills behind it."
      />

      <ExpensesClient
        initialMonths={initialMonths}
        initialExpenses={initialExpenses}
        initialIncome={initialIncome}
        householdNamesById={householdNamesById}
        monthName={monthName}
        afterSummary={netPositions}
      />
    </div>
  );
}
