import React from "react";

/**
 * <MastheadRow> — top-of-page editorial wayfinding strip
 *
 * Replaces the in-content breadcrumb on editorial pages. Renders:
 *
 *   [BRAND ·]  DESK · [subNav] · LONG-DATE   ←gap→   [action]  ·  VOL/NO
 *
 * On mobile the row stacks: desk/date on line 1, subNav on line 2, action +
 * edition on line 3. Brand is opt-in — the topbar already wears the brand,
 * so repeating it here on every page is loud. Action slot is for the page's
 * primary CTA (e.g. "+ Add expense") so the headline below can run at the
 * full editorial measure unbroken.
 *
 * The volume/number is derived from the date: VOL = year − 2023 (Roman),
 * NO = day-of-year. Both `date` and `edition` may be overridden if a page
 * wants a stamped value (e.g. period archives).
 *
 * All visual rules live in /app/globals.css under `.ed-masthead-*`.
 */

interface MastheadRowProps {
  desk: string;
  /** Page render date. Defaults to today. */
  date?: Date;
  /** Override the auto-derived "Vol. III · No. 147". Pass empty string to hide. */
  edition?: string;
  /** Opt-in brand lockup. Omit on pages that already inherit the topbar brand. */
  brand?: React.ReactNode;
  /** Primary page CTA (e.g. "+ Add expense"). Right-aligned on desktop. */
  action?: React.ReactNode;
  /** Inline sub-navigation (e.g. sub-desk tabs). Renders after the desk label. */
  subNav?: React.ReactNode;
}

const ROMAN = [
  "",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
];

function toRoman(n: number): string {
  if (n <= 0) return "I";
  if (n < ROMAN.length) return ROMAN[n];
  return String(n);
}

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start;
  return Math.floor(diff / 86_400_000);
}

function defaultEdition(d: Date): string {
  const vol = toRoman(Math.max(1, d.getUTCFullYear() - 2023));
  const no = String(dayOfYear(d)).padStart(3, "0");
  return `Vol. ${vol} · No. ${no}`;
}

function longDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MastheadRow({ desk, date, edition, brand, action, subNav }: MastheadRowProps) {
  // The date defaults to today at render time. For SSR consistency callers
  // that need a stable value should pass it in explicitly.
  const d = date ?? new Date();
  const ed = edition ?? defaultEdition(d);
  return (
    <div className="ed-masthead-band" role="doc-pageheader" aria-label="Edition info">
      <div className="ed-masthead-row">
        <div className="ed-masthead-left">
          {brand && (
            <>
              <span className="ed-masthead-brand">{brand}</span>
              <span className="ed-masthead-sep" aria-hidden="true">
                ·
              </span>
            </>
          )}
          <span className="ed-masthead-desk">{desk}</span>
          {subNav && (
            <>
              <span className="ed-masthead-sep ed-masthead-sep-tabs" aria-hidden="true">
                ·
              </span>
              <span className="ed-masthead-subnav">{subNav}</span>
            </>
          )}
          <span className="ed-masthead-sep ed-masthead-sep-date" aria-hidden="true">
            ·
          </span>
          <time className="ed-masthead-date" dateTime={d.toISOString().slice(0, 10)}>
            {longDate(d)}
          </time>
        </div>
        <div className="ed-masthead-right">
          {action && <span className="ed-masthead-action">{action}</span>}
          {ed && (
            <span className="ed-masthead-edition" aria-label={`Edition ${ed}`}>
              {ed}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
