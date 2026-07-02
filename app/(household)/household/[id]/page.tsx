import { ArrowLink, Btn, Icon } from "@/components/editorial";
import { notFound } from "next/navigation";
import { HouseholdTabs } from "./household-tabs";
import { ExpensesList } from "./expenses-list";
import { HouseholdMoneySummary } from "./household-money-summary";
import { fetchHouseholdServer, fetchHouseholdMembersServer } from "@/lib/api/households";
import { fetchHouseholdExpensesServer } from "@/lib/api/household-expenses";
import { getSession } from "@/lib/auth/session";
import { getCookieHeader } from "@/lib/server-cookies";
import type { HouseholdExpense, HouseholdExpenseListResponse } from "@/types/household-expense";
import { HouseholdRole, type MembershipResponse } from "@/types/membership";
import { parseEnum } from "@/lib/parse-enum";

import { currentMonthName } from "@/lib/finance/editorial-copy";
import { getInitials, idsEqual, memberDisplayName, pluralize } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatting";
import { householdMonthFigures } from "./household-detail-derivations";

export const dynamic = "force-dynamic";

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
    username: m.username,
    displayName: m.displayName ?? m.username,
    role: parseEnum(HouseholdRole, m.role, HouseholdRole.Member),
    joinedAt: m.joinedAt,
    pendingInvitationCode: null,
  }));
  const householdExpenses: HouseholdExpense[] = billsPage?.items ?? [];
  const initialBillsData: HouseholdExpenseListResponse = billsPage ?? { items: [], totalCount: 0 };

  const memberCount = members.length;
  const isOwner = idsEqual(session?.userId, household.ownerId?.toString());
  const myMembership = members.find((m) => idsEqual(m.userId, session?.userId));
  // Owner/Admin can edit and delete bills inline from the list and from the
  // detail page. Plain members get read access plus their own split.
  const canManage = isOwner || myMembership?.role === "Owner" || myMembership?.role === "Admin";

  const { monthlyObligations, yourShare, yourSharePct } = householdMonthFigures(
    householdExpenses,
    memberCount,
  );

  const monthName = currentMonthName(new Date());
  const cur = household.currencyCode;
  const memberLabel =
    members.length > 0
      ? members.map((m) => memberDisplayName(m)).join(", ")
      : "Just you";

  return (
    <div className="page-enter">
      <ArrowLink href="/household" direction="left" className="ed-label-muted self-start">
        All households
      </ArrowLink>

      {/* .page-head — avatar stack (-5px overlap), member label, owed/settled badge. */}
      <header className="page-head" style={{ marginBottom: 18 }}>
        <div className="titles">
          <div className="kicker" style={{ marginBottom: 6 }}>
            // {monthName.toUpperCase()}_LEDGER · {household.name.toUpperCase().replace(/\s+/g, "_")}
          </div>
          <h1>{household.name}</h1>
          <div className="row" style={{ marginTop: 12, gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex" }}>
              {members.slice(0, 4).map((m, i) => (
                // -5px overlap on every avatar after the first; ring matches the void bg
                <span
                  key={m.userId}
                  className="avatar"
                  style={{
                    width: 24,
                    height: 24,
                    fontSize: 9,
                    marginLeft: i ? -5 : 0,
                    border: "1.5px solid var(--void)",
                  }}
                >
                  {getInitials(memberDisplayName(m))}
                </span>
              ))}
            </div>
            <span className="label">{memberLabel}</span>
            {yourShare !== null && (
              <span className="badge green">
                Your share {formatCurrency(yourShare, cur)}
                {yourSharePct !== null ? ` · ${yourSharePct}%` : ""}
              </span>
            )}
          </div>
        </div>
        <div className="actions">
          <Btn
            href={`/household/${params.id}/settings`}
            variant="secondary"
            size="sm"
            iconLeft={<Icon name="settings" size={13} strokeWidth={2} />}
          >
            Settings
          </Btn>
        </div>
      </header>

      <HouseholdTabs />

      {/* .stats — Terminus 4-up. Total this month, your share, expense count, members. */}
      <div className="stats">
        <div className="stat">
          <div className="label">Total this month</div>
          <div className="val">
            {monthlyObligations !== null ? formatCurrency(monthlyObligations, cur) : "—"}
          </div>
          <div className="delta">
            {householdExpenses.length} {pluralize("expense", householdExpenses.length)}
          </div>
        </div>
        <div className="stat">
          <div className="label">Your share</div>
          <div className="val amber">
            {yourShare !== null ? formatCurrency(yourShare, cur) : "—"}
          </div>
          {yourSharePct !== null && <div className="delta">{yourSharePct}% of total</div>}
        </div>
        <div className="stat">
          <div className="label">Expenses</div>
          <div className="val">{householdExpenses.length}</div>
          <div className="delta">this month</div>
        </div>
        <div className="stat">
          <div className="label">Members</div>
          <div className="val">{memberCount}</div>
          <div className="delta">{pluralize("person", memberCount)}</div>
        </div>
      </div>

      <HouseholdMoneySummary householdId={params.id} currencyCode={cur} />

      {/* .section-h — // SHARED_EXPENSES + Filter / Add actions */}
      <div className="section-h" style={{ marginTop: 22 }}>
        <h2>// SHARED_EXPENSES</h2>
        <div className="actions">
          <Btn
            variant="secondary"
            size="sm"
            iconLeft={<Icon name="filter" size={13} strokeWidth={2} />}
          >
            Filter
          </Btn>
          <Btn
            href={`/household/${params.id}/expenses/new`}
            variant="primary"
            size="sm"
            iconLeft={<Icon name="plus" size={12} strokeWidth={2.5} />}
          >
            Add
          </Btn>
        </div>
      </div>
      <ExpensesList householdId={params.id} initialData={initialBillsData} canManage={canManage} />
    </div>
  );
}
