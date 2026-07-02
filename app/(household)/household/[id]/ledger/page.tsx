"use client";

import { ArrowLink, EmptyState, Icon, SectionHeader } from "@/components/editorial";
import { useParams } from "next/navigation";
import { useGroupLedger } from "@/hooks/use-ledger";
import { useHouseholdMembers } from "@/hooks/use-household";
import { resolveAccountName } from "@/lib/ledger-accounts";
import { formatCurrency } from "@/lib/formatting";

const TYPE_ORDER = ["Asset", "Liability", "Equity", "Income", "Expense"] as const;

export default function LedgerPage() {
  const { id: householdId } = useParams<{ id: string }>();
  const { data: ledger, isLoading } = useGroupLedger(householdId);
  const { data: members = [] } = useHouseholdMembers(householdId);

  const cur = ledger?.currency ?? "USD";

  return (
    <div className="page-enter flex flex-col gap-6">
      <SectionHeader
        kicker="// THE_BOOKS · ACCOUNTANT_VIEW"
        title="The household <em>ledger</em>"
        subtitle="The underlying double-entry books behind this household's money. Every charge and settlement posts as balanced entries; member balances are derived from the postings — not stored — so the books always reconcile."
      />

      <div className="-mt-2">
        <ArrowLink
          href={`/household/${householdId}`}
          direction="left"
          className="ed-label-muted"
        >
          This household&rsquo;s money
        </ArrowLink>
      </div>

      {isLoading ? (
        <p className="ed-label-muted py-12 text-center">Loading…</p>
      ) : !ledger || ledger.accounts.length === 0 ? (
        <EmptyState
          glyph={<Icon name="expenses" size={24} strokeWidth={1.5} />}
          title="No ledger activity yet"
          body="Add a shared expense with a payer and splits — it posts to the ledger as balanced journal entries."
          cta={{ label: "+ Add expense", href: `/household/${householdId}/expenses/new` }}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Trial balance */}
          <div className="ed-ledger ed-ledger-3">
            <div className="px-5 py-4">
              <p className="ed-label-muted">Debits</p>
              <p className="ed-numeral mt-1">{formatCurrency(ledger.totalDebits, cur)}</p>
            </div>
            <div className="px-5 py-4">
              <p className="ed-label-muted">Credits</p>
              <p className="ed-numeral mt-1">{formatCurrency(ledger.totalCredits, cur)}</p>
            </div>
            <div className="px-5 py-4">
              <p className="ed-label-muted">Trial balance</p>
              <p className={`ed-numeral mt-1 ${ledger.isBalanced ? "text-green" : "text-red"}`}>
                {ledger.isBalanced ? "Balanced" : "Off"}
              </p>
            </div>
          </div>

          {/* Accounts grouped by type */}
          {TYPE_ORDER.map((type) => {
            const rows = ledger.accounts.filter((a) => a.accountType === type);
            if (rows.length === 0) return null;
            return (
              <section key={type} className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
                  <p className="ed-kicker">// {type.toUpperCase()}</p>
                  <p className="ed-meta">{rows.length}</p>
                </div>
                <table className="ed-agate">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th className="num">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => (
                      <tr key={a.accountId}>
                        <td>
                          <ArrowLink href={`/household/${householdId}/ledger/${a.accountId}`}>
                            {resolveAccountName(a, members)}
                          </ArrowLink>
                        </td>
                        <td className="num">
                          <span className={a.balance < 0 ? "text-red" : undefined}>
                            {formatCurrency(a.balance, cur)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
