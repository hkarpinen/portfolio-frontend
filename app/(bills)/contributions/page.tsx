import { getCookieHeader } from "@/lib/server-cookies";
import { BudgetView } from "./contributions-view";
import { fetchOverviewServer } from "@/lib/api/households";
import type { ContributionPeriodSummary } from "@/types/bills";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const overview = await fetchOverviewServer(await getCookieHeader());
  const months: ContributionPeriodSummary[] = overview?.contributionsByMonth ?? [];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)" }}>
          Budget
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          All obligations — household splits and personal bills — scheduled against your income.
        </p>
      </div>

      {months.length === 0 ? (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "48px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--text)" }}>
            No obligations scheduled
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-3)", maxWidth: "320px" }}>
            Add income sources and bills to see your budget timeline here.
          </p>
        </div>
      ) : (
        <BudgetView months={months} />
      )}
    </div>
  );
}

