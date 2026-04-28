import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchHouseholdServer,
  fetchHouseholdContributionsServer,
} from "@/lib/api/households";
import { getCookieHeader } from "@/lib/server-cookies";
import type {
  Household,
  HouseholdContributionsResponse,
  MemberContribution,
  HouseholdContributionItem,
} from "@/types/bills";

export const dynamic = "force-dynamic";

const AVATAR_COLORS = [
  "var(--accent)",
  "var(--accent-v)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "#f59e0b",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name?: string) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
}

export default async function HouseholdContributionsPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieHeader = await getCookieHeader();

  const [household, months] = await Promise.all([
    fetchHouseholdServer(params.id, cookieHeader),
    fetchHouseholdContributionsServer(params.id, cookieHeader).then((r) => r ?? []),
  ]);

  if (!household) notFound();

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <Link href={`/households/${params.id}`} style={{ color: "var(--text-3)", fontSize: "12px", textDecoration: "none" }}>
          ← {household.name}
        </Link>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", marginTop: "4px" }}>
          Contributions
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          Per-member bill splits by month
        </p>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex" }}>
        {[
          { label: "Bills", href: `/households/${params.id}` },
          { label: "Contributions", href: `/households/${params.id}/contributions` },
          { label: "Income", href: `/households/${params.id}/income` },
          { label: "Settings", href: `/households/${params.id}/settings` },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: tab.label === "Contributions" ? 600 : 400,
              color: tab.label === "Contributions" ? "var(--text)" : "var(--text-3)",
              borderBottom: tab.label === "Contributions" ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: "-1px",
              textDecoration: "none",
              transition: "color 110ms",
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      {months.length === 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "48px 24px",
          textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>
            No contributions yet
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-3)", maxWidth: "320px" }}>
            Add bills with member splits to see monthly contributions here.
          </p>
          <Link
            href={`/households/${params.id}/bills/new`}
            style={{ background: "var(--accent)", color: "#fff", padding: "8px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
          >
            Add a Bill
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {months.map((month) => (
            <div
              key={month.periodStart}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "20px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {/* Month header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)", margin: 0 }}>
                  {month.periodLabel}
                </h3>
                <span style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
                  {month.currency ?? household.currencyCode} {month.total?.toFixed(2)}
                </span>
              </div>

              {/* Per-member rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(month.members ?? []).map((member) => {
                  const paidRatio = member.totalDue > 0 ? Math.min(member.totalPaid / member.totalDue, 1) : 1;
                  const color = avatarColor(member.displayName ?? member.userId);
                  return (
                    <div key={member.userId}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        {/* Avatar */}
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "9999px",
                          background: color, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: 700, color: "#fff",
                          border: "2px solid var(--surface)",
                        }}>
                          {initials(member.displayName)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                              {member.displayName ?? `User ${member.userId.slice(0, 6)}`}
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--ff-display)" }}>
                              {household.currencyCode} {member.totalDue?.toFixed(2)}
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div style={{ background: "var(--surface-3)", borderRadius: "9999px", height: "5px", overflow: "hidden" }}>
                            <div style={{
                              background: paidRatio >= 1 ? "var(--success)" : "var(--accent)",
                              borderRadius: "9999px",
                              height: "5px",
                              width: `${paidRatio * 100}%`,
                              transition: "width 500ms ease",
                            }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                              {household.currencyCode} {member.totalPaid?.toFixed(2)} paid
                            </span>
                            <span style={{
                              fontSize: "11px",
                              color: paidRatio >= 1 ? "var(--success)" : "var(--text-3)",
                            }}>
                              {(paidRatio * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
