import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Full English month names, indexed 0–11 to align with `Date.getMonth()`.
 * Used by the calendar grid, the household calendar page, and the finance
 * editorial-copy headlines — every site that needs to print "April" from
 * a `Date` or month-index reads from here.
 */
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Normalises any amount+frequency pair to its monthly equivalent.
 * Uses the same annualised formula as the backend UserBudgetCalculator:
 *   Weekly       → amount × 52 ÷ 12  (≈ 4.333×/month)
 *   BiWeekly     → amount × 26 ÷ 12  (≈ 2.167×/month)
 *   Monthly      → amount
 *   Quarterly    → amount ÷ 3
 *   SemiAnnually → amount ÷ 6
 *   Annually     → amount ÷ 12
 */
export function toMonthlyAmount(amount: number, frequency?: string | null): number {
  switch (frequency?.toUpperCase()) {
    case "WEEKLY":
      return (amount * 52) / 12;
    case "BIWEEKLY":
      return (amount * 26) / 12;
    case "QUARTERLY":
      return amount / 3;
    case "SEMIANNUALLY":
      return amount / 6;
    case "ANNUALLY":
      return amount / 12;
    default:
      return amount; // Monthly or unset
  }
}

/**
 * "just now / Nm ago / Nh ago / Nd ago / mon d" relative-time label, used
 * by every activity-timestamp surface (forum threads/comments, notifications,
 * sessions, source notes, community cards). Past 7 days, falls through to a
 * short locale date so the label doesn't grow without bound.
 *
 * Pluggable `now` so SSR and client agree on the boundary between buckets.
 * Accepts either an ISO string or a `Date`.
 *
 * The previous longer-cutoff variant ("Nd ago" out to 30 days, raw
 * `toLocaleDateString()` fallback) was consolidated into this one in the
 * view-component-lift pass — one helper now backs every relative-time label
 * in the app.
 */
export function timeAgo(input: string | Date, now: Date = new Date()): string {
  const then = typeof input === "string" ? new Date(input) : input;
  const ms = Math.max(0, now.getTime() - then.getTime());
  const s = Math.round(ms / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Day-of-month ordinal suffix: 1 → "st", 2 → "nd", 11 → "th", 23 → "rd".
 * The 11–13 carve-out is the English exception every implementation forgets.
 */
export function ordinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Format a positive duration in seconds as "Nh Nm" / "Nm NNs" / "Ns". Used
 * by the demo-session banner and any other countdown timer that wants the
 * largest meaningful unit.
 */
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

/**
 * English pluralization for the "5 items / 1 item" pattern that was being
 * hand-rolled in ~10 components. Drops or appends a suffix (default "s")
 * based on count.
 */
export function pluralize(noun: string, count: number, suffix: string = "s"): string {
  return count === 1 ? noun : `${noun}${suffix}`;
}

/**
 * Format a YYYY-MM-DD string (the form field shape) from a Date. Used by
 * `useForm` defaults that need to seed a `<input type="date">` from an
 * ISO wire timestamp.
 */
export function toDateInputValue(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toISOString().slice(0, 10);
}

/**
 * Avatar initials from a display name. Single name → single letter
 * ("Alice" → "A"); multi-word → first + last token initial ("John Quincy
 * Adams" → "JA"). The first+last rule beats "first two tokens" for people
 * whose middle name is the public-facing one: "Mary Jane Watson" reads as
 * "MW" not "MJ", which matches how a reader scans the name.
 *
 * Whitespace is the only delimiter — "Jean-Claude" counts as one token so
 * a hyphenated first name doesn't get split into "JC".
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter((c): c is string => !!c);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.toUpperCase();
  return (parts[0]! + parts[parts.length - 1]!).toUpperCase();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Escape HTML special characters so user content can't inject markup.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Editorial title accent: render `*word*` segments as `<em>word</em>`.
 * Everything else is HTML-escaped. Author opt-in — titles without asterisks
 * render as plain text.
 */
export function renderTitleAccent(title: string): string {
  // Split on `*…*` segments, preserving order. Non-greedy match, no nesting.
  const parts = title.split(/(\*[^*]+\*)/g);
  return parts
    .map((p) =>
      p.startsWith("*") && p.endsWith("*") && p.length > 2
        ? `<em>${escapeHtml(p.slice(1, -1))}</em>`
        : escapeHtml(p),
    )
    .join("");
}

/**
 * Editorial author-handle: render a display name as `@handle` for use in the
 * meta line on threads and comments. The mockup pairs this with uppercase
 * mono CSS, so we keep the raw casing here and let the typography do the
 * uppercase transform.
 *
 * Whitespace inside a name collapses to a single `_` so multi-word display
 * names read as a single handle. Everything else (unicode letters, dots,
 * apostrophes, etc.) is preserved — over-aggressive stripping used to wipe
 * out valid names like "O'Brien" and surface a misleading `@anonymous`.
 *
 * Returns `@anonymous` only when the input is empty or whitespace-only.
 */
export function authorHandle(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "@anonymous";
  return `@${trimmed.replace(/\s+/g, "_")}`;
}

/**
 * Sum a derived numeric field across an array. Replaces the
 * `xs.reduce((s, x) => s + x.amount, 0)` pattern that was hand-rolled in
 * every total / subtotal computation. The selector keeps the call site
 * readable: `sumBy(bills, (b) => b.amount)`.
 */
export function sumBy<T>(items: readonly T[], selector: (item: T) => number): number {
  let total = 0;
  for (const x of items) total += selector(x);
  return total;
}

/**
 * Case-insensitive ID equality with explicit `false` for missing inputs.
 * The wire occasionally hands back the same UUID in different casings
 * (mostly when one side passes through `.toString()` and the other doesn't),
 * so id checks across the app compare lowercased.
 *
 * Returns `false` if either side is null/undefined — the previous inline
 * pattern (`a?.toLowerCase() === b?.toLowerCase()`) returned `true` when
 * both were `undefined`, which was a latent bug (a "no session" caller
 * could read as "matches no-owner" and flip privileged UI on). This
 * helper is intentionally stricter.
 */
export function idsEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * First N characters of a UUID, used for "Member abc12345…" style
 * fallbacks when a display name isn't available. Empty string if the id
 * is missing, so consumers can compose with a `??` chain.
 */
export function shortId(id: string | null | undefined, length: number = 8): string {
  if (!id) return "";
  return id.slice(0, length);
}

/**
 * Canonical "show this user / member" label. Falls back in order:
 * `displayName` → `username` → `Member ${shortId}…`. Used across every
 * surface that renders a member row (member-actions, contributions table,
 * expense splits, household chrome aria-labels). Consolidates ~10
 * one-off `??`-chains that each used a different format.
 *
 * Pass an explicit `fallbackId` when the natural id isn't `member.userId`
 * — currently only the split-detail table needs this, where a row can
 * arrive with `splitId` set but `userId` missing.
 */
export function memberDisplayName(
  member: {
    displayName?: string | null;
    username?: string | null;
    userId?: string | null;
  },
  fallbackId?: string | null,
): string {
  return member.displayName || member.username || `Member ${shortId(fallbackId ?? member.userId)}…`;
}
