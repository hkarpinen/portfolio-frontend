import Link from "next/link";
import { getCookieHeader } from "@/lib/server-cookies";
import { JoinHouseholdButton } from "./join-button";
import { fetchOverviewServer } from "@/lib/api/households";
import type { HouseholdSummary, UpcomingBill } from "@/types/bills";
import styles from "./households.module.css";

export const dynamic = 'force-dynamic';

export default async function HouseholdsPage() {
  const now = new Date();

  const overview = await fetchOverviewServer(await getCookieHeader());
  const households: HouseholdSummary[] = overview?.households ?? [];
  const upcomingBills: UpcomingBill[] = overview?.upcomingBills ?? [];
  const totalIncome = overview?.totalMonthlyIncome ?? 0;
  const totalPersonalBills = overview?.totalPersonalBillsMonthly ?? 0;

  const householdObligations = households.reduce((sum, h) => sum + Number(h.totalBills), 0);
  const totalObligations = householdObligations + totalPersonalBills;
  const coverageRatio = totalObligations > 0 ? Math.min(totalIncome / totalObligations, 1) : 1;
  const overcommitted = totalObligations > totalIncome && totalObligations > 0;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)" }}>
            Bills
          </h1>
          <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
            {households.length} household{households.length !== 1 ? "s" : ""} · {new Date(now).toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <JoinHouseholdButton />
          <Link
            href="/households/new"
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            + New Household
          </Link>
        </div>
      </div>

      {/* Summary stat cards — only shown when there's at least one household */}
      {households.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {/* Monthly Obligations */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Monthly Obligations
              </span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
            </div>
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
              ${totalObligations.toFixed(2)}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
              {totalPersonalBills > 0
                ? `$${householdObligations.toFixed(2)} household + $${totalPersonalBills.toFixed(2)} personal`
                : "Combined household bills this month"}
            </p>
          </div>

          {/* Your Income */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Your Income
              </span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
            </div>
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
              ${totalIncome.toFixed(2)}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
              {totalIncome === 0 ? (
                <Link href="/income" style={{ color: "var(--accent)", textDecoration: "none" }}>Add income sources</Link>
              ) : "Active income sources"}
            </p>
          </div>

          {/* Coverage */}
          <div style={{
            background: "var(--surface)",
            border: `1px solid ${overcommitted ? "var(--warning)" : "var(--border)"}`,
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Coverage
              </span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            </div>
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: overcommitted ? "var(--warning)" : "var(--success)", lineHeight: 1 }}>
              {totalObligations > 0 ? `${(coverageRatio * 100).toFixed(0)}%` : "—"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
              {overcommitted ? "Income doesn't cover obligations" : totalObligations === 0 ? "No bills this month" : "Income covers obligations"}
            </p>
          </div>
        </div>
      )}

      {/* Upcoming bills */}
      {upcomingBills.length > 0 && (
        <div>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
            Due in 7 Days
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {upcomingBills.map((bill) => (
              <div key={bill.billId} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text)" }}>{bill.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>
                    {bill.householdName} · due {new Date(bill.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </div>
                <p style={{ fontWeight: "700", fontSize: "13px", color: "var(--text)", fontFamily: "var(--ff-display)" }}>
                  {bill.currency} {Number(bill.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Households grid */}
      <div>
        <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
          Households
        </p>
        {households.length === 0 ? (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--text)" }}>No households yet</p>
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Create your first household to start tracking bills</p>
            <Link
              href="/households/new"
              style={{
                background: "var(--accent)",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "13px",
                textDecoration: "none",
                marginTop: "4px",
              }}
            >
              Create your first household
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {households.map((h) => {
              const over = h.netBalance < 0;
              const hCoverageRatio = Number(h.totalIncome) > 0 && Number(h.totalBills) > 0
                ? Math.min(Number(h.totalIncome) / Number(h.totalBills), 1)
                : Number(h.totalBills) === 0 ? 1 : 0;
              return (
                <Link
                  key={h.householdId}
                  href={`/households/${h.householdId}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className={styles.cardHover} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "var(--shadow-sm)",
                    cursor: "pointer",
                  }}>
                    {/* Name + description */}
                    <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--text)" }}>{h.name}</p>
                    {h.description && (
                      <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "4px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {h.description}
                      </p>
                    )}

                    {/* Badges row */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
                      <span style={{
                        background: "var(--accent-subtle)",
                        color: "var(--accent)",
                        borderRadius: "9999px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}>
                        {h.memberCount} member{h.memberCount !== 1 ? "s" : ""}
                      </span>
                      <span style={{
                        background: "var(--surface-2)",
                        color: "var(--text-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "9999px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}>
                        {h.totalBills} bill{Number(h.totalBills) !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Net balance */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Monthly</span>
                      <span style={{
                        fontFamily: "var(--ff-display)",
                        fontWeight: "700",
                        fontSize: "14px",
                        color: over ? "var(--danger)" : "var(--success)",
                      }}>
                        {h.currencyCode} {Number(h.netBalance).toFixed(2)}
                      </span>
                    </div>

                    {/* Coverage progress bar */}
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ background: "var(--surface-3)", borderRadius: "9999px", height: "6px", overflow: "hidden" }}>
                        <div style={{
                          background: "var(--accent)",
                          borderRadius: "9999px",
                          height: "6px",
                          width: `${hCoverageRatio * 100}%`,
                          transition: "width 400ms ease",
                        }} />
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>
                        {(hCoverageRatio * 100).toFixed(0)}% income coverage
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
