"use client";

import { ArrowLink, Btn, LedeStat } from "@/components/editorial";
import { AccountActivity } from "@/components/finance/account-activity";
import { useMemo, type ReactNode } from "react";
import { useGroupLedger, useAccountStatement } from "@/hooks/use-ledger";
import { useHouseholdMembers } from "@/hooks/use-household";
import { useSettleUpTransfer } from "@/hooks/use-expenses";
import { useMe } from "@/hooks/use-identity";
import { minimalTransfers } from "@/lib/contributions";
import { memberAccountCode } from "@/lib/ledger-accounts";
import { formatCurrency } from "@/lib/formatting";
import { memberDisplayName, pluralize, sumBy } from "@/lib/utils";

/**
 * <HouseholdMoneySummary> — the member's money in this household, rendered from their own ledger
 * Member account: balance (owe / owed), settle-up, and their activity over time. Sits at the top
 * of the household Money landing, above the shared-expenses list. The shared pot and the full books
 * are the same account-view primitive, one drill-in away under /household/[id]/ledger.
 *
 * Extracted from the former /finance/g/[id] page so a household's money lives inside the household,
 * not on a separate Money desk. Takes householdId as a prop (the page owns the route param).
 */
export function HouseholdMoneySummary({
  householdId,
  currencyCode,
}: {
  householdId: string;
  currencyCode: string;
}) {
  const { data: ledger, isLoading: ledgerLoading } = useGroupLedger(householdId);
  const { data: members = [] } = useHouseholdMembers(householdId);
  const { data: me } = useMe();
  const settleUp = useSettleUpTransfer(householdId);

  const myId = me?.id;
  const myAccount = myId
    ? ledger?.accounts.find((a) => a.code === memberAccountCode(myId))
    : undefined;
  const cashAccount = ledger?.accounts.find((a) => a.code === "1000");
  const cur = ledger?.currency ?? currencyCode ?? "USD";

  const { data: statement } = useAccountStatement(householdId, myAccount?.accountId ?? "");

  // Settle-up from the all-time ledger member balances, split into the caller's own legs.
  const { iOwe, owedToMe } = useMemo(() => {
    const nets = members.map((m) => {
      const acct = ledger?.accounts.find((a) => a.code === memberAccountCode(m.userId));
      return { id: m.userId, name: memberDisplayName(m), net: acct?.balance ?? 0 };
    });
    const transfers = minimalTransfers(nets);
    return {
      iOwe: transfers.filter((t) => t.fromId === myId),
      owedToMe: transfers.filter((t) => t.toId === myId),
    };
  }, [members, ledger, myId]);

  const balance = myAccount?.balance ?? 0;
  const youOweTotal = sumBy(iOwe, (t) => t.amount);
  const owedToYouTotal = sumBy(owedToMe, (t) => t.amount);

  if (ledgerLoading) {
    return <p className="ed-label-muted py-8 text-center">Loading your balance…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <LedeStat
        label="Your balance"
        value={formatCurrency(balance, cur, { signed: true })}
        negative={balance < -0.005}
        deck={
          balance < -0.005
            ? "You owe more than you've paid in — settle up below."
            : balance > 0.005
              ? "You've paid in more than your share — others owe you."
              : "Everything's square."
        }
        aside={[
          {
            label: "You owe",
            value: formatCurrency(youOweTotal, cur),
            sub: `${iOwe.length} ${pluralize("payment", iOwe.length)}`,
          },
          {
            label: "Owed to you",
            value: formatCurrency(owedToYouTotal, cur),
            sub: `${owedToMe.length} ${pluralize("member", owedToMe.length)}`,
          },
        ]}
      />

      {/* Settle up — your actions */}
      {(iOwe.length > 0 || owedToMe.length > 0) && (
        <section className="flex flex-col gap-5">
          <p className="ed-kicker">// SETTLE_UP</p>
          <div className="border border-border bg-paper">
            {iOwe.map((t, i) => (
              <SettleRow
                key={`owe-${i}`}
                label={`Pay ${t.to}`}
                amount={formatCurrency(t.amount, cur)}
                action={
                  <Btn
                    variant="primary"
                    size="sm"
                    loading={settleUp.isPending}
                    onClick={() =>
                      t.toId && settleUp.mutate({ toUserId: t.toId, amount: t.amount, currency: cur })
                    }
                  >
                    Mark paid
                  </Btn>
                }
              />
            ))}
            {owedToMe.map((t, i) => (
              <SettleRow
                key={`owed-${i}`}
                label={`${t.from} owes you`}
                amount={formatCurrency(t.amount, cur)}
                tone="pos"
              />
            ))}
          </div>
          {settleUp.isError && (
            <p className="ed-label-muted text-red">Couldn&rsquo;t record that payment — try again.</p>
          )}
        </section>
      )}

      {/* Your activity — the caller's Member account, periodized */}
      {statement && (
        <section className="flex flex-col gap-5">
          <p className="ed-kicker">// YOUR_ACTIVITY</p>
          <AccountActivity statement={statement} isMember />
        </section>
      )}

      {/* Drill-ins: the pot and the full books — the same account view, other accounts */}
      <div className="flex flex-wrap gap-6">
        {cashAccount && (
          <ArrowLink
            href={`/household/${householdId}/ledger/${cashAccount.accountId}`}
            className="ed-label-muted"
          >
            The shared pot
          </ArrowLink>
        )}
        <ArrowLink href={`/household/${householdId}/ledger`} className="ed-label-muted">
          View the books
        </ArrowLink>
        <ArrowLink href="/finance/overview" className="ed-label-muted">
          Across all your households
        </ArrowLink>
      </div>
    </div>
  );
}

function SettleRow({
  label,
  amount,
  action,
  tone,
}: {
  label: string;
  amount: string;
  action?: ReactNode;
  tone?: "pos";
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rule-soft px-5 py-4 last:border-b-0">
      <span className="font-mono text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-4">
        <span
          className={`whitespace-nowrap font-mono text-sm tabular-nums ${tone === "pos" ? "text-green" : "text-ink"}`}
        >
          {amount}
        </span>
        {action}
      </div>
    </div>
  );
}
