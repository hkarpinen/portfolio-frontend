/**
 * Editorial copy helpers for finance pages — produce headlines, decks, and
 * ticker rows from raw figures so the page reads like a newspaper bulletin
 * instead of a labelled form.
 *
 * Returned `*Headline` strings may contain inline `<em>` for the red italic
 * accent — they are interpolated into `dangerouslySetInnerHTML` consumers
 * (SectionHeader, DepartmentHead). Source: page code only, never user input.
 */

import type { TickerItem } from "@/components/editorial/ticker";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmt0(n: number): string {
  return `$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}

function fmtSigned0(n: number): string {
  if (Math.round(n) === 0) return "$0";
  return `${n < 0 ? "−" : "+"}${fmt0(n)}`;
}

export function currentMonthName(now: Date = new Date()): string {
  return MONTHS[now.getUTCMonth()];
}

// ── Expenses page ────────────────────────────────────────────────────────────

export interface ExpensesHeadlineInput {
  disposable: number;
  income: number;
  monthName: string;
}

export function expensesHeadline({ disposable, income, monthName }: ExpensesHeadlineInput): string {
  if (income <= 0) {
    return `${monthName} reports <em>no income</em> on file`;
  }
  const figure = fmt0(disposable);
  if (Math.round(disposable) === 0) return `${monthName} reads <em>even</em>`;
  if (disposable > 0) return `${monthName} runs <em>${figure}</em> in the black`;
  return `${monthName} runs <em>${figure}</em> in the red`;
}

export interface ExpensesDeckInput {
  income: number;
  totalOut: number;
  recurringCount: number;
  oneTimeCount: number;
  sharedBillCount: number;
}

export function expensesDeck({
  income, totalOut, recurringCount, oneTimeCount, sharedBillCount,
}: ExpensesDeckInput): string {
  if (income <= 0) {
    return "Add an income source on the Income desk to file this month's read.";
  }
  const totalBills = recurringCount + oneTimeCount + sharedBillCount;
  if (totalBills === 0) {
    return `Nothing posted yet against ${fmt0(income)} earned — the desk is quiet.`;
  }
  const parts: string[] = [];
  if (recurringCount > 0) parts.push(`${recurringCount} recurring`);
  if (sharedBillCount > 0) parts.push(`${sharedBillCount} shared`);
  if (oneTimeCount > 0) parts.push(`${oneTimeCount} one-time`);
  return `${parts.join(", ")} posted; outflows total ${fmt0(totalOut)} against ${fmt0(income)} earned.`;
}

export interface ExpensesPullQuote {
  body: string;       // may contain <em>
  attribution: string;
}

export function expensesPullQuote({
  disposable, monthName,
}: { disposable: number; monthName: string }): ExpensesPullQuote | null {
  // Only run the callout when the data actually has something to say. The
  // ±100 threshold keeps it off "neutral" months that would feel forced.
  if (Math.abs(disposable) < 100) return null;
  if (disposable > 0) {
    return {
      body: `You're <em>${fmt0(disposable)}</em> under budget this month — a comfortable read against ${monthName}'s run-rate.`,
      attribution: `${monthName} ledger · disposable income`,
    };
  }
  return {
    body: `Outlays exceeded income by <em>${fmt0(disposable)}</em> this month — the desk recommends a review.`,
    attribution: `${monthName} ledger · cash balance`,
  };
}

// ── Income page ──────────────────────────────────────────────────────────────

export function incomeHeadline({
  sourcesCount, monthlyNet,
}: { sourcesCount: number; monthlyNet: number }): string {
  if (sourcesCount === 0) return `<em>No</em> income on file`;
  const word = sourcesCount === 1 ? "One" : sourcesCount === 2 ? "Two" : sourcesCount === 3 ? "Three" : sourcesCount === 4 ? "Four" : `${sourcesCount}`;
  const stream = sourcesCount === 1 ? "stream" : "streams";
  return `${word} ${stream}, <em>${fmt0(monthlyNet)}</em> net monthly`;
}

export function incomeDeck({
  sourcesCount, monthlyGross, monthlyNet, totalTaxWithheld,
}: {
  sourcesCount: number;
  monthlyGross: number;
  monthlyNet: number;
  totalTaxWithheld: number;
}): string {
  if (sourcesCount === 0) {
    return "Add a paycheck or contract to begin modelling net pay.";
  }
  if (totalTaxWithheld > 0) {
    return `${fmt0(monthlyGross)} gross, ${fmt0(totalTaxWithheld)} withheld in tax, ${fmt0(monthlyNet)} take-home.`;
  }
  return `${fmt0(monthlyGross)} gross, no deductions on file.`;
}

// ── Tickers ──────────────────────────────────────────────────────────────────

export interface UpcomingBill {
  title: string;
  amount: number;
  dueDate: string;     // ISO
}

export function buildExpensesTicker({
  disposable, totalOut, income, upcoming, monthName,
}: {
  disposable: number;
  totalOut: number;
  income: number;
  upcoming: UpcomingBill[];
  monthName: string;
}): TickerItem[] {
  const items: TickerItem[] = [
    { kicker: "MONTH", label: monthName, value: fmtSigned0(disposable), direction: disposable < 0 ? "down" : "up" },
    { kicker: "OUT", label: "Total", value: fmt0(totalOut), direction: "flat" },
    { kicker: "IN", label: "Earned", value: fmt0(income), direction: "flat" },
  ];
  // Surface the next ~4 upcoming bills so the ticker is genuinely useful.
  for (const b of upcoming.slice(0, 4)) {
    const due = new Date(b.dueDate);
    const dueLabel = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    items.push({
      kicker: "DUE",
      label: b.title,
      value: `${fmt0(b.amount)} ${dueLabel}`,
      direction: "flat",
    });
  }
  return items;
}

export function buildIncomeTicker({
  monthlyGross, monthlyNet, totalTaxWithheld, annualGross, sourcesCount,
}: {
  monthlyGross: number;
  monthlyNet: number;
  totalTaxWithheld: number;
  annualGross: number;
  sourcesCount: number;
}): TickerItem[] {
  return [
    { kicker: "NET", label: "Monthly", value: fmt0(monthlyNet), direction: "up" },
    { kicker: "GROSS", label: "Monthly", value: fmt0(monthlyGross), direction: "flat" },
    { kicker: "TAX", label: "Withheld", value: fmt0(totalTaxWithheld), direction: totalTaxWithheld > 0 ? "down" : "flat" },
    { kicker: "ANNUAL", label: "Gross", value: fmt0(annualGross), direction: "flat" },
    { kicker: "SOURCES", label: sourcesCount === 1 ? "On file" : "On file", value: String(sourcesCount), direction: "flat" },
  ];
}
