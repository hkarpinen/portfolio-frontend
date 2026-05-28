"use client";

import { SourceNote } from "@/components/editorial";
import Link from "next/link";
import type { ContributionItem } from "@/types/contributions";

import { formatCurrency, formatAmount } from "@/lib/formatting";
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
  splitIds: string[];
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
      existing.splitIds.push(c.splitId);
      if (!existing.nextDueDate || c.dueDate < existing.nextDueDate) {
        existing.nextDueDate = c.dueDate;
      }
    } else {
      byBill.set(c.billId, {
        billId: c.billId,
        billTitle: c.billTitle,
        // Schema fields use `.nullish()` (string | null | undefined); the
        // local interface uses optional only (string | undefined). Normalise
        // `null` → `undefined` here so the group stays narrow.
        billCategory: c.billCategory ?? undefined,
        groupId: c.groupId ?? "",
        householdName: c.householdName ?? undefined,
        currency: c.currency,
        occurrenceCount: 1,
        monthlyAmount: Number(c.amount),
        nextDueDate: c.dueDate,
        splitIds: [c.splitId],
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
    <div className="overflow-x-auto" role="region" aria-label="Shared household splits this month">
      <table className="ed-agate">
        <caption className="sr-only">
          Shared household splits this month — {groups.length} {pluralize("bill", groups.length)},
          total {formatCurrency(total, currency)}
        </caption>
        <thead>
          <tr>
            <th scope="col">Bill</th>
            <th scope="col">Household</th>
            <th scope="col">Category</th>
            <th scope="col" className="num">
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
                  <Link href={`/household/${g.groupId}/expenses/${g.billId}`}>{g.billTitle}</Link>
                  {g.occurrenceCount > 1 && (
                    <span className="ed-agate-occur">× {g.occurrenceCount}</span>
                  )}
                </td>
                <td className="muted">
                  <Link href={`/household/${g.groupId}`}>{householdName}</Link>
                </td>
                <td className="muted">{g.billCategory ?? "—"}</td>
                <td className="num">
                  <span className="ed-agate-currency">{currency}</span>
                  {formatAmount(g.monthlyAmount)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>
              Total · {groups.length} shared {pluralize("bill", groups.length)}
            </td>
            <td className="num">{formatCurrency(total, currency)}</td>
          </tr>
        </tfoot>
      </table>
      <SourceNote
        source="Household ledgers"
        meta={[`${groups.length} ${pluralize("bill", groups.length)}`, "ranked by monthly amount"]}
      />
    </div>
  );
}
