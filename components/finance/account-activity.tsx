"use client";

import { useMemo, useState } from "react";
import { Btn } from "@/components/editorial";
import type { AccountStatement } from "@/lib/api/ledger";
import { bucketByPeriod, narrateLine, type Granularity } from "@/lib/ledger-activity";
import { formatCurrency, formatShortDate } from "@/lib/formatting";

const GRAINS: { g: Granularity; label: string }[] = [
  { g: "month", label: "Monthly" },
  { g: "quarter", label: "Quarterly" },
  { g: "year", label: "Yearly" },
];

/**
 * The reusable "Account activity" view — the one primitive behind a member's money in a household,
 * the pot, and any ledger drill-in. A Month/Quarter/Year lens over an account's postings, with the
 * period's owed/paid/net and the entries in plain words. Composed from editorial primitives
 * (`ed-ledger` stat grid, `ed-agate` table, `Btn`).
 */
export function AccountActivity({
  statement,
  isMember,
}: {
  statement: AccountStatement;
  isMember: boolean;
}) {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const periods = useMemo(() => bucketByPeriod(statement.lines, granularity), [statement.lines, granularity]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = periods.find((p) => p.key === selectedKey) ?? periods[0] ?? null;
  const cur = statement.currency;
  const owedLabel = isMember ? "Owed" : "Debits";
  const paidLabel = isMember ? "Paid" : "Credits";

  return (
    <div className="flex flex-col gap-5">
      {/* Period lens */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1" role="tablist" aria-label="Period granularity">
          {GRAINS.map(({ g, label }) => (
            <Btn
              key={g}
              size="xs"
              variant={granularity === g ? "primary" : "secondary"}
              onClick={() => {
                setGranularity(g);
                setSelectedKey(null);
              }}
            >
              {label}
            </Btn>
          ))}
        </div>
        {periods.length > 1 && selected && (
          <select
            value={selected.key}
            onChange={(e) => setSelectedKey(e.target.value)}
            aria-label="Select period"
            className="ed-label-muted h-9 cursor-pointer border-ink bg-paper px-3 text-ink"
          >
            {periods.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {!selected ? (
        <p className="ed-empty-dispatch">no activity yet</p>
      ) : (
        <>
          {/* Period summary */}
          <div className="ed-ledger ed-ledger-3">
            <SummaryCell label={owedLabel} value={formatCurrency(selected.owed, cur)} />
            <SummaryCell label={paidLabel} value={formatCurrency(selected.paid, cur)} />
            <SummaryCell
              label="Net"
              value={formatCurrency(selected.net, cur, { signed: true })}
              tone={selected.net < -0.005 ? "neg" : selected.net > 0.005 ? "pos" : undefined}
            />
          </div>

          {/* Postings */}
          <table className="ed-agate" aria-label={`Activity for ${selected.label}`}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Entry</th>
                <th className="num">Amount</th>
                <th className="num">Balance</th>
              </tr>
            </thead>
            <tbody>
              {selected.lines.map((ln, i) => {
                const isPay = ln.direction === "Credit";
                return (
                  <tr key={`${ln.entryId}-${i}`}>
                    <td className="muted">{formatShortDate(ln.date)}</td>
                    <td>{narrateLine(ln, isMember)}</td>
                    <td className="num">
                      <span className={isMember ? (isPay ? "text-green" : "text-red") : undefined}>
                        {isMember ? (isPay ? "+" : "−") : ""}
                        {formatCurrency(ln.amount, cur)}
                      </span>
                    </td>
                    <td className="num">{formatCurrency(ln.runningBalance, cur)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function SummaryCell({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" }) {
  return (
    <div className="px-5 py-4">
      <p className="ed-label-muted">{label}</p>
      <p className={`ed-numeral mt-1 ${tone === "neg" ? "text-red" : tone === "pos" ? "text-green" : ""}`}>
        {value}
      </p>
    </div>
  );
}
