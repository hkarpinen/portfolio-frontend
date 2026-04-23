"use client";

import { useState } from "react";
import Link from "next/link";

export interface ContributionItem {
  splitId: string;
  billId: string;
  householdId: string;
  householdName: string;
  billTitle: string;
  billCategory: string;
  amount: number;
  currency: string;
  dueDate: string;
  isClaimed: boolean;
  claimedAt: string | null;
}

export interface ContributionPeriodSummary {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  totalDue: number;
  totalPaid: number;
  projectedIncome: number;
  netAfterContributions: number;
  contributions: ContributionItem[];
}

type Period = "monthly" | "quarterly" | "yearly";

function currency(amount: number, code: string) {
  return `${code} ${amount.toFixed(2)}`;
}

// ─── Aggregation helpers ────────────────────────────────────────────────────

interface AggregatedPeriod {
  label: string;
  totalDue: number;
  totalPaid: number;
  projectedIncome: number;
  net: number;
  contributions: ContributionItem[];
  isCurrent?: boolean;
}

function aggregateByYear(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const map = new Map<number, AggregatedPeriod>();
  for (const m of months) {
    const y = new Date(m.periodStart).getUTCFullYear();
    const bucket = map.get(y) ?? {
      label: String(y),
      totalDue: 0,
      totalPaid: 0,
      projectedIncome: 0,
      net: 0,
      contributions: [],
    };
    bucket.totalDue += m.totalDue;
    bucket.totalPaid += m.totalPaid;
    bucket.projectedIncome += m.projectedIncome;
    bucket.net += m.netAfterContributions;
    bucket.contributions.push(...m.contributions);
    map.set(y, bucket);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
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
      totalDue: 0,
      totalPaid: 0,
      projectedIncome: 0,
      net: 0,
      contributions: [],
      isCurrent: false,
    };
    bucket.totalDue += m.totalDue;
    bucket.totalPaid += m.totalPaid;
    bucket.projectedIncome += m.projectedIncome;
    bucket.net += m.netAfterContributions;
    bucket.contributions.push(...m.contributions);
    if (m.periodStart.slice(0, 7) === nowKey) bucket.isCurrent = true;
    map.set(key, bucket);
  }
  // Preserve chronological order
  return [...map.values()];
}

function toMonthlyPeriods(months: ContributionPeriodSummary[]): AggregatedPeriod[] {
  const nowKey = new Date().toISOString().slice(0, 7);
  return months.map((m) => ({
    label: m.periodLabel,
    totalDue: m.totalDue,
    totalPaid: m.totalPaid,
    projectedIncome: m.projectedIncome,
    net: m.netAfterContributions,
    contributions: m.contributions,
    isCurrent: m.periodStart.slice(0, 7) === nowKey,
  }));
}

// ─── Period selector ─────────────────────────────────────────────────────────

function PeriodTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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

// ─── Period card ──────────────────────────────────────────────────────────────

