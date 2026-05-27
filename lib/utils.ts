import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    case "WEEKLY":       return amount * 52 / 12;
    case "BIWEEKLY":     return amount * 26 / 12;
    case "QUARTERLY":    return amount / 3;
    case "SEMIANNUALLY": return amount / 6;
    case "ANNUALLY":     return amount / 12;
    default:             return amount; // Monthly or unset
  }
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
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
