"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContributionItem, PersonalBillItem, ContributionPeriodSummary } from "@/types/bills";

type Period = "monthly" | "quarterly" | "yearly";

function fmt(amount: number) {
  return `$${amount.toFixed(2)}`;
}

// ─── Aggregation helpers ────────────────────────────────────────────────────

interface AggregatedPeriod {
  label: string;
  totalDue: number;          // household splits
  totalPaid: number;
  personalBillsDue: number;  // personal bills
  projectedIncome: number;   // gross
  projectedNetIncome: number; // net after deductions
  net: number;               // net income - splits - personal
  contributions: ContributionItem[];
  personalBills: PersonalBillItem[];
  isCurrent?: boolean;
}

function aggregateByYear(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const map = new Map<number, AggregatedPeriod>();
  for (const m of months) {
    const y = new Date(m.periodStart).getUTCFullYear();
    const bucket = map.get(y) ?? {
      label: String(y),
      totalDue: 0, totalPaid: 0, personalBillsDue: 0,
      projectedIncome: 0, projectedNetIncome: 0, net: 0,
      contributions: [], personalBills: [],
    };
    bucket.totalDue += m.totalDue;
    bucket.totalPaid += m.totalPaid;
    bucket.personalBillsDue += m.personalBillsDue ?? 0;
    bucket.projectedIncome += m.projectedIncome;
    bucket.projectedNetIncome += m.projectedNetIncome ?? m.projectedIncome;
    bucket.net += m.netAfterContributions;
    bucket.contributions.push(...m.contributions);
    bucket.personalBills.push(...(m.personalBills ?? []));
    map.set(y, bucket);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

function aggregateByQuarter(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const map = new Map<string, AggregatedPeriod>();
  const nowKey = new Date().toISOString().slice(0, 7);
  for (const m of months) {
    const d = new Date(m.periodStart);
    const y = d.getUTCFullYear();
    const q = Math.floor(d.getUTCMonth() / 3) + 1;
    const key = `${y}-Q${q}`;
    const bucket = map.get(key) ?? {
      label: `Q${q} ${y}`,
      totalDue: 0, totalPaid: 0, personalBillsDue: 0,
      projectedIncome: 0, projectedNetIncome: 0, net: 0,
      contributions: [], personalBills: [],
      isCurrent: false,
    };
    bucket.totalDue += m.totalDue;
    bucket.totalPaid += m.totalPaid;
    bucket.personalBillsDue += m.personalBillsDue ?? 0;
    bucket.projectedIncome += m.projectedIncome;
    bucket.projectedNetIncome += m.projectedNetIncome ?? m.projectedIncome;
    bucket.net += m.netAfterContributions;
    bucket.contributions.push(...m.contributions);
    bucket.personalBills.push(...(m.personalBills ?? []));
    if (m.periodStart.slice(0, 7) === nowKey) bucket.isCurrent = true;
    map.set(key, bucket);
  }
  return [...map.values()];
}

function toMonthlyPeriods(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const nowKey = new Date().toISOString().slice(0, 7);
  return months.map((m) => ({
    label: m.periodLabel,
    totalDue: m.totalDue,
    totalPaid: m.totalPaid,
    personalBillsDue: m.personalBillsDue ?? 0,
    projectedIncome: m.projectedIncome,
    projectedNetIncome: m.projectedNetIncome ?? m.projectedIncome,
    net: m.netAfterContributions,
    contributions: m.contributions,
    personalBills: m.personalBills ?? [],
    isCurrent: m.periodStart.slice(0, 7) === nowKey,
  }));
}

// ─── Period selector ─────────────────────────────────────────────────────────

function PeriodTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "9999px",
        border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
        background: active ? "var(--accent-subtle)" : "var(--surface-2)",
        color: active ? "var(--accent)" : "var(--text-3)",
        fontSize: "12px",
        fontWeight: active ? "700" : "500",
        cursor: "pointer",
        transition: "all 110ms",
      }}
    >
      {label}
    </button>
  );
}

// ─── Section header inside expanded card ─────────────────────────────────────

function SectionLabel({ label, count, amount }: { label: string; count: number; amount: number }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 10px 4px",
    }}>
      <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label} ({count})
      </span>
      <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-2)", fontFamily: "var(--ff-display)" }}>
        {fmt(amount)}
      </span>
    </div>
  );
}

// ─── Period card ──────────────────────────────────────────────────────────────

