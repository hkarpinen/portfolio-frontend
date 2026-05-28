"use client";

import { EmptyDispatch, SourceNote } from "@/components/editorial";
import type { ExpenseItem } from "@/types/expense";

import { formatCurrency, formatAmount, formatShortDate } from "@/lib/formatting";

/**
 * Table of one-time (non-recurring) personal expenses for the current
 * month. Pure presentation — totals are derived inline from `bills`.
 */
export function OneTimeTable({ bills }: { bills: ExpenseItem[] }) {
  const total = bills.reduce((sum, b) => sum + b.amount, 0);

  if (bills.length === 0) {
    return (
      <EmptyDispatch>
        No one-time expenses <em>posted</em> this month
      </EmptyDispatch>
    );
  }

  return (
    <div className="overflow-x-auto" role="region" aria-label="One-time expenses this month">
      <table className="ed-agate">
        <caption className="sr-only">
          One-time expenses this month — {bills.length} item{bills.length !== 1 ? "s" : ""}, total{" "}
          {formatCurrency(total)}
        </caption>
        <thead>
          <tr>
            <th scope="col">Expense</th>
            <th scope="col">Date</th>
            <th scope="col">Category</th>
            <th scope="col" className="num">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b.expenseId}>
              <td>{b.title}</td>
              <td className="muted">
                <time dateTime={b.dueDate}>{formatShortDate(b.dueDate)}</time>
              </td>
              <td className="muted">{b.category ?? "—"}</td>
              <td className="num">
                <span className="ed-agate-currency">{b.currency ?? "USD"}</span>
                {formatAmount(b.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>
              Total · {bills.length} expense{bills.length !== 1 ? "s" : ""}
            </td>
            <td className="num">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
      <SourceNote
        source="Your ledger"
        meta={[`${bills.length} item${bills.length !== 1 ? "s" : ""}`]}
      />
    </div>
  );
}
