import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpensesList } from "./expenses-list";
import { fetchHouseholdServer, fetchHouseholdMembersServer } from "@/lib/api/households";
import { fetchHouseholdExpensesServer } from "@/lib/api/household-expenses";
import { getSession } from "@/lib/auth/session";
import { getCookieHeader } from "@/lib/server-cookies";
import type { HouseholdExpense, HouseholdExpenseListResponse, MembershipResponse } from "@/types/finance";

export const dynamic = 'force-dynamic';

export default async function HouseholdPage({ params }: { params: { id: string } }) {
  const cookieHeader = await getCookieHeader();

  const [household, membersRaw, billsPage, session] = await Promise.all([
    fetchHouseholdServer(params.id, cookieHeader),
    fetchHouseholdMembersServer(params.id, cookieHeader),
    fetchHouseholdExpensesServer(params.id, cookieHeader),
    getSession(),
  ]);

  if (!household) notFound();

  const members: MembershipResponse[] = (membersRaw ?? []).map((m) => ({
    membershipId: m.membershipId,
    userId: m.userId,
    displayName: m.displayName ?? m.username,
    role: m.role,
    isActive: true,
  }));
  const householdExpenses: HouseholdExpense[] = billsPage?.items ?? [];
  const initialBillsData: HouseholdExpenseListResponse = billsPage ?? { items: [], totalCount: 0 };

  const memberCount = members.length;
  const isOwner = session?.userId?.toLowerCase() === household.ownerId?.toString().toLowerCase();
  const myMembership = members.find((m) => m.userId?.toLowerCase() === session?.userId?.toLowerCase());
  const canDelete = isOwner || myMembership?.role === "Admin";

  // Sum of all active expense amounts for this household as a simple monthly snapshot.
  const monthlyObligations: number | null = householdExpenses.length > 0
    ? householdExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0)
    : null;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <Link href="/households" style={{ color: "var(--text-3)", fontSize: "var(--ts-label)", textDecoration: "none" }}>
            ← Households
          </Link>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-h2)", lineHeight: "var(--lh-display)", letterSpacing: "-0.02em", letterSpacing: "-0.025em", color: "var(--text)", marginTop: "4px" }}>
            {household.name}
          </h1>
          {household.description && (
            <p style={{ color: "var(--text-2)", marginTop: "4px", fontSize: "var(--ts-body-sm)" }}>{household.description}</p>
          )}
          <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", marginTop: "4px" }}>
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
                fontSize: "var(--ts-body-sm)",
                fontWeight: "500",
                textDecoration: "none",
              }}
            >
              Settings
            </Link>
          )}
          <Link
            href={`/households/${params.id}/expenses/new`}
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "var(--ts-body-sm)",
              textDecoration: "none",
            }}
          >
            + Add Expense
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px" }}>
        {/* Monthly Expenses */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Monthly Expenses
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
          </div>
          {monthlyObligations !== null ? (
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
              {household.currencyCode} {monthlyObligations.toFixed(2)}
            </p>
          ) : (
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text-3)", lineHeight: 1 }}>—</p>
          )}
          <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", marginTop: "6px" }}>
            This household only
          </p>
        </div>

        {/* Total Expenses */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Total Expenses
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {householdExpenses.length}
          </p>
          <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", marginTop: "6px" }}>Active expense entries</p>
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
            <span style={{ fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Members
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "var(--ts-card-h)", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {memberCount}
          </p>
          <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", marginTop: "6px" }}>Household members</p>
        </div>
      </div>



      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--ink)", display: "flex", gap: "0", overflowX: "auto" }}>
        {[
          { label: "Expenses",      href: `/households/${params.id}` },
          { label: "Contributions", href: `/households/${params.id}/contributions` },
          { label: "Chores",        href: `/households/${params.id}/chores` },
          { label: "Calendar",      href: `/households/${params.id}/calendar` },
          ...(isOwner ? [{ label: "Settings", href: `/households/${params.id}/settings` }] : []),
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            style={{
              padding: "10px 16px",
              fontFamily: "var(--ff-mono)",
              fontSize: "var(--ts-label)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
              borderBottom: "2px solid transparent",
              marginBottom: "-1px",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Expenses list */}
      <div>
        <ExpensesList
          householdId={params.id}
          initialData={initialBillsData}
          canDelete={canDelete}
        />
      </div>
    </div>
  );
}
