/**
 * Editorial copy helpers for finance pages — produce headlines, decks, and
 * ticker rows from raw figures so the page reads like a newspaper bulletin
 * instead of a labelled form.
 *
 * Returned `*Headline` strings may contain inline `<em>` for the red italic
 * accent — they are interpolated into `dangerouslySetInnerHTML` consumers
 * (SectionHeader, DepartmentHead). Source: page code only, never user input.
 *
 * Currency: personal-finance pages currently assume USD. The amounts come
 * from the personal income/expenses domain, which doesn't carry a per-
 * source currency. If the personal side ever supports non-USD, every
 * `formatCurrency(n, "USD", …)` below needs to take a currency parameter
 * from the caller — likely sourced from the user's preferred currency.
 */

import { formatCurrency } from "@/lib/formatting";
import { MONTH_NAMES } from "@/lib/utils";
import type { TickerItem } from "@/types/ticker";

export function currentMonthName(now: Date = new Date()): string {
  // getUTCMonth() returns 0-11; MONTH_NAMES has length 12. The non-null
  // assertion is sound; the alternative is a `?? ""` fallback that's
  // unreachable in practice but makes TS strict-indexed-access happy.
  return MONTH_NAMES[now.getUTCMonth()]!;
}

// ── Expenses page ────────────────────────────────────────────────────────────

interface ExpensesHeadlineInput {
  disposable: number;
  income: number;
  monthName: string;
}

export function expensesHeadline({ disposable, income, monthName }: ExpensesHeadlineInput): string {
  if (income <= 0) {
    return `${monthName} reports <em>no income</em> on file`;
  }
  const figure = formatCurrency(disposable, "USD", { precision: 0 });
  if (Math.round(disposable) === 0) return `${monthName} reads <em>even</em>`;
  if (disposable > 0) return `${monthName} runs <em>${figure}</em> in the black`;
  return `${monthName} runs <em>${figure}</em> in the red`;
}

interface ExpensesDeckInput {
  income: number;
  totalOut: number;
  recurringCount: number;
  oneTimeCount: number;
  sharedBillCount: number;
}

export function expensesDeck({
  income,
  totalOut,
  recurringCount,
  oneTimeCount,
  sharedBillCount,
}: ExpensesDeckInput): string {
  if (income <= 0) {
    return "Add an income source on the Income desk to file this month's read.";
  }
  const totalBills = recurringCount + oneTimeCount + sharedBillCount;
  if (totalBills === 0) {
    return `Nothing posted yet against ${formatCurrency(income, "USD", { precision: 0 })} earned — the desk is quiet.`;
  }
  const parts: string[] = [];
  if (recurringCount > 0) parts.push(`${recurringCount} recurring`);
  if (sharedBillCount > 0) parts.push(`${sharedBillCount} shared`);
  if (oneTimeCount > 0) parts.push(`${oneTimeCount} one-time`);
  return `${parts.join(", ")} posted; outflows total ${formatCurrency(totalOut, "USD", { precision: 0 })} against ${formatCurrency(income, "USD", { precision: 0 })} earned.`;
}

interface ExpensesPullQuote {
  body: string; // may contain <em>
  attribution: string;
}

export function expensesPullQuote({
  disposable,
  monthName,
}: {
  disposable: number;
  monthName: string;
}): ExpensesPullQuote | null {
  // Only run the callout when the data actually has something to say. The
  // ±100 threshold keeps it off "neutral" months that would feel forced.
  if (Math.abs(disposable) < 100) return null;
  if (disposable > 0) {
    return {
      body: `You're <em>${formatCurrency(disposable, "USD", { precision: 0 })}</em> under budget this month — a comfortable read against ${monthName}'s run-rate.`,
      attribution: `${monthName} ledger · disposable income`,
    };
  }
  return {
    body: `Outlays exceeded income by <em>${formatCurrency(disposable, "USD", { precision: 0 })}</em> this month — the desk recommends a review.`,
    attribution: `${monthName} ledger · cash balance`,
  };
}

// ── Income page ──────────────────────────────────────────────────────────────

