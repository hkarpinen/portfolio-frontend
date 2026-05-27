import React from "react";

/**
 * <LedeStat> — promoted hero metric (editorial)
 *
 * What print would set as the "lede figure" — the one number on the page
 * that matters most. Hard-stamp shadow on a paper field, big serif numeral,
 * ruled aside column with supporting figures.
 *
 * All visual rules in /app/globals.css under `.ed-lede*`.
 */

export interface LedeAside {
  label: string;
  value: string;
  /** Optional sub-line under the value, e.g. "3 personal · 2 shared". */
  sub?: string;
}

interface LedeStatProps {
  /** Mono kicker above the numeral. e.g. "Net this month". */
  label: string;
  /** Hero numeral. Already formatted with the sign you want, e.g. "+$312". */
  value: string;
  /** Tints the numeral red + italic when true. */
  negative?: boolean;
  /** Editorial standfirst sentence below the numeral. */
  deck?: string;
  /** Up to ~4 supporting rows in the right column. */
  aside?: LedeAside[];
  /** Force italic+red even when not negative — for "Income" / soft figures. */
  italic?: boolean;
}

export function LedeStat({
  label,
  value,
  negative,
  deck,
  aside,
  italic,
}: LedeStatProps) {
  const numeralClass = [
    "ed-lede-numeral",
    negative ? "is-negative" : "",
    italic ? "italic" : "",
  ].filter(Boolean).join(" ");

  return (
    <section className="ed-lede" aria-label={label}>
      <div className="ed-lede-figure">
        <p className="ed-lede-label">{label}</p>
        <p className={numeralClass}>{value}</p>
        {deck && <p className="ed-lede-deck">{deck}</p>}
      </div>
      {aside && aside.length > 0 && (
        <div className="ed-lede-aside" role="list" aria-label={`${label} — supporting figures`}>
          {aside.map((row, i) => (
            <div key={i} className="ed-lede-aside-row" role="listitem">
              <span className="ed-lede-aside-label">{row.label}</span>
              <span className="ed-lede-aside-stack">
                <span className="ed-lede-aside-value">{row.value}</span>
                {row.sub && <span className="ed-lede-aside-sub">{row.sub}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
