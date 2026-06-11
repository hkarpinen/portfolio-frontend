import type { StatementLine } from "@/lib/api/ledger";

/**
 * Periodizing + narrating a ledger account's postings — the shared logic behind the reusable
 * "Account activity" view. A statement's lines (dated, signed postings) are the canonical record;
 * everything the member wants (what they owed, what they paid, their history) is a slice of them.
 */

export type Granularity = "month" | "quarter" | "year";

export interface ActivityPeriod {
  key: string;
  label: string;
  lines: StatementLine[];
  /** Σ debits in the period — for a member account, what they owed (their share consumed). */
  owed: number;
  /** Σ credits in the period — for a member account, what they paid (settlements/contributions). */
  paid: number;
  /** paid − owed. For a credit-normal member account this is their net equity change in the period. */
  net: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function periodKeyAndLabel(iso: string, g: Granularity): { key: string; label: string } {
  // ISO dates are UTC date-stamps; slice rather than `new Date` to avoid TZ drift.
  const year = iso.slice(0, 4);
  const month = Number(iso.slice(5, 7)); // 1–12
  if (g === "year") return { key: year, label: year };
  if (g === "quarter") {
    const q = Math.floor((month - 1) / 3) + 1;
    return { key: `${year}-Q${q}`, label: `Q${q} ${year}` };
  }
  return { key: `${year}-${iso.slice(5, 7)}`, label: `${MONTHS[month - 1]} ${year}` };
}

/** Bucket statement lines into periods at the chosen granularity, newest period first. */
export function bucketByPeriod(lines: StatementLine[], g: Granularity): ActivityPeriod[] {
  const map = new Map<string, ActivityPeriod>();
  for (const line of lines) {
    const { key, label } = periodKeyAndLabel(line.date, g);
    let bucket = map.get(key);
    if (!bucket) {
      bucket = { key, label, lines: [], owed: 0, paid: 0, net: 0 };
      map.set(key, bucket);
    }
    bucket.lines.push(line);
    if (line.direction === "Debit") bucket.owed += line.amount;
    else bucket.paid += line.amount;
  }
  const periods = [...map.values()];
  for (const p of periods) {
    p.net = p.paid - p.owed;
    // Within a period, show newest postings first.
    p.lines.sort((a, b) => b.date.localeCompare(a.date));
  }
  return periods.sort((a, b) => b.key.localeCompare(a.key));
}

/**
 * Plain-words narration of a member-account posting. A debit is the member consuming their share;
 * a credit is them paying it back (a settlement, contribution, or settle-up). For non-member
 * accounts, pass `isMember = false` to fall back to the raw entry description.
 */
export function narrateLine(line: StatementLine, isMember: boolean): string {
  const base = line.description.replace(/\s+—\s+(allocated|incurred)$/i, "");
  if (!isMember) return line.description;
  if (line.isReversal) return `Reversed · ${base}`;
  if (line.direction === "Debit") return `Your share of ${base}`;
  if (/settle-?up/i.test(base)) return "Settle-up payment";
  if (/settlement/i.test(base)) return "You paid your share";
  return base;
}
