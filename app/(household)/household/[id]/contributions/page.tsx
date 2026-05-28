"use client";

import { DepartmentHead, EditorialPageHead, EmptyState, Icon } from "@/components/editorial";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useHouseholdContributions } from "@/hooks/use-expenses";
import { useHousehold } from "@/hooks/use-household";

import { contributionsHeadline } from "@/lib/household/editorial-copy";
import type { HouseholdMonthlyContributions } from "@/types/contributions";
import { formatCurrency } from "@/lib/formatting";

/** Compute the minimal settlement transactions from net member balances. */
function computeSettlements(
  month: HouseholdMonthlyContributions,
): { from: string; to: string; amount: number }[] {
  // Build net balance per member: positive = owed money, negative = owes money
  const nets = (month.members ?? []).map((m) => ({
    name: m.displayName ?? `User ${m.userId.slice(0, 6)}…`,
    net: (m.totalPaid ?? 0) - (m.totalDue ?? 0),
  }));

  const creditors = nets.filter((m) => m.net > 0.005).sort((a, b) => b.net - a.net);
  const debtors = nets.filter((m) => m.net < -0.005).sort((a, b) => a.net - b.net);

  const settlements: { from: string; to: string; amount: number }[] = [];
  let ci = 0;
  let di = 0;
  const c = creditors.map((x) => ({ ...x }));
  const d = debtors.map((x) => ({ ...x }));

  while (ci < c.length && di < d.length) {
    const pay = Math.min(c[ci].net, -d[di].net);
    if (pay > 0.005) {
      settlements.push({ from: d[di].name, to: c[ci].name, amount: pay });
    }
    c[ci].net -= pay;
    d[di].net += pay;
    if (Math.abs(c[ci].net) < 0.005) ci++;
    if (Math.abs(d[di].net) < 0.005) di++;
  }

  return settlements;
}

export default function HouseholdContributionsPage() {
  const { id: householdId } = useParams<{ id: string }>();
  const { data: household } = useHousehold(householdId);
  const { data: months = [], isLoading } = useHouseholdContributions(householdId);

  const periodOptions = useMemo(
    () => (months ?? []).map((m) => ({ label: m.periodLabel, value: m.periodStart })),
    [months],
  );

  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const activePeriod = selectedPeriod || periodOptions[0]?.value || "";
  const month = (months ?? []).find((m) => m.periodStart === activePeriod) ?? (months ?? [])[0];

  const cur = month?.currency ?? household?.currencyCode ?? "USD";
  const settlements = month ? computeSettlements(month) : [];

  // Unsettled = sum of all surplus credits (which equals sum of all debts).
  const unsettledTotal = settlements.reduce((s, x) => s + x.amount, 0);
  const headlineLabel = month?.periodLabel ?? "This month";
  const headline = contributionsHeadline({
    currency: cur,
    unsettled: unsettledTotal,
    monthLabel: headlineLabel,
  });

  return (
    <div className="page-enter flex flex-col gap-6">
      <EditorialPageHead
        kicker="Contributions desk"
        title={headline}
        deck="Who paid, who owes, and the minimal transfers to balance the household this period."
      />

      {isLoading ? (
        <p className="ed-label-muted">Loading…</p>
      ) : (months ?? []).length === 0 ? (
        <EmptyState
          glyph={<Icon name="expenses" size={24} strokeWidth={1.5} />}
          title="No contributions yet"
          body="Add expenses with member splits to see monthly contributions here."
          cta={{ label: "+ Add expense", href: `/household/${householdId}/expenses/new` }}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Month selector */}
          <div className="-mt-2 flex items-center justify-end gap-3">
            <select
              value={activePeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-9 cursor-pointer border border-[var(--ink)] bg-paper px-3 font-mono text-xs uppercase tracking-[0.08em] text-ink"
              aria-label="Select month"
            >
              {periodOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contributions table */}
          {month && (
            <section className="flex flex-col gap-5">
              <DepartmentHead
                kicker={`Period · ${month.periodLabel}`}
                count={`Total ${formatCurrency(month.total, cur)}`}
                title="Member <em>contributions</em>"
              />

              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse"
                  aria-label={`Member contributions for ${month?.periodLabel ?? "this period"}`}
                >
                  <thead>
                    <tr className="border-b border-[var(--ink)]">
                      <th scope="col" className="ed-kicker pb-5 pr-6 text-left font-normal">
                        Member
                      </th>
                      <th scope="col" className="ed-kicker pb-5 pr-6 text-right font-normal">
                        Paid
                      </th>
                      <th scope="col" className="ed-kicker pb-5 pr-6 text-right font-normal">
                        Owed
                      </th>
                      <th scope="col" className="ed-kicker pb-5 text-right font-normal">
                        Net (+ surplus / − owed)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(month.members ?? []).map((m) => {
                      const net = (m.totalPaid ?? 0) - (m.totalDue ?? 0);
                      const netAbs = formatCurrency(Math.abs(net), cur);
                      const netSign = net >= 0 ? "+" : "−";
                      const netLabel =
                        net >= 0 ? `${netAbs} surplus (overpaid)` : `${netAbs} owed (underpaid)`;
                      return (
                        <tr key={m.userId} className="border-b border-rule-soft">
                          <td className="py-7 pr-6 font-serif text-[1.0625rem] italic text-ink">
                            {m.displayName || `Member ${m.userId.slice(0, 6)}…`}
                          </td>
                          <td className="whitespace-nowrap py-7 pr-6 text-right font-mono text-sm text-ink">
                            {formatCurrency(m.totalPaid, cur)}
                          </td>
                          <td className="whitespace-nowrap py-7 pr-6 text-right font-mono text-sm text-ink">
                            {formatCurrency(m.totalDue, cur)}
                          </td>
                          <td
                            className={`whitespace-nowrap py-7 text-right font-mono text-sm ${net >= 0 ? "text-green" : "text-red"}`}
                            aria-label={netLabel}
                          >
                            {/* Sign (+ or −) provides non-color indicator alongside color */}
                            <span aria-hidden>
                              {netSign}
                              {netAbs}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Suggested settlement */}
          {settlements.length > 0 && (
            <section className="flex flex-col gap-5">
              <DepartmentHead
                kicker="Settlement · Suggested"
                count={`${settlements.length} transfer${settlements.length === 1 ? "" : "s"} · ${formatCurrency(unsettledTotal, cur)}`}
                title="Minimum <em>transfers</em> to balance"
                deck="The fewest payments needed to bring every member to $0 net."
              />
              <div className="border border-rule bg-paper">
                {settlements.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 border-b border-rule-soft px-6 py-4 last:border-b-0"
                  >
                    <span className="font-serif text-base italic text-ink">
                      {s.from} → {s.to}
                    </span>
                    <span className="whitespace-nowrap font-mono text-sm text-ink">
                      {formatCurrency(s.amount, cur)}
                    </span>
                  </div>
                ))}
              </div>
              {/* TODO(handoff8): SETTLE UP CTA — wire to a settle-up endpoint when available */}
              <div>
                <button
                  className="h-11 cursor-pointer border border-[var(--ink)] bg-paper px-5 font-mono text-sm uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper"
                  disabled
                  title="Settle-up endpoint not yet available"
                >
                  Settle up →
                </button>
              </div>
            </section>
          )}

          {settlements.length === 0 && month && (month.members ?? []).length > 0 && (
            <p className="ed-empty-dispatch">
              All contributions <em>balanced</em> — no settlement needed
            </p>
          )}
        </div>
      )}
    </div>
  );
}
