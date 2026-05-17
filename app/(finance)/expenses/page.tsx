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
    <div className="page-enter flex flex-col gap-10" >
      <div>
        <h1 className="font-serif font-extrabold text-4xl leading-none tracking-snug tracking-[-0.025em] text-ink m-0">
          Expenses
        </h1>
        <p className="text-ink-3 mt-2 text-base">
          Track payments and manage your recurring personal expenses — phone, gym, streaming, insurance.
        </p>
      </div>

      <ExpensesClient initialMonths={initialMonths} initialExpenses={initialExpenses} />
    </div>
  );
}
