import { Btn, DepartmentHead, EditorialPageHead, Icon, LedeStat } from "@/components/editorial";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpensesList } from "./expenses-list";
import { fetchHouseholdServer, fetchHouseholdMembersServer } from "@/lib/api/households";
import { fetchHouseholdExpensesServer } from "@/lib/api/household-expenses";
import { getSession } from "@/lib/auth/session";
import { getCookieHeader } from "@/lib/server-cookies";
import type { HouseholdExpense, HouseholdExpenseListResponse } from "@/types/household-expense";
import { HouseholdRole, type MembershipResponse } from "@/types/membership";
import { parseEnum } from "@/lib/parse-enum";

import { currentMonthName } from "@/lib/finance/editorial-copy";
import { householdDetailHeadline, householdDetailDeck } from "@/lib/household/editorial-copy";
import { formatCurrency } from "@/lib/formatting";
import { idsEqual, pluralize } from "@/lib/utils";
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
  const headline = householdDetailHeadline({
    householdName: household.name,
    yourShare,
    monthlyObligations,
    currency: household.currencyCode,
    monthName,
  });
  const deck = householdDetailDeck({
    memberCount,
    expensesCount: householdExpenses.length,
    monthlyObligations,
    yourShare,
    currency: household.currencyCode,
  });

  return (
    <div className="page-enter flex flex-col gap-6">
      <Link href="/household" className="ed-label-muted self-start no-underline hover:text-red">
        ← All households
      </Link>

      <EditorialPageHead kicker={`${monthName} edition`} title={headline} deck={deck} />

      <LedeStat
        label={`Your share · ${monthName}`}
        value={
          yourShare !== null
            ? formatCurrency(yourShare, household.currencyCode, { precision: 0 })
            : "—"
        }
        deck={
          monthlyObligations !== null && monthlyObligations > 0 && yourSharePct !== null
            ? `${yourSharePct}% of ${formatCurrency(monthlyObligations, household.currencyCode, { precision: 0 })} total owed across the household this month.`
            : "Add an expense with member splits to start tracking your share."
        }
        aside={[
          {
            label: "Total this month",
            value:
              monthlyObligations !== null
                ? formatCurrency(monthlyObligations, household.currencyCode, { precision: 0 })
                : "—",
            sub: `${householdExpenses.length} ${pluralize("expense", householdExpenses.length)}`,
          },
          { label: "Members", value: String(memberCount), sub: household.currencyCode },
          // TODO(handoff8): wire to contributions endpoint.
          { label: "Open splits", value: "—", sub: "unpaid" },
          { label: "Last settle-up", value: "—", sub: "no settlements yet" },
        ]}
      />

      <section className="flex flex-col gap-5">
        <DepartmentHead
          kicker="Shared · Expenses"
          count={`${householdExpenses.length} ${pluralize("expense", householdExpenses.length)}`}
          title="Shared <em>expenses</em>"
          deck="Every bill the household has filed, with its split. Owner and admins can edit inline."
        />
        <div className="-mt-2 flex justify-end gap-3">
          <Btn
            variant="secondary"
            size="sm"
            iconLeft={<Icon name="filter" size={13} strokeWidth={2} />}
          >
            Filter
          </Btn>
        </div>
        <ExpensesList
          householdId={params.id}
          initialData={initialBillsData}
          canManage={canManage}
        />
      </section>
    </div>
  );
}
