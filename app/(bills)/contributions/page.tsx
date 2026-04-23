import Link from "next/link";
import { cookies } from "next/headers";
import { SERVER_API } from "@/lib/api-url";
import { ContributionsView, type ContributionPeriodSummary } from "./contributions-view";

export const dynamic = "force-dynamic";

interface OverviewResponse {
  contributionsByMonth?: ContributionPeriodSummary[];
  totalMonthlyIncome?: number;
}

export default async function ContributionsPage() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  const res = await fetch(`${SERVER_API}/api/bills/overview`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  }).catch(() => null);

  const overview: OverviewResponse | null = res && res.ok ? await res.json() : null;
  const months = overview?.contributionsByMonth ?? [];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)" }}>
            Contributions
          </h1>
          <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
            Your splits across all households, scheduled against your income.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link
            href="/households"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "500",
              textDecoration: "none",
            }}
          >
            Households
          </Link>
          <Link
            href="/income"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "500",
              textDecoration: "none",
            }}
          >
            Income
          </Link>
        </div>
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
            No contributions scheduled
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-3)", maxWidth: "320px" }}>
            When bills are split and assigned to you, your monthly obligations will show up here.
          </p>
        </div>
      ) : (
        <ContributionsView months={months} />
      )}
    </div>
  );
}

