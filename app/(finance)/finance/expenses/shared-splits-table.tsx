"use client";

import { Icon } from "@/components/editorial";
import Link from "next/link";
import type { ContributionItem } from "@/types/contributions";

import { formatCurrency, formatAmount } from "@/lib/formatting";
import { categoryIcon } from "@/lib/expense-category";
import { pluralize, sumBy } from "@/lib/utils";

interface SharedSplitGroup {
  billId: string;
  billTitle: string;
  billCategory?: string;
  groupId: string;
  householdName?: string;
  currency: string;
  occurrenceCount: number;
  monthlyAmount: number;
  nextDueDate?: string;
  allocationIds: string[];
}

/**
 * Group a month's contribution items by their underlying bill so a biweekly
 * schedule (two occurrences) renders as one row at the summed monthly
 * amount. Pure data transform; lives here so the table component and any
 * future consumers share one canonical grouping.
 */
export function groupSharedSplitsByBill(items: ContributionItem[]): SharedSplitGroup[] {
  const byBill = new Map<string, SharedSplitGroup>();
  for (const c of items) {
    const existing = byBill.get(c.billId);
    if (existing) {
      existing.occurrenceCount += 1;
      existing.monthlyAmount += Number(c.amount);
      existing.allocationIds.push(c.allocationId);
      if (!existing.nextDueDate || c.dueDate < existing.nextDueDate) {
        existing.nextDueDate = c.dueDate;
      }
    } else {
      byBill.set(c.billId, {
        billId: c.billId,
        billTitle: c.billTitle,
        // Schema fields use `.nullish()` (string | null | undefined); the
        // local interface uses optional only (string | undefined). Normalise
        // `null` -> `undefined` here so the group stays narrow.
        billCategory: c.billCategory ?? undefined,
        groupId: c.groupId ?? "",
        householdName: c.householdName ?? undefined,
        currency: c.currency,
        occurrenceCount: 1,
        monthlyAmount: Number(c.amount),
        nextDueDate: c.dueDate,
        allocationIds: [c.allocationId],
      });
    }
  }
  return Array.from(byBill.values()).sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

/** Table of grouped shared-household splits the caller owes this month. */
export function SharedSplitsTable({
  groups,
  householdNamesById,
}: {
  groups: SharedSplitGroup[];
  householdNamesById: Record<string, string>;
}) {
  const total = sumBy(groups, (g) => g.monthlyAmount);
  const currency = groups[0]?.currency ?? "USD";

  return (
    <div role="region" aria-label="Shared household splits this month">
      <div className="table-wrap">
        <table className="table">
          <caption className="sr-only">
            Shared household splits this month — {groups.length} {pluralize("bill", groups.length)},
            total {formatCurrency(total, currency)}
          </caption>
          <thead>
            <tr>
              <th scope="col">Bill</th>
              <th scope="col" className="hidden sm:table-cell">
                Household
              </th>
              <th scope="col" className="hidden sm:table-cell">
                Category
              </th>
              <th scope="col" className="right">
                Your share
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const householdName = g.householdName || householdNamesById[g.groupId] || "Household";
              return (
                <tr key={g.billId}>
                  <td>
                    <Link href={`/household/${g.groupId}/expenses/${g.billId}`} className="row-title">
                      {g.billTitle}
                    </Link>
                    {g.occurrenceCount > 1 && (
                      <span className="label" style={{ marginLeft: "6px" }}>
                        × {g.occurrenceCount}
                      </span>
                    )}
                    {/* Mobile: household + category collapse under the bill title. */}
                    <p className="tx-sub mt-1 sm:hidden">
                      <Link href={`/household/${g.groupId}`}>{householdName}</Link>
                      {g.billCategory ? ` · ${g.billCategory}` : ""}
                    </p>
                  </td>
                  <td className="muted hidden sm:table-cell">
                    <Link href={`/household/${g.groupId}`}>{householdName}</Link>
                  </td>
                  <td className="muted hidden sm:table-cell">
                    {g.billCategory ? (
                      <span className="inline-flex items-center gap-2">
                        <Icon name={categoryIcon(g.billCategory)} size={14} strokeWidth={1.75} />
                        {g.billCategory}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="right">
                    <span className="tx-amount debit">
                      −{currency} {formatAmount(g.monthlyAmount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="label mt-3" style={{ color: "var(--text-3)" }}>
        // Source: household ledgers · {groups.length} {pluralize("bill", groups.length)} · ranked by
        monthly amount
      </p>
    </div>
  );
}
