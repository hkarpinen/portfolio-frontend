// lib/formatting.ts
//
// Single source of truth for money + date display formatting. The audit
// (§5.1) flagged six hand-rolled duplications of fmt0/fmtUsdInt/fmtCurrency
// across the finance and household pages — three of which forgot the
// `currency` parameter entirely and hardcoded `$`, which would silently
// mis-render any non-USD household. Centralising here means a non-USD
// household renders correctly the moment the call site passes its currency
// through; no code change required.

export interface FormatCurrencyOptions {
  /**
   * Number of fraction digits to render.
   * - `2` (default): standard money display, e.g. "$1,234.56".
   * - `0`: integer-only, e.g. "$1,234". The previous `fmt0` / `fmtUsdInt`
   *   helpers all rounded then stripped decimals; this preserves that.
   */
  precision?: 0 | 2;
  /**
   * If `true`, render a sign prefix (+ / −) and pass the raw signed amount
   * through Intl, e.g. `+$1,234` or `−$1,234`. If `false` (default), render
   * the absolute value and let the surrounding label carry the sign — the
   * convention the editorial layout uses ("YOU'RE OWED $X" / "YOU OWE $X").
   */
  signed?: boolean;
}

/**
 * Format a money amount with locale-aware separators and currency symbol.
 *
 * Backed by `Intl.NumberFormat` with `style: "currency"`, so EUR / GBP /
 * etc. render with their native symbol (€ £ …) rather than the bare ISO
 * code. Bad currency codes fall back to `<value> <code>` so a backend
 * shipping an unknown code shows something, not a crash.
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  options: FormatCurrencyOptions = {},
): string {
  const { precision = 2, signed = false } = options;
  const value = signed ? amount : Math.abs(amount);
  try {
    const formatted = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
      // "exceptZero" produces +/− prefixes and suppresses sign on zero;
      // we then swap ASCII hyphen for U+2212 MINUS to match the editorial
      // typographic minus convention (the previous `fmtSigned0` hand-rolled
      // U+2212 — preserving that here keeps spreads from re-flowing).
      signDisplay: signed ? "exceptZero" : "never",
    }).format(value);
    return signed ? formatted.replace("-", "−") : formatted;
  } catch {
    const safe = Math.abs(value).toFixed(precision);
    const sign = signed && amount < 0 ? "−" : signed && amount > 0 ? "+" : "";
    return `${sign}${safe} ${currency}`;
  }
}

/**
 * Format a number with 2 decimal places and US locale separators, with no
 * currency symbol. Kept for callers that compose their own currency string
 * (e.g. a table footer that prefixes "total: " manually).
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatShortDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatFullDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
