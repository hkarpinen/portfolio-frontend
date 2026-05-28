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
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { LedeStat } from "@/components/editorial/lede-stat";
import { DepartmentHead } from "@/components/editorial/department-head";
import { Btn } from "@/components/editorial/button";
import { Icon } from "@/components/editorial/icon";
import { currentMonthName } from "@/lib/finance/editorial-copy";
import { householdDetailHeadline, householdDetailDeck } from "@/lib/household/editorial-copy";

export const dynamic = "force-dynamic";

const fmt0 = (n: number, currency = "USD") =>
  `${currency} ${Math.abs(Math.round(n)).toLocaleString("en-US")}`;

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
    role: parseEnum(HouseholdRole, m.role, HouseholdRole.Member),
    isActive: true,
  }));
  const householdExpenses: HouseholdExpense[] = billsPage?.items ?? [];
  const initialBillsData: HouseholdExpenseListResponse = billsPage ?? { items: [], totalCount: 0 };

  const memberCount = members.length;
  const isOwner = session?.userId?.toLowerCase() === household.ownerId?.toString().toLowerCase();
  const myMembership = members.find(
    (m) => m.userId?.toLowerCase() === session?.userId?.toLowerCase(),
  );
  // Owner/Admin can edit and delete bills inline from the list and from the
  // detail page. Plain members get read access plus their own split.
  const canManage = isOwner || myMembership?.role === "Owner" || myMembership?.role === "Admin";

  const monthlyObligations: number | null =
    householdExpenses.length > 0
      ? householdExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0)
      : null;

  const yourShare =
    monthlyObligations !== null && memberCount > 0 ? monthlyObligations / memberCount : null;
  const yourSharePct = memberCount > 0 ? Math.round(100 / memberCount) : null;

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
        value={yourShare !== null ? fmt0(yourShare, household.currencyCode) : "—"}
        deck={
          monthlyObligations !== null && monthlyObligations > 0 && yourSharePct !== null
            ? `${yourSharePct}% of ${fmt0(monthlyObligations, household.currencyCode)} total owed across the household this month.`
            : "Add an expense with member splits to start tracking your share."
        }
        aside={[
          {
            label: "Total this month",
            value:
              monthlyObligations !== null ? fmt0(monthlyObligations, household.currencyCode) : "—",
            sub: `${householdExpenses.length} expense${householdExpenses.length === 1 ? "" : "s"}`,
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
          count={`${householdExpenses.length} expense${householdExpenses.length === 1 ? "" : "s"}`}
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
