import Link from "next/link";
import { Btn, EmptyState, Icon } from "@/components/editorial";
import { SectionHead } from "../../section-head";
import { FinanceTabs } from "../../personal-finance-sub-nav";
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
 * Mirrors the Terminus prototype's PAGES['/expenses'] Finance overview: a `.page-head`, the
 * `.stats` 4-up strip, then the `.grid-2` of recent expenses + income/budget — wired to real data.
 * The one thing Overview uniquely carries — the cross-household net-positions table — sits between
 * the stats and the bill lists (a single household's money lives in the household itself).
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

  // Terminus `.page-head` — kicker / title / deck + Filter & Add-expense actions. The masthead
  // (layout topBand) carries the desk + tabs; this page head leads the scroll area like the proto.
  const pageHead = (
    <header className="page-head">
      <div className="titles">
        <div className="kicker" style={{ marginBottom: "8px" }}>
          // WORKSPACE · FINANCE
        </div>
        <h1>Finance</h1>
        <p className="deck">
          Your take-home, what&apos;s going out, where you net out across every household, and the
          bills behind it.
        </p>
      </div>
      <div className="actions">
        <Btn
          href="/finance/expenses/new"
          variant="primary"
          size="sm"
          iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}
        >
          Add expense
        </Btn>
      </div>
    </header>
  );

  if (!hasAnything) {
    return (
      <div className="page-enter flex flex-col gap-6">
        {pageHead}
        <FinanceTabs />
        <EmptyState
          glyph={<Icon name="expenses" size={24} strokeWidth={1.5} />}
          kicker="// MONEY_EMPTY"
          title="Nothing to summarize yet"
          body="Add an income source or a shared expense and your monthly picture builds itself here."
          cta={{ label: "$ add-income →", href: "/finance/income/new" }}
          secondaryCta={{ label: "$ add-expense →", href: "/finance/expenses/new" }}
        />
      </div>
    );
  }

  // Cross-household net-positions — injected between the `.stats` strip and the bill lists.
  const netPositions = (
    <section className="flex flex-col gap-5">
      <SectionHead
        kicker="ACROSS YOUR HOUSEHOLDS"
        count={`${groups.length} ${groups.length === 1 ? "household" : "households"}`}
        title="Household <em>balances</em>"
        deck="What you'd pay or collect to settle up in each household today."
      />
      {groups.length === 0 ? (
        <p className="label" style={{ color: "var(--text-3)" }}>
          No shared balances across your households yet.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Household</th>
                <th className="right">Your balance</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const owed = g.net > 0.005;
                const owe = g.net < -0.005;
                return (
                  <tr key={g.id}>
                    <td>
                      <Link href={`/household/${g.id}`} className="row-title">
                        {g.name}
                      </Link>
                    </td>
                    <td className="right">
                      {owed ? (
                        <span className="badge green">owed {formatCurrency(g.net, g.currency)}</span>
                      ) : owe ? (
                        <span className="badge red">
                          you owe {formatCurrency(Math.abs(g.net), g.currency)}
                        </span>
                      ) : (
                        <span className="badge">settled up</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <div className="page-enter flex flex-col gap-8">
      {pageHead}
      <FinanceTabs />

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
