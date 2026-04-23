import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SERVER_API } from "@/lib/api-url";
import { IncomeClient } from "./income-client";

export const dynamic = "force-dynamic";

interface IncomeSource {
  incomeId: string;
  source: string;
  amount: number;
  frequency: string;
  currency?: string;
}

interface HouseholdDetail {
  householdId: string;
  name: string;
  currencyCode: string;
}

function serverFetch<T>(path: string, cookieHeader: string): Promise<T | null> {
  return fetch(`${SERVER_API}${path}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  })
    .then((r) => (r.ok ? (r.json() as Promise<T>) : null))
    .catch(() => null);
}

function toMonthly(amount: number, frequency: string): number {
  const f = frequency?.toUpperCase();
  if (f === "WEEKLY") return (amount * 52) / 12;
  if (f === "BIWEEKLY") return (amount * 26) / 12;
  if (f === "ANNUALLY") return amount / 12;
  if (f === "QUARTERLY") return amount / 3;
  if (f === "SEMIANNUALLY") return amount / 6;
  return amount;
}

export default async function HouseholdIncomePage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const [household, incomeData] = await Promise.all([
    serverFetch<HouseholdDetail>(`/api/bills/households/${params.id}`, cookieHeader),
    serverFetch<{ items?: IncomeSource[] }>(
      `/api/bills/income?householdId=${params.id}`,
      cookieHeader
    ),
  ]);

  if (!household) notFound();

  const sources: IncomeSource[] = incomeData?.items ?? [];
  const monthlyTotal = sources.reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0);
  const annualTotal = monthlyTotal * 12;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <Link href={`/households/${params.id}`} style={{ color: "var(--text-3)", fontSize: "12px", textDecoration: "none" }}>
          ← {household.name}
        </Link>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", marginTop: "4px" }}>
          Income
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          Income sources for this household
        </p>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex" }}>
        {[
          { label: "Bills", href: `/households/${params.id}` },
          { label: "Contributions", href: `/households/${params.id}/contributions` },
          { label: "Income", href: `/households/${params.id}/income` },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: tab.label === "Income" ? 600 : 400,
              color: tab.label === "Income" ? "var(--text)" : "var(--text-3)",
              borderBottom: tab.label === "Income" ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: "-1px",
              textDecoration: "none",
              transition: "color 110ms",
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <IncomeClient
        householdId={params.id}
        currency={household.currencyCode}
        sources={sources}
        monthlyTotal={monthlyTotal}
        annualTotal={annualTotal}
        sourceCount={sources.length}
      />
    </div>
  );
}
