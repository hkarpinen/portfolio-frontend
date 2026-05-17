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
    <div className="page-enter flex flex-col gap-[28px]" >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-6">
        <div>
          <Link href="/bills" className="text-ink-3 text-base no-underline">
            ← Households
          </Link>
          <h1 className="font-serif font-extrabold text-4xl leading-none tracking-snug tracking-[-0.025em] text-ink mt-2">
            {household.name}
          </h1>
          {household.description && (
            <p className="text-ink-2 mt-2 text-base">{household.description}</p>
          )}
          <p className="text-base text-ink-3 mt-2">
            {memberCount} member{memberCount !== 1 ? "s" : ""} · {household.currencyCode}
          </p>
        </div>
        <div className="flex gap-4 mt-2">
          {isOwner && (
            <Link
              href={`/bills/${params.id}/settings`}
              className="bg-paper-2 text-ink-2 py-4 px-8 text-base font-medium no-underline" style={{ border: "1.5px solid var(--ink)" }}
            >
              Settings
            </Link>
          )}
          <Link
            href={`/bills/${params.id}/expenses/new`}
            className="bg-red text-white py-4 px-8 font-semibold text-base no-underline"
          >
            + Add Expense
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        {/* Monthly Expenses */}
        <div className="bg-paper p-10 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
              Monthly Expenses
            </span>
            <div className="w-16 h-16 bg-[rgba(178,42,26,0.10)] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
          </div>
          {monthlyObligations !== null ? (
            <p className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink leading-none">
              {household.currencyCode} {monthlyObligations.toFixed(2)}
            </p>
          ) : (
            <p className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink-3 leading-none">—</p>
          )}
          <p className="text-base text-ink-3 mt-3">
            This household only
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-paper p-10 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
              Total Expenses
            </span>
            <div className="w-16 h-16 bg-[rgba(178,42,26,0.10)] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
          </div>
          <p className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink leading-none">
            {householdExpenses.length}
          </p>
          <p className="text-base text-ink-3 mt-3">Active expense entries</p>
        </div>

        {/* Members */}
        <div className="bg-paper p-10 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
              Members
            </span>
            <div className="w-16 h-16 bg-[rgba(178,42,26,0.10)] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
          </div>
          <p className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink leading-none">
            {memberCount}
          </p>
          <p className="text-base text-ink-3 mt-3">Household members</p>
        </div>
      </div>



      {/* Tabs */}
      <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        {[
          { label: "Expenses",      href: `/bills/${params.id}` },
          { label: "Contributions", href: `/bills/${params.id}/contributions` },
          { label: "Chores",        href: `/bills/${params.id}/chores` },
          { label: "Calendar",      href: `/bills/${params.id}/calendar` },
          ...(isOwner ? [{ label: "Settings", href: `/bills/${params.id}/settings` }] : []),
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className="py-5 px-8 font-mono text-base tracking-[0.05em] uppercase text-ink-3 mb-[-1px] no-underline whitespace-nowrap" style={{ borderBottom: "2px solid transparent" }}
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
