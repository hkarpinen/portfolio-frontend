import { getCookieHeader } from "@/lib/server-cookies";
import { fetchExpensesServer } from "@/lib/api/expenses";
import { fetchContributionSummaryServer } from "@/lib/api/households";
import { ExpensesClient } from "./expenses-client";
import type { Expense } from "@/types/finance";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const cookieHeader = await getCookieHeader();
  const [page, months] = await Promise.all([
    fetchExpensesServer(cookieHeader),
    fetchContributionSummaryServer(cookieHeader),
  ]);

  const initialExpenses = page ?? { items: [] as Expense[], totalCount: 0 };
  const initialMonths = months ?? [];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-h2)", lineHeight: "var(--lh-display)", letterSpacing: "-0.02em", letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
          Expenses
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "var(--ts-body-sm)" }}>
          Track payments and manage your recurring personal expenses — phone, gym, streaming, insurance.
        </p>
      </div>

      <ExpensesClient initialMonths={initialMonths} initialExpenses={initialExpenses} />
    </div>
  );
}
