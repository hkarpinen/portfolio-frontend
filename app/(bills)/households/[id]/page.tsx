import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SERVER_API } from "@/lib/api-url";
import { BillsList } from "./bills-list";

export const dynamic = 'force-dynamic';

interface Bill {
  billId: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: string;
  category?: string;
  recurrenceFrequency?: string;
  isActive?: boolean;
  description?: string;
}

interface HouseholdDetail {
  householdId: string;
  name: string;
  description?: string;
  currencyCode: string;
  ownerId: string;
}

interface DashboardResponse {
  totalBills: number;
  totalIncome: number;
  netBalance: number;
  isOvercommitted: boolean;
}

interface MemberResponse {
  membershipId: string;
  userId: string;
  displayName?: string;
  role: string;
}

interface HouseholdPageResponse {
  household: HouseholdDetail;
  members: MemberResponse[];
  bills: Bill[];
  dashboard: DashboardResponse;
}

function serverFetch<T>(path: string, cookieHeader: string): Promise<T | null> {
  return fetch(`${SERVER_API}${path}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  })
    .then((r) => (r.ok ? (r.json() as Promise<T>) : null))
    .catch(() => null);
}

export default async function HouseholdPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const [page, me] = await Promise.all([
    serverFetch<HouseholdPageResponse>(`/api/bills/households/${params.id}/detail`, cookieHeader),
    serverFetch<{ id: string }>("/api/identity/me", cookieHeader),
  ]);

  if (!page) notFound();

  const { household, members, bills, dashboard } = page;

  const memberCount = members.length;
  const isOwner = me?.id?.toLowerCase() === household.ownerId?.toLowerCase();
  const myMembership = members.find((m) => m.userId?.toLowerCase() === me?.id?.toLowerCase());
  const canDelete = isOwner || myMembership?.role === "Admin";

  const monthlyObligations = dashboard?.totalBills ?? null;
  const netBalance = dashboard?.netBalance ?? null;
  const totalIncome = dashboard?.totalIncome ?? 0;
  const overcommitted = netBalance !== null && netBalance < 0;

  const coverageRatio = monthlyObligations && totalIncome > 0
    ? Math.min(totalIncome / monthlyObligations, 1)
    : monthlyObligations === 0 ? 1 : 0;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <Link href="/households" style={{ color: "var(--text-3)", fontSize: "12px", textDecoration: "none" }}>
            ← Households
          </Link>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", marginTop: "4px" }}>
            {household.name}
          </h1>
          {household.description && (
            <p style={{ color: "var(--text-2)", marginTop: "4px", fontSize: "13px" }}>{household.description}</p>
          )}
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
            {memberCount} member{memberCount !== 1 ? "s" : ""} · {household.currencyCode}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          {isOwner && (
            <Link
              href={`/households/${params.id}/settings`}
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
              Settings
            </Link>
          )}
          <Link
            href={`/households/${params.id}/bills/new`}
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            + Add Bill
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px" }}>
        {/* Monthly Bills */}
        <div style={{
          background: "var(--surface)",
          border: `1px solid ${overcommitted ? "var(--warning)" : "var(--border)"}`,
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Monthly Bills
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
          </div>
          {monthlyObligations !== null ? (
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: overcommitted ? "var(--warning)" : "var(--text)", lineHeight: 1 }}>
              {household.currencyCode} {monthlyObligations.toFixed(2)}
            </p>
          ) : (
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text-3)", lineHeight: 1 }}>—</p>
          )}
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
            {overcommitted ? "Over budget" : "On track"}
          </p>
        </div>

        {/* Net Balance */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Net Balance
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: netBalance !== null && netBalance < 0 ? "var(--danger)" : "var(--success)", lineHeight: 1 }}>
            {netBalance !== null ? `${netBalance >= 0 ? "+" : ""}${netBalance.toFixed(2)}` : "—"}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>Income minus obligations</p>
        </div>

        {/* Total Bills */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Total Bills
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {bills.length}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>Active bill entries</p>
        </div>

        {/* Members */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Members
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {memberCount}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>Household members</p>
        </div>
      </div>

      {/* Coverage progress bar */}
      {monthlyObligations !== null && monthlyObligations > 0 && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)" }}>Income coverage</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text)", fontFamily: "var(--ff-display)" }}>
              {(coverageRatio * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ background: "var(--surface-3)", borderRadius: "9999px", height: "6px", overflow: "hidden" }}>
            <div style={{
              background: "var(--accent)",
              borderRadius: "9999px",
              height: "6px",
              width: `${coverageRatio * 100}%`,
            }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: "0" }}>
        {[
          { label: "Bills", href: `/households/${params.id}` },
          { label: "Contributions", href: `/households/${params.id}/contributions` },
          { label: "Income", href: `/households/${params.id}/income` },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: tab.label === "Bills" ? 600 : 400,
              color: tab.label === "Bills" ? "var(--text)" : "var(--text-3)",
              borderBottom: tab.label === "Bills" ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: "-1px",
              textDecoration: "none",
              transition: "color 110ms",
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Bills list */}
      <div>
        <BillsList
          householdId={params.id}
          initialBills={bills}
          canDelete={canDelete}
        />
      </div>
    </div>
  );
}
