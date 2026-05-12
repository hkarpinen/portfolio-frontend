import { getCookieHeader } from "@/lib/server-cookies";
import { fetchExpensesServer } from "@/lib/api/expenses";
import { fetchOverviewServer } from "@/lib/api/households";
import { ExpensesClient } from "./expenses-client";
import type { Expense, ContributionPeriodSummary } from "@/types/finance";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const cookieHeader = await getCookieHeader();
  const [page, overview] = await Promise.all([
    fetchExpensesServer(cookieHeader),
    fetchOverviewServer(cookieHeader),
  ]);

  const initialExpenses = page ?? { items: [] as Expense[], totalCount: 0 };
  const initialMonths: ContributionPeriodSummary[] = overview?.contributionsByMonth ?? [];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
          Expenses
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          Track payments and manage your recurring personal expenses — phone, gym, streaming, insurance.
        </p>
      </div>

      <ExpensesClient initialMonths={initialMonths} initialExpenses={initialExpenses} />
    </div>
  );
}
