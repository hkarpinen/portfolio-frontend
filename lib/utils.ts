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
