"use client";

import { ArrowLink, EmptyState, Icon, LedeStat, SectionHeader } from "@/components/editorial";
import { AccountActivity } from "@/components/finance/account-activity";
import { useParams } from "next/navigation";
import { useAccountStatement } from "@/hooks/use-ledger";
import { useHouseholdMembers } from "@/hooks/use-household";
import { isMemberAccount, resolveAccountName } from "@/lib/ledger-accounts";
import { formatCurrency } from "@/lib/formatting";

/**
 * Account statement — the posting history of one ledger account, with a running balance. The
 * accountant drill-in behind an account row in the ledger view. Reusable for any account in the
 * group book (a member's stake, the Cash pot, an expense category).
 */
export default function AccountStatementPage() {
  const { id: householdId, accountId } = useParams<{ id: string; accountId: string }>();
  const { data: statement, isLoading } = useAccountStatement(householdId, accountId);
  const { data: members = [] } = useHouseholdMembers(householdId);

  const label = statement ? resolveAccountName(statement, members) : "Account";

  return (
    <div className="page-enter flex flex-col gap-6">
      <SectionHeader
        kicker="// THE_BOOKS · STATEMENT"
        title={`Statement · <em>${label}</em>`}
        subtitle="Every posting against this account, oldest first, with the running balance after each. The accountant view behind this household's money."
      />

      <div className="-mt-2">
        <ArrowLink href={`/household/${householdId}/ledger`} direction="left" className="ed-label-muted">
          Ledger
        </ArrowLink>
      </div>

      {isLoading ? (
        <p className="ed-label-muted py-12 text-center">Loading…</p>
      ) : !statement || statement.lines.length === 0 ? (
        <EmptyState
          glyph={<Icon name="expenses" size={24} strokeWidth={1.5} />}
          title="No postings on this account"
          body="Nothing has been booked against this account yet."
        />
      ) : (
        <>
          <LedeStat
            label="Balance"
            value={formatCurrency(statement.balance, statement.currency, { signed: true })}
            negative={statement.balance < -0.005}
            deck={`${statement.lines.length} postings · ${statement.accountType}`}
          />
          <AccountActivity statement={statement} isMember={isMemberAccount(statement.code)} />
        </>
      )}
    </div>
  );
}
