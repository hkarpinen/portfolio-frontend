import { LedeStat } from "@/components/editorial";
import { computeIncomeMonthly } from "./expenses-derivations";
import {
  monthObligations,
  oneTimePersonalBills,
  recurringPersonalBills,
  sharedBillIds,
} from "@/lib/contributions";
import { formatCurrency } from "@/lib/formatting";
import { pluralize, sumBy } from "@/lib/utils";
import type { ContributionPeriod } from "@/types/contributions";
import type { IncomeSource } from "@/types/income";

// Personal-finance pages assume USD (see audit §5.1 caveat in
// lib/finance/editorial-copy.ts). Inline `formatCurrency(n, "USD", …)`
// rather than re-aliasing.

/**
 * FinancialSummary — top-of-page editorial figure block.
 *
 * Renders a hero `<LedeStat>` for "Net this month" (the figure that
 * matters), with supporting metrics threaded through its `aside` so
 * every number has one home, and — conditionally — a `<PullQuote>`
 * callout when the data has something noteworthy to say.
 */
export function FinancialSummary({
  period,
  incomeSources,
  monthName,
}: {
  period: ContributionPeriod | undefined;
  incomeSources: IncomeSource[];
  monthName: string;
}) {
  const current = period;

  // Income comes from the income sources directly so the "in" figure matches
  // the income page's "Gross monthly". The backend's projectedIncome is
  // paycheck-date-counted for the calendar month, which can read as ~half
  // for biweekly schedules in months that only catch one paycheck.
  const { monthlyGross, monthlyNet } = computeIncomeMonthly(incomeSources);
  const income = monthlyGross;
  const netIncome = monthlyNet;

  const sharedBillsDue = current?.totalDue ?? 0;
  const totalOut = monthObligations(current);
  const disposable = netIncome - totalOut;
  const netOver = disposable < 0;

  // One-time this month: personal bills without a recurrenceFrequency.
  const oneTimeBills = oneTimePersonalBills(current);
  const oneTimeTotal = sumBy(oneTimeBills, (b) => b.amount);

  // "Monthly recurring" rolls in the user's share of shared household bills
  // alongside personal recurring outgoings — the user thinks of their
  // recurring obligations as one number, regardless of which household
  // produced them.
  const personalRecurringBills = recurringPersonalBills(current);
  const personalRecurringTotal = sumBy(personalRecurringBills, (b) => b.amount);
  const monthlyRecurringTotal = personalRecurringTotal + sharedBillsDue;
  const personalRecurringCount = personalRecurringBills.length;
  const sharedBillIdSet = sharedBillIds(current);

  // Compact breakdown strings rendered next to the aside figures so the
  // lede block is the single home for these numbers — the duplicate
  // LedgerStrip below this block was removed to avoid two readings of
  // the same figures.
  const recurringSub = current
    ? `${personalRecurringCount} personal · ${sharedBillIdSet.size} shared`
    : undefined;
  const oneTimeSub =
    oneTimeBills.length > 0
      ? `${oneTimeBills.length} ${pluralize("expense", oneTimeBills.length)}`
      : undefined;

  return (
    <div className="flex flex-col gap-8">
      <LedeStat
        label={`Net · ${monthName}`}
        value={formatCurrency(disposable, "USD", { precision: 0, signed: true })}
        negative={netOver}
        deck={
          income > 0
            ? (() => {
                const postedCount =
                  personalRecurringCount + sharedBillIdSet.size + oneTimeBills.length;
                return `${formatCurrency(income, "USD", { precision: 0 })} in against ${formatCurrency(totalOut, "USD", { precision: 0 })} out across ${postedCount} posted ${pluralize("item", postedCount)}.`;
              })()
            : "No income on file — add a source on the Income desk to see this month's read."
        }
        aside={[
          { label: "In · take-home", value: formatCurrency(netIncome, "USD", { precision: 0 }) },
          { label: "Out · total", value: formatCurrency(totalOut, "USD", { precision: 0 }) },
          {
            label: "Recurring",
            value: formatCurrency(monthlyRecurringTotal, "USD", { precision: 0 }),
            sub: recurringSub,
          },
          {
            label: "One-time",
            value: formatCurrency(oneTimeTotal, "USD", { precision: 0 }),
            sub: oneTimeSub,
          },
        ]}
      />
    </div>
  );
}
