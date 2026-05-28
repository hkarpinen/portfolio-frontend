"use client";

import Link from "next/link";
import type { AggregatedPeriod } from "@/lib/contributions";
import type { ContributionItem } from "@/types/contributions";
import type { PersonalBillItem } from "@/types/expense";
import { formatAmount } from "@/lib/formatting";
import {
  usePayExpense,
  useUnpayExpense,
  usePayContributionSplit,
  useUnpayContributionSplit,
} from "@/hooks/use-expenses";
import { PayToggle } from "./pay-toggle";
import type { TableItem } from "./item-table-row";

/**
 * Turn an AggregatedPeriod into a flat TableItem[] for the contributions
 * table. Two paths:
 *
 *   - Monthly view: one row per bill occurrence, sorted by day-of-month,
 *     each row carrying a PayToggle wired to the appropriate mutation.
 *   - Aggregated view (quarterly/yearly): rows fold to one per
 *     bill, summing amounts and counting occurrences. No paid toggle —
 *     toggling is only meaningful inside a single month.
 *
 * Lives as a hook because the row factories close over four mutation
 * objects from React Query. Extracting it out of PeriodCard so the card
 * itself stays a presentation file.
 */
export function usePeriodItems(p: AggregatedPeriod, isMonthly: boolean): TableItem[] {
  const payExp = usePayExpense();
  const unpayExp = useUnpayExpense();
  const paySplit = usePayContributionSplit();
  const unpaySplit = useUnpayContributionSplit();

  if (isMonthly) {
    return buildMonthlyItems(p, { payExp, unpayExp, paySplit, unpaySplit });
  }
  return buildAggregatedItems(p);
}

type Mutations = {
  payExp: ReturnType<typeof usePayExpense>;
  unpayExp: ReturnType<typeof useUnpayExpense>;
  paySplit: ReturnType<typeof usePayContributionSplit>;
  unpaySplit: ReturnType<typeof useUnpayContributionSplit>;
};

function buildMonthlyItems(p: AggregatedPeriod, m: Mutations): TableItem[] {
  const items: TableItem[] = [];

  for (const c of p.contributions) {
    const due = new Date(c.dueDate);
    const pending =
      (m.paySplit.isPending && m.paySplit.variables?.billId === c.billId) ||
      (m.unpaySplit.isPending && m.unpaySplit.variables?.billId === c.billId);
    items.push({
      key: `s-${c.splitId}-${c.dueDate}`,
      dayLabel: String(due.getUTCDate()),
      name: (
        <Link
          href={`/household/${c.groupId ?? c.householdId}/expenses/${c.billId}`}
          className="text-ink no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          {c.billTitle}
          <span className="ml-3 text-base font-normal text-ink-3">{c.householdName}</span>
        </Link>
      ),
      type: "Shared",
      amount: formatAmount(c.amount),
      currency: c.currency,
      paid: c.isClaimed,
      payToggle: (
        <PayToggle
          paid={c.isClaimed}
          pending={pending}
          onToggle={(e) => {
            e.stopPropagation();
            // Both groupId and householdId are `.nullish()` on the wire; the
            // mutation expects a real string. Fall through to "" so the
            // caller (which only ever fires with a known-good context) is
            // type-clean. If both are missing the mutation will 400 — the
            // earlier UX should have prevented enabling the toggle.
            const householdId = c.groupId ?? c.householdId ?? "";
            const mut = c.isClaimed ? m.unpaySplit : m.paySplit;
            mut.mutate({ householdId, billId: c.billId, occurrenceDate: c.dueDate });
          }}
        />
      ),
    });
  }

  for (const pb of p.personalBills) {
    const due = new Date(pb.dueDate);
    const pending =
      (m.payExp.isPending && m.payExp.variables?.id === pb.expenseId) ||
      (m.unpayExp.isPending && m.unpayExp.variables?.id === pb.expenseId);
    items.push({
      key: `e-${pb.expenseId}-${pb.dueDate}`,
      dayLabel: String(due.getUTCDate()),
      name: pb.title,
      type: "Personal",
      amount: formatAmount(pb.amount),
      currency: pb.currency,
      paid: pb.isPaid,
      payToggle: (
        <PayToggle
          paid={!!pb.isPaid}
          pending={pending}
          onToggle={(e) => {
            e.stopPropagation();
            const mut = pb.isPaid ? m.unpayExp : m.payExp;
            mut.mutate({ id: pb.expenseId, occurrenceDate: pb.dueDate });
          }}
        />
      ),
    });
  }

  items.sort((a, b) => Number(a.dayLabel) - Number(b.dayLabel));
  return items;
}

function buildAggregatedItems(p: AggregatedPeriod): TableItem[] {
  const items: TableItem[] = [];

  // Fold contributions to one row per bill across the whole period.
  const splitMap = new Map<string, ContributionItem & { count: number }>();
  for (const c of p.contributions) {
    const ex = splitMap.get(c.splitId);
    if (ex) {
      ex.amount += c.amount;
      ex.count++;
    } else {
      splitMap.set(c.splitId, { ...c, count: 1 });
    }
  }
  for (const c of splitMap.values()) {
    items.push({
      key: `s-${c.splitId}`,
      dayLabel: "—",
      name: (
        <Link
          href={`/household/${c.groupId ?? c.householdId}/expenses/${c.billId}`}
          className="text-ink no-underline"
        >
          {c.billTitle}
          <span className="ml-3 text-base font-normal text-ink-3">{c.householdName}</span>
        </Link>
      ),
      type: "Shared",
      amount: formatAmount(c.amount),
      currency: c.currency,
      count: c.count,
    });
  }

  const expMap = new Map<string, PersonalBillItem & { count: number }>();
  for (const pb of p.personalBills) {
    const ex = expMap.get(pb.expenseId);
    if (ex) {
      ex.amount += pb.amount;
      ex.count++;
    } else {
      expMap.set(pb.expenseId, { ...pb, count: 1 });
    }
  }
  for (const pb of expMap.values()) {
    items.push({
      key: `e-${pb.expenseId}`,
      dayLabel: "—",
      name: pb.title,
      type: "Personal",
      amount: formatAmount(pb.amount),
      currency: pb.currency,
      count: pb.count,
    });
  }

  return items;
}
