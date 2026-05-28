import { LedeStat, PullQuote } from "@/components/editorial";
import { expensesPullQuote } from "@/lib/finance/editorial-copy";
import { formatCurrency } from "@/lib/formatting";
import { toMonthlyAmount } from "@/lib/utils";
import type { ContributionPeriod } from "@/types/contributions";
import type { IncomeSource } from "@/types/income";
import type { PayrollDeduction } from "@/types/deductions";

/** Mirrors income/page.tsx so the two pages can't disagree about
 *  what the user earns per month. */
function monthlyDeductionAmount(d: PayrollDeduction, monthlyGross: number): number {
  const base = d.method === "PercentOfGross" ? (d.value / 100) * monthlyGross : d.value;
  return toMonthlyAmount(base, d.frequency ?? "Monthly");
}

function computeIncomeMonthly(sources: IncomeSource[]) {
  let monthlyGross = 0;
  let monthlyDeductions = 0;
  for (const source of sources) {
    const gross = toMonthlyAmount(source.amount, source.quotedAs);
    monthlyGross += gross;
    for (const d of source.deductions ?? []) {
      monthlyDeductions += monthlyDeductionAmount(d, gross);
    }
  }
  return { monthlyGross, monthlyNet: monthlyGross - monthlyDeductions };
}

// Personal-finance pages assume USD (see audit §5.1 caveat in
// lib/finance/editorial-copy.ts). Inline `formatCurrency(n, "USD", …)`
// rather than re-aliasing.

/**
 * FinancialSummary — top-of-page editorial figure block.
 *
 * Renders a hero `<LedeStat>` for "Net this month" (the figure that
 * matters), a secondary `<LedgerStrip>` with three supporting metrics, and
 * — conditionally — a `<PullQuote>` callout when the data has something
 * noteworthy to say.
 */
export function FinancialSummary({
  initialMonths,
  incomeSources,
  monthName,
}: {
  initialMonths: ContributionPeriod[];
  incomeSources: IncomeSource[];
  monthName: string;
}) {
  const nowKey = new Date().toISOString().slice(0, 7);
  const current = initialMonths.find((m) => m.periodStart.slice(0, 7) === nowKey);

  // Income comes from the income sources directly so the "in" figure matches
  // the income page's "Gross monthly". The backend's projectedIncome is
  // paycheck-date-counted for the calendar month, which can read as ~half
  // for biweekly schedules in months that only catch one paycheck.
  const { monthlyGross, monthlyNet } = computeIncomeMonthly(incomeSources);
  const income = monthlyGross;
  const netIncome = monthlyNet;

  const sharedBillsDue = current?.totalDue ?? 0;
  const personalDue = current?.personalBillsDue ?? 0;
  const obligations = sharedBillsDue + personalDue;
  const disposable = netIncome - obligations;
  const netOver = disposable < 0;

  const totalOut = obligations;

  // One-time this month: personal bills without a recurrenceFrequency
  const oneTimeBills = (current?.personalBills ?? []).filter((b) => !b.recurrenceFrequency);
  const oneTimeTotal = oneTimeBills.reduce((sum, b) => sum + b.amount, 0);

  // "Monthly recurring" rolls in the user's share of shared household bills
  // alongside personal recurring outgoings — the user thinks of their
  // recurring obligations as one number, regardless of which household
  // produced them.
  const personalRecurringTotal = (current?.personalBills ?? [])
    .filter((b) => b.recurrenceFrequency)
    .reduce((sum, b) => sum + b.amount, 0);
  const monthlyRecurringTotal = personalRecurringTotal + sharedBillsDue;
  const personalRecurringCount = (current?.personalBills ?? []).filter(
    (b) => b.recurrenceFrequency,
  ).length;
  const sharedBillIds = new Set((current?.contributions ?? []).map((c) => c.billId));

  const quote = expensesPullQuote({ disposable, monthName });

  // Compact breakdown strings rendered next to the aside figures so the
  // lede block is the single home for these numbers — the duplicate
  // LedgerStrip below this block was removed to avoid two readings of
  // the same figures.
  const recurringSub = current
    ? `${personalRecurringCount} personal · ${sharedBillIds.size} shared`
    : undefined;
  const oneTimeSub =
    oneTimeBills.length > 0
      ? `${oneTimeBills.length} expense${oneTimeBills.length === 1 ? "" : "s"}`
      : undefined;

  return (
    <div className="flex flex-col gap-8">
      <LedeStat
        label={`Net · ${monthName}`}
        value={formatCurrency(disposable, "USD", { precision: 0, signed: true })}
        negative={netOver}
        deck={
          income > 0
            ? `${formatCurrency(income, "USD", { precision: 0 })} in against ${formatCurrency(totalOut, "USD", { precision: 0 })} out across ${personalRecurringCount + sharedBillIds.size + oneTimeBills.length} posted item${personalRecurringCount + sharedBillIds.size + oneTimeBills.length === 1 ? "" : "s"}.`
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

      {quote && (
        <PullQuote attribution={quote.attribution}>
          <span dangerouslySetInnerHTML={{ __html: quote.body }} />
        </PullQuote>
      )}
    </div>
  );
}
