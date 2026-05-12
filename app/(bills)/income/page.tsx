import { getCookieHeader } from "@/lib/server-cookies";
import { IncomeList } from "./income-list";
import { fetchIncomeServer } from "@/lib/api/income";
import { toMonthlyAmount } from "@/lib/utils";
import type { IncomeSource } from "@/types/finance";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function IncomePage() {
  const incomePage = await fetchIncomeServer(await getCookieHeader()) ?? { items: [] as IncomeSource[] };
  const sources: IncomeSource[] = incomePage.items ?? [];

  const toMonthly = (s: IncomeSource) => toMonthlyAmount(s.amount, s.quotedAs);

  const isRecurring = (s: IncomeSource) => {
    const freq = s.paidEvery?.toUpperCase();
    return freq && freq !== "ONCE" && freq !== "ONE_TIME" && freq !== "ONETIME";
  };

  const monthlyGross = sources.reduce((sum, s) => sum + toMonthly(s), 0);
  const recurringTotal = sources.filter(isRecurring).reduce((sum, s) => sum + toMonthly(s), 0);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)" }}>
            Income
          </h1>
          <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
            Manage your personal income sources
          </p>
        </div>
        <Link
          href="/income/new"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", borderRadius: "10px",
            background: "var(--accent)", color: "#fff",
            fontSize: "13px", fontWeight: "600", textDecoration: "none",
            flexShrink: 0, marginTop: "4px",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add income source
        </Link>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px" }}>
        {[
          { label: "Gross Monthly", value: `$${monthlyGross.toFixed(2)}`, icon: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>, accent: "var(--accent)", bg: "var(--accent-subtle)" },
          { label: "Recurring", value: `$${recurringTotal.toFixed(2)}`, icon: <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>, accent: "var(--success)", bg: "var(--success-s)" },
          { label: "Sources", value: String(sources.length), icon: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>, accent: "var(--warning)", bg: "var(--warning-s)" },
        ].map(({ label, value, icon, accent, bg }) => (
          <div key={label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "18px 20px",
            boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              </div>
            </div>
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Income sources list */}
      <div>
        <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
          Income Sources
        </p>
        <IncomeList initialData={incomePage} />
      </div>
    </div>
  );
}
