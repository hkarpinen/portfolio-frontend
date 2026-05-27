import React from "react";

/**
 * <StatCard> + <LedgerStrip> — editorial stats (redesign)
 *
 * All visual rules in /app/globals.css under `.ed-stat*` / `.ed-ledger*` /
 * `.ed-numeral` / `.ed-label-muted` classes. Zero inline styles.
 *
 * LedgerStrip supports 2 / 3 / 4 cells, optionally with a leading label
 * column. Other counts will need a new class added to globals.css.
 */

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendDir?: "up" | "down";
  italic?: boolean;
}

export function StatCard({ label, value, sub, trend, trendDir, italic }: StatCardProps) {
  const subClass =
    trendDir === "up"
      ? "ed-stat-sub-up"
      : trendDir === "down"
      ? "ed-stat-sub-down"
      : "ed-stat-sub-flat";
  return (
    <div className="ed-stat">
      <p className="ed-label-muted ed-stat-label">{label}</p>
      <p className={`ed-numeral ${italic ? "italic" : ""}`}>{value}</p>
      {(sub || trend) && (
        <p className={`ed-stat-sub ${subClass}`}>
          {trend && (
            <span>
              {trendDir === "up" ? "▲" : trendDir === "down" ? "▼" : ""} {trend}
              {sub ? " · " : ""}
            </span>
          )}
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── LedgerStrip ────────────────────────────────────────────────────────────*/
interface LedgerStripProps {
  label?: string;
  cells: StatCardProps[];
  /**
   * Force a specific column count if `cells.length` doesn't match the layout
   * you want. Supported: 2, 3, 4. Defaults to cells.length.
   */
  columns?: 2 | 3 | 4;
}

export function LedgerStrip({ label, cells, columns }: LedgerStripProps) {
  const cols = columns ?? (cells.length as 2 | 3 | 4);
  const colClass =
    cols === 2 ? "ed-ledger-2" : cols === 3 ? "ed-ledger-3" : "ed-ledger-4";
  const cls = ["ed-ledger", colClass, label ? "ed-ledger-with-label" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls}>
      {label && <div className="ed-ledger-label">{label}</div>}
      {cells.map((cell, i) => (
        <StatCard key={i} {...cell} />
      ))}
    </div>
  );
}
