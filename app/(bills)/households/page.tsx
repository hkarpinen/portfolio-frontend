import Link from "next/link";
import { getCookieHeader } from "@/lib/server-cookies";
import { JoinHouseholdButton } from "./join-button";
import { fetchOverviewServer } from "@/lib/api/households";
import type { HouseholdSummary, UpcomingHouseholdExpense } from "@/types/finance";
import styles from "./households.module.css";

export const dynamic = 'force-dynamic';

export default async function HouseholdsPage() {
  const now = new Date();

  const overview = await fetchOverviewServer(await getCookieHeader());
  const households: HouseholdSummary[] = overview?.households ?? [];
  const upcomingBills: UpcomingHouseholdExpense[] = overview?.upcomingBills ?? [];
  const totalIncome = overview?.totalMonthlyIncome ?? 0;
  const totalPersonalBills = overview?.totalPersonalBillsMonthly ?? 0;

  const householdObligations = households.reduce((sum, h) => sum + Number(h.totalBills), 0);
  const totalObligations = householdObligations + totalPersonalBills;
  const coverageRatio = totalObligations > 0 ? Math.min(totalIncome / totalObligations, 1) : 1;
  const overcommitted = totalObligations > totalIncome && totalObligations > 0;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        {/* Title + inline stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
              Households
            </h1>
            <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
              {new Date(now).toLocaleString("default", { month: "long", year: "numeric" })}
            </p>
          </div>
          {/* Compact stat pill strip */}
          {households.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                {
                  label: "Balance",
                  value: `$${(totalIncome - totalObligations).toFixed(0)}`,
                  color: overcommitted ? "var(--warning)" : "var(--success)",
                },
                {
                  label: "Obligations",
                  value: `$${totalObligations.toFixed(0)}/mo`,
                  color: "var(--text)",
                },
                {
                  label: `${households.length} household${households.length !== 1 ? "s" : ""}`,
                  value: null,
                  color: "var(--text-2)",
                },
              ].map((s) => (
                <span key={s.label} style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-full)", padding: "4px 10px",
                  fontSize: "12px", color: "var(--text-3)",
                }}>
                  {s.value && (
                    <span style={{ fontFamily: "var(--ff-display)", fontWeight: "700", color: s.color, fontSize: "13px" }}>{s.value}</span>
                  )}
                  {s.label}
                  {overcommitted && s.label === "Balance" && (
                    <span style={{ fontSize: "10px", color: "var(--warning)", fontWeight: "600" }}>· over budget</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions — primary + demoted join */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <JoinHouseholdButton />
          <Link
            href="/households/new"
            style={{
              background: "var(--accent)", color: "#fff",
              padding: "8px 16px", borderRadius: "12px",
              fontSize: "13px", fontWeight: "600", textDecoration: "none",
            }}
          >
            + New household
          </Link>
        </div>
      </div>

      {/* ── Upcoming expenses banner (collapsed to single line) ───────────────── */}
      {upcomingBills.length > 0 && (
        <div style={{
          background: "var(--warning-s)", border: "1px solid color-mix(in oklch, var(--warning) 30%, transparent)",
          borderRadius: "var(--r-lg)", padding: "12px 16px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
          <p style={{ flex: 1, fontSize: "13px", color: "var(--text-2)", margin: 0 }}>
            <span style={{ fontWeight: "600", color: "var(--warning)" }}>{upcomingBills.length} shared expense{upcomingBills.length !== 1 ? "s" : ""} due in 7 days</span>
            {" — "}
            {upcomingBills.slice(0, 2).map((b, i) => (
              <span key={b.billId}>
                {i > 0 && ", "}
                <span style={{ fontWeight: "500" }}>{b.title}</span>
                <span style={{ color: "var(--text-3)" }}> ({b.householdName})</span>
              </span>
            ))}
            {upcomingBills.length > 2 && <span style={{ color: "var(--text-3)" }}> +{upcomingBills.length - 2} more</span>}
          </p>
        </div>
      )}

      {/* ── Households grid ────────────────────────────────────────────────── */}
      {households.length === 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "48px 24px", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
        }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px", color: "var(--text)" }}>No households yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Create your first household to start tracking shared expenses</p>
          <Link
            href="/households/new"
            style={{
              background: "var(--accent)", color: "#fff",
              padding: "10px 24px", borderRadius: "12px",
              fontWeight: "600", fontSize: "13px", textDecoration: "none", marginTop: "4px",
            }}
          >
            Create a household
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {households.map((h, i) => {
            const over = h.netBalance < 0;
            const HOUSEHOLD_COLORS = ["var(--accent)", "var(--accent-v)", "var(--success)", "var(--warning)"];
            const cardColor = HOUSEHOLD_COLORS[i % HOUSEHOLD_COLORS.length];
            const hCoverageRatio = Number(h.totalGrossIncome) > 0 && Number(h.totalBills) > 0
              ? Math.min(Number(h.totalGrossIncome) / Number(h.totalBills), 1)
              : Number(h.totalBills) === 0 ? 1 : 0;
            return (
              <Link
                key={h.householdId}
                href={`/households/${h.householdId}`}
                style={{ textDecoration: "none" }}
              >
                <div className={styles.cardHover} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "16px", padding: "20px",
                  boxShadow: "var(--shadow-sm)", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: "0",
                }}>
                  {/* Name + meta */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "17px", color: "var(--text)", margin: 0, lineHeight: 1.2 }}>{h.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
                        {h.memberCount} member{h.memberCount !== 1 ? "s" : ""} · {h.totalBills} expense{Number(h.totalBills) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {/* Balance badge */}
                    <span style={{
                      fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "14px",
                      color: over ? "var(--danger)" : "var(--success)",
                      background: over ? "var(--danger-s)" : "var(--success-s)",
                      borderRadius: "var(--r-full)", padding: "3px 10px",
                      flexShrink: 0, whiteSpace: "nowrap",
                    }}>
                      {over ? "–" : "+"}{h.currencyCode} {Math.abs(Number(h.netBalance)).toFixed(0)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ background: "var(--surface-3)", borderRadius: "9999px", height: "4px", overflow: "hidden" }}>
                      <div style={{
                        background: cardColor, borderRadius: "9999px", height: "4px",
                        width: `${hCoverageRatio * 100}%`, transition: "width 400ms ease",
                      }} />
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "5px" }}>
                      Your share: <span style={{ color: cardColor, fontWeight: "600" }}>${Number(h.totalBills).toFixed(0)}/mo</span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