function PeriodCard({ p }: { p: AggregatedPeriod }) {
  const over = p.net < 0;
  const [expanded, setExpanded] = useState(false);
  const totalObligations = p.totalDue + p.personalBillsDue;
  const hasItems = p.contributions.length > 0 || p.personalBills.length > 0;

  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid ${p.isCurrent ? "var(--accent)" : "var(--border)"}`,
      borderRadius: "16px",
      padding: "20px",
      boxShadow: p.isCurrent ? "var(--shadow-md)" : "var(--shadow-sm)",
    }}>
      {/* Header row */}
      <div
        style={{
          display: "flex", flexWrap: "wrap", alignItems: "center",
          justifyContent: "space-between", gap: "8px",
          marginBottom: "16px",
          cursor: hasItems ? "pointer" : "default",
        }}
        onClick={() => hasItems && setExpanded((e) => !e)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "16px", color: "var(--text)", margin: 0 }}>
            {p.label}
          </h3>
          {p.isCurrent && (
            <span style={{
              background: "var(--accent-subtle)", color: "var(--accent)",
              borderRadius: "9999px", padding: "2px 8px",
              fontSize: "11px", fontWeight: "600",
            }}>
              Current
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "15px",
            color: over ? "var(--danger)" : "var(--success)",
          }}>
            Net {over ? "-" : "+"}${Math.abs(p.net).toFixed(2)}
          </span>
          {hasItems && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms", flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px",
        marginBottom: expanded && hasItems ? "16px" : 0,
      }}>
        {[
          { label: "Household splits", val: fmt(p.totalDue) },
          { label: "Personal bills", val: fmt(p.personalBillsDue) },
          { label: "Total obligations", val: fmt(totalObligations) },
          { label: "Gross income", val: fmt(p.projectedIncome) },
          ...(p.projectedNetIncome !== p.projectedIncome ? [{ label: "Net income", val: fmt(p.projectedNetIncome) }] : []),
        ].map(({ label, val }) => (
          <div key={label}>
            <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "16px", color: "var(--text)", marginTop: "2px" }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Expandable detail */}
      {expanded && hasItems && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "0" }}>

          {/* Household splits section */}
          {p.contributions.length > 0 && (
            <div style={{ marginBottom: p.personalBills.length > 0 ? "12px" : 0 }}>
              <SectionLabel label="Household splits" count={p.contributions.length} amount={p.totalDue} />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                {p.contributions
                  .slice()
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((c) => {
                    const due = new Date(c.dueDate);
                    return (
                      <Link key={`${c.splitId}-${c.dueDate}`} href={`/households/${c.householdId}/bills/${c.billId}`} style={{ textDecoration: "none" }}>
                        <div className="row-hover" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "8px 10px", borderRadius: "10px" }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {c.billTitle}
                              </p>
                              {c.isClaimed && (
                                <span style={{ background: "var(--success-s)", color: "var(--success)", borderRadius: "9999px", padding: "2px 8px", fontSize: "11px", fontWeight: "600", flexShrink: 0 }}>
                                  Paid
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.householdName} · due {due.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                              {c.billCategory ? ` · ${c.billCategory}` : ""}
                            </p>
                          </div>
                          <span style={{ fontFamily: "var(--ff-display)", fontSize: "13px", fontWeight: "700", color: "var(--text)", whiteSpace: "nowrap" }}>
                            {c.currency} {c.amount.toFixed(2)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Divider between sections */}
          {p.contributions.length > 0 && p.personalBills.length > 0 && (
            <div style={{ height: "1px", background: "var(--border)", margin: "4px 0 12px" }} />
          )}

          {/* Personal bills section */}
          {p.personalBills.length > 0 && (
            <div>
              <SectionLabel label="Personal bills" count={p.personalBills.length} amount={p.personalBillsDue} />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                {p.personalBills
                  .slice()
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((pb) => {
                    const due = new Date(pb.dueDate);
                    return (
                      <Link key={`${pb.personalBillId}-${pb.dueDate}`} href="/personal-bills" style={{ textDecoration: "none" }}>
                        <div className="row-hover" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "8px 10px", borderRadius: "10px" }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {pb.title}
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "1px" }}>
                              Personal · due {due.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                              {pb.category ? ` · ${pb.category}` : ""}
                            </p>
                          </div>
                          <span style={{ fontFamily: "var(--ff-display)", fontSize: "13px", fontWeight: "700", color: "var(--text)", whiteSpace: "nowrap" }}>
                            {pb.currency} {pb.amount.toFixed(2)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function BudgetView({ months }: { months: ContributionPeriodSummary[] }) {
  const [period, setPeriod] = useState<Period>("monthly");

  const periods: AggregatedPeriod[] =
    period === "yearly" ? aggregateByYear(months)
    : period === "quarterly" ? aggregateByQuarter(months)
    : toMonthlyPeriods(months);

  const currentPeriod = periods.find((p) => p.isCurrent) ?? periods[0];
  const totalObligations = (currentPeriod?.totalDue ?? 0) + (currentPeriod?.personalBillsDue ?? 0);
  const totalIncome = currentPeriod?.projectedIncome ?? 0;
  const totalNet = currentPeriod?.net ?? 0;
  const overallOver = totalNet < 0;
  const periodLabel = currentPeriod?.label ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Period selector + summary */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {(["monthly", "quarterly", "yearly"] as Period[]).map((p) => (
            <PeriodTab key={p} label={p.charAt(0).toUpperCase() + p.slice(1)} active={period === p} onClick={() => setPeriod(p)} />
          ))}
        </div>

        <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-3)", alignItems: "center" }}>
          {periodLabel && <span style={{ fontWeight: "600", color: "var(--text-2)" }}>{periodLabel}</span>}
          <span>Obligations: <strong style={{ color: "var(--text)" }}>{fmt(totalObligations)}</strong></span>
          <span>Income: <strong style={{ color: "var(--text)" }}>{fmt(totalIncome)}</strong></span>
          <span>Net: <strong style={{ color: overallOver ? "var(--danger)" : "var(--success)" }}>{overallOver ? "-" : "+"}${Math.abs(totalNet).toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Period cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {periods.map((p) => (
          <PeriodCard key={p.label} p={p} />
        ))}
      </div>
    </div>
  );
}