export function incomeHeadline({
  sourcesCount,
  monthlyNet,
}: {
  sourcesCount: number;
  monthlyNet: number;
}): string {
  if (sourcesCount === 0) return `<em>No</em> income on file`;
  const word =
    sourcesCount === 1
      ? "One"
      : sourcesCount === 2
        ? "Two"
        : sourcesCount === 3
          ? "Three"
          : sourcesCount === 4
            ? "Four"
            : `${sourcesCount}`;
  const stream = sourcesCount === 1 ? "stream" : "streams";
  return `${word} ${stream}, <em>${formatCurrency(monthlyNet, "USD", { precision: 0 })}</em> net monthly`;
}

export function incomeDeck({
  sourcesCount,
  monthlyGross,
  monthlyNet,
  totalTaxWithheld,
}: {
  sourcesCount: number;
  monthlyGross: number;
  monthlyNet: number;
  totalTaxWithheld: number;
}): string {
  if (sourcesCount === 0) {
    return "Add a paycheck or contract to begin modelling net pay.";
  }
  const gross = formatCurrency(monthlyGross, "USD", { precision: 0 });
  if (totalTaxWithheld > 0) {
    const tax = formatCurrency(totalTaxWithheld, "USD", { precision: 0 });
    const net = formatCurrency(monthlyNet, "USD", { precision: 0 });
    return `${gross} gross, ${tax} withheld in tax, ${net} take-home.`;
  }
  return `${gross} gross, no deductions on file.`;
}

// ── Tickers ──────────────────────────────────────────────────────────────────

export interface UpcomingBill {
  title: string;
  amount: number;
  dueDate: string; // ISO
}

export function buildExpensesTicker({
  disposable,
  totalOut,
  income,
  upcoming,
  monthName,
}: {
  disposable: number;
  totalOut: number;
  income: number;
  upcoming: UpcomingBill[];
  monthName: string;
}): TickerItem[] {
  const items: TickerItem[] = [
    {
      kicker: "MONTH",
      label: monthName,
      value: formatCurrency(disposable, "USD", { precision: 0, signed: true }),
      direction: disposable < 0 ? "down" : "up",
    },
    {
      kicker: "OUT",
      label: "Total",
      value: formatCurrency(totalOut, "USD", { precision: 0 }),
      direction: "flat",
    },
    {
      kicker: "IN",
      label: "Earned",
      value: formatCurrency(income, "USD", { precision: 0 }),
      direction: "flat",
    },
  ];
  // Surface the next ~4 upcoming bills so the ticker is genuinely useful.
  for (const b of upcoming.slice(0, 4)) {
    const due = new Date(b.dueDate);
    const dueLabel = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    items.push({
      kicker: "DUE",
      label: b.title,
      value: `${formatCurrency(b.amount, "USD", { precision: 0 })} ${dueLabel}`,
      direction: "flat",
    });
  }
  return items;
}

export function buildIncomeTicker({
  monthlyGross,
  monthlyNet,
  totalTaxWithheld,
  annualGross,
  sourcesCount,
}: {
  monthlyGross: number;
  monthlyNet: number;
  totalTaxWithheld: number;
  annualGross: number;
  sourcesCount: number;
}): TickerItem[] {
  return [
    {
      kicker: "NET",
      label: "Monthly",
      value: formatCurrency(monthlyNet, "USD", { precision: 0 }),
      direction: "up",
    },
    {
      kicker: "GROSS",
      label: "Monthly",
      value: formatCurrency(monthlyGross, "USD", { precision: 0 }),
      direction: "flat",
    },
    {
      kicker: "TAX",
      label: "Withheld",
      value: formatCurrency(totalTaxWithheld, "USD", { precision: 0 }),
      direction: totalTaxWithheld > 0 ? "down" : "flat",
    },
    {
      kicker: "ANNUAL",
      label: "Gross",
      value: formatCurrency(annualGross, "USD", { precision: 0 }),
      direction: "flat",
    },
    {
      kicker: "SOURCES",
      label: sourcesCount === 1 ? "On file" : "On file",
      value: String(sourcesCount),
      direction: "flat",
    },
  ];
}
