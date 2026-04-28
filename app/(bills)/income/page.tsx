import { getCookieHeader } from "@/lib/server-cookies";
import { AddIncomeForm } from "./add-income-form";
import { IncomeList } from "./income-list";
import { fetchIncomeServer } from "@/lib/api/bills";
import type { IncomeSource } from "@/types/api";

export const dynamic = 'force-dynamic';

export default async function IncomePage() {
  const incomePage = await fetchIncomeServer(await getCookieHeader()) ?? { items: [] as IncomeSource[] };
  const sources: IncomeSource[] = incomePage.items ?? [];

  const monthlyTotal = sources.reduce((sum, s) => {
    const freq = s.frequency?.toUpperCase();
    if (freq === "WEEKLY") return sum + s.amount * 52 / 12;
    if (freq === "BIWEEKLY") return sum + s.amount * 26 / 12;
    if (freq === "ANNUALLY") return sum + s.amount / 12;
    return sum + s.amount;
  }, 0);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)" }}>
          Income
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          Manage your personal income sources
        </p>
      </div>

      {/* Monthly total stat card */}
      {sources.length > 0 && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "0",
          maxWidth: "320px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Total Monthly Income
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            ${monthlyTotal.toFixed(2)}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
            {sources.length} active source{sources.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Income sources list */}
      <div>
        <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
          Income Sources
        </p>
        <IncomeList initialData={incomePage} />
      </div>

      <AddIncomeForm />
    </div>
  );
}
