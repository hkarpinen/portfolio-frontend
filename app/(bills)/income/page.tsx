import { getCookieHeader } from "@/lib/server-cookies";
import { AddIncomeForm } from "./add-income-form";
import { IncomeList } from "./income-list";
import { fetchIncomeServer } from "@/lib/api/income";
import type { IncomeSource } from "@/types/bills";

export const dynamic = 'force-dynamic';

export default async function IncomePage() {
  const incomePage = await fetchIncomeServer(await getCookieHeader()) ?? { items: [] as IncomeSource[] };
  const sources: IncomeSource[] = incomePage.items ?? [];

  const toMonthly = (s: IncomeSource) => {
    const freq = s.frequency?.toUpperCase();
    if (freq === "WEEKLY") return s.amount * 52 / 12;
    if (freq === "BIWEEKLY") return s.amount * 26 / 12;
    if (freq === "ANNUALLY") return s.amount / 12;
    return s.amount;
  };

  const isRecurring = (s: IncomeSource) => {
    const freq = s.frequency?.toUpperCase();
    return freq && freq !== "ONCE" && freq !== "ONE_TIME" && freq !== "ONETIME";
  };

  const monthlyTotal = sources.reduce((sum, s) => sum + toMonthly(s), 0);
  const recurringTotal = sources.filter(isRecurring).reduce((sum, s) => sum + toMonthly(s), 0);
  const oneTimeTotal = sources.filter((s) => !isRecurring(s)).reduce((sum, s) => sum + toMonthly(s), 0);

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

      {/* Stats grid — 3 cards always visible */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px" }}>
        {[
          { label: "This month", value: `$${monthlyTotal.toFixed(2)}`, icon: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>, accent: "var(--accent)", bg: "var(--accent-subtle)" },
          { label: "Recurring", value: `$${recurringTotal.toFixed(2)}`, icon: <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>, accent: "var(--success)", bg: "var(--success-s)" },
          { label: "One-time", value: `$${oneTimeTotal.toFixed(2)}`, icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>, accent: "var(--warning)", bg: "var(--warning-s)" },
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

      <AddIncomeForm />
    </div>
  );
}