function PeriodCard({ p }: { p: AggregatedPeriod }) {
  const over = p.net < 0;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${p.isCurrent ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "16px",
        padding: "20px",
        boxShadow: p.isCurrent ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: "16px",
          cursor: p.contributions.length > 0 ? "pointer" : "default",
        }}
        onClick={() => p.contributions.length > 0 && setExpanded((e) => !e)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3
            style={{
              fontFamily: "var(--ff-display)",
              fontWeight: "700",
              fontSize: "16px",
              color: "var(--text)",
              margin: 0,
            }}
          >
            {p.label}
          </h3>
          {p.isCurrent && (
            <span
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                borderRadius: "9999px",
                padding: "2px 8px",
                fontSize: "11px",
                fontWeight: "600",
              }}
            >
              Current
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--ff-display)",
              fontWeight: "700",
              fontSize: "15px",
              color: over ? "var(--danger)" : "var(--success)",
            }}
          >
            Net {over ? "-" : "+"}${Math.abs(p.net).toFixed(2)}
          </span>
          {p.contributions.length > 0 && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-3)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms",
                flexShrink: 0,
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          marginBottom: expanded && p.contributions.length > 0 ? "16px" : 0,
        }}
      >
        {[
          { label: "Due", val: `$${p.totalDue.toFixed(2)}` },
          { label: "Paid", val: `$${p.totalPaid.toFixed(2)}` },
          { label: "Outstanding", val: `$${(p.totalDue - p.totalPaid).toFixed(2)}` },
          { label: "Projected income", val: `$${p.projectedIncome.toFixed(2)}` },
        ].map(({ label, val }) => (
          <div key={label}>
            <p
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontFamily: "var(--ff-display)",
                fontWeight: "700",
                fontSize: "16px",
                color: "var(--text)",
                marginTop: "2px",
              }}
            >
              {val}
            </p>
          </div>
        ))}
      </div>

      {/* Expandable contributions list */}
      {expanded && p.contributions.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {p.contributions
            .slice()
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map((c) => {
              const due = new Date(c.dueDate);
              return (
                <Link
                  key={`${c.splitId}-${c.dueDate}`}
                  href={`/households/${c.householdId}/bills/${c.billId}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="row-hover"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "8px 10px",
                      borderRadius: "10px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <p
                          style={{
                            fontWeight: "600",
                            fontSize: "13px",
                            color: "var(--text)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.billTitle}
                        </p>
                        {c.isClaimed && (
                          <span
                            style={{
                              background: "var(--success-s)",
                              color: "var(--success)",
                              borderRadius: "9999px",
                              padding: "2px 8px",
                              fontSize: "11px",
                              fontWeight: "600",
                              flexShrink: 0,
                            }}
                          >
                            Paid
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-3)",
                          marginTop: "1px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.householdName} · due{" "}
                        {due.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {c.billCategory ? ` · ${c.billCategory}` : ""}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--ff-display)",
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "var(--text)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {currency(c.amount, c.currency)}
                    </span>
                  </div>
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ContributionsView({
  months,
}: {
  months: ContributionPeriodSummary[];
}) {
  const [period, setPeriod] = useState<Period>("monthly");

  const periods: AggregatedPeriod[] =
    period === "yearly"
      ? aggregateByYear(months)
      : period === "quarterly"
      ? aggregateByQuarter(months)
      : toMonthlyPeriods(months);

  // Summary: show current period (current month / quarter / year) so the numbers
  // change meaningfully when switching views, not just the grand total of the window.
  const currentPeriod = periods.find((p) => p.isCurrent) ?? periods[0];
  const totalDue = currentPeriod?.totalDue ?? 0;
  const totalIncome = currentPeriod?.projectedIncome ?? 0;
  const totalNet = currentPeriod?.net ?? 0;
  const overallOver = totalNet < 0;
  const periodLabel = currentPeriod?.label ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Period selector + summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          {(["monthly", "quarterly", "yearly"] as Period[]).map((p) => (
            <PeriodTab
              key={p}
              label={p.charAt(0).toUpperCase() + p.slice(1)}
              active={period === p}
              onClick={() => setPeriod(p)}
            />
          ))}
        </div>

        {/* Quick summary pill — shows current period */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "12px",
            color: "var(--text-3)",
            alignItems: "center",
          }}
        >
          {periodLabel && (
            <span style={{ fontWeight: "600", color: "var(--text-2)" }}>
              {periodLabel}
            </span>
          )}
          <span>
            Due:{" "}
            <strong style={{ color: "var(--text)" }}>${totalDue.toFixed(2)}</strong>
          </span>
          <span>
            Income:{" "}
            <strong style={{ color: "var(--text)" }}>${totalIncome.toFixed(2)}</strong>
          </span>
          <span>
            Net:{" "}
            <strong style={{ color: overallOver ? "var(--danger)" : "var(--success)" }}>
              {overallOver ? "-" : "+"}${Math.abs(totalNet).toFixed(2)}
            </strong>
          </span>
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
