import { describe, it, expect, vi, afterEach } from "vitest";
import {
  aggregateByYear,
  aggregateByQuarter,
  toMonthlyPeriods,
  sortPeriods,
  emptyBucket,
  mergeBucket,
} from "@/lib/contributions";
import type { ContributionPeriodSummary } from "@/types/finance";

function makePeriod(periodStart: string, overrides: Partial<ContributionPeriodSummary> = {}): ContributionPeriodSummary {
  return {
    periodLabel: periodStart.slice(0, 7),
    periodStart,
    periodEnd: periodStart,
    totalDue: 100,
    totalPaid: 50,
    projectedIncome: 3000,
    projectedNetIncome: 2500,
    contributions: [],
    personalBillsDue: 0,
    personalBills: [],
    disposableIncome: null,
    disposableIncomeSource: null,
    ...overrides,
  };
}

describe("emptyBucket", () => {
  it("creates a zeroed bucket with correct label and periodStart", () => {
    const bucket = emptyBucket("2025", "2025-01-01");

    expect(bucket.label).toBe("2025");
    expect(bucket.periodStart).toBe("2025-01-01");
    expect(bucket.totalDue).toBe(0);
    expect(bucket.totalPaid).toBe(0);
    expect(bucket.net).toBe(0);
    expect(bucket.contributions).toEqual([]);
    expect(bucket.isCurrent).toBe(false);
    expect(bucket.disposableIncome).toBeNull();
  });
});

describe("mergeBucket", () => {
  it("accumulates totalDue and totalPaid", () => {
    const bucket = emptyBucket("2025", "2025-01-01");
    const period = makePeriod("2025-01-01", { totalDue: 200, totalPaid: 100 });

    mergeBucket(bucket, period, "2099-01");

    expect(bucket.totalDue).toBe(200);
    expect(bucket.totalPaid).toBe(100);
  });

  it("sets isCurrent when periodStart matches the now key", () => {
    const bucket = emptyBucket("now", "2025-06-01");
    const nowKey = new Date().toISOString().slice(0, 7);
    const period = makePeriod(`${nowKey}-01`);

    mergeBucket(bucket, period, nowKey);

    expect(bucket.isCurrent).toBe(true);
  });

  it("accumulates disposableIncome when provided", () => {
    const bucket = emptyBucket("2025", "2025-01-01");
    const period = makePeriod("2025-01-01", { disposableIncome: 500, disposableIncomeSource: "balance" });

    mergeBucket(bucket, period, "2099-01");

    expect(bucket.disposableIncome).toBe(500);
    expect(bucket.disposableIncomeSource).toBe("balance");
  });

  it("appends contributions and personalBills", () => {
    const bucket = emptyBucket("2025", "2025-01-01");
    const contribution = { splitId: "s1", billId: "b1", groupId: "g1", householdId: "h1",
      householdName: "Home", billTitle: "Rent", amount: 800, currency: "USD",
      dueDate: "2025-01-01", isClaimed: false, claimedAt: null };
    const period = makePeriod("2025-01-01", { contributions: [contribution] });

    mergeBucket(bucket, period, "2099-01");

    expect(bucket.contributions).toHaveLength(1);
    expect(bucket.contributions[0]).toBe(contribution);
  });
});

describe("aggregateByYear", () => {
  it("groups months into yearly buckets", () => {
    const months = [
      makePeriod("2024-01-01", { totalDue: 100 }),
      makePeriod("2024-06-01", { totalDue: 200 }),
      makePeriod("2025-01-01", { totalDue: 50 }),
    ];

    const result = aggregateByYear(months);

    expect(result).toHaveLength(2);
    const y2024 = result.find((r) => r.label === "2024")!;
    expect(y2024.totalDue).toBe(300);
    const y2025 = result.find((r) => r.label === "2025")!;
    expect(y2025.totalDue).toBe(50);
  });

  it("returns empty array for empty input", () => {
    expect(aggregateByYear([])).toEqual([]);
  });

  it("sorts years ascending", () => {
    const months = [
      makePeriod("2025-03-01"),
      makePeriod("2023-11-01"),
      makePeriod("2024-07-01"),
    ];

    const result = aggregateByYear(months);

    expect(result.map((r) => r.label)).toEqual(["2023", "2024", "2025"]);
  });
});

describe("aggregateByQuarter", () => {
  it("groups months into quarterly buckets", () => {
    const months = [
      makePeriod("2025-01-01", { totalDue: 100 }),
      makePeriod("2025-02-01", { totalDue: 200 }),
      makePeriod("2025-04-01", { totalDue: 300 }),
    ];

    const result = aggregateByQuarter(months);

    expect(result).toHaveLength(2);
    const q1 = result.find((r) => r.label === "Q1 2025")!;
    expect(q1.totalDue).toBe(300);
    const q2 = result.find((r) => r.label === "Q2 2025")!;
    expect(q2.totalDue).toBe(300);
  });

  it("assigns correct quarter labels", () => {
    const months = [
      makePeriod("2025-01-01"),
      makePeriod("2025-04-01"),
      makePeriod("2025-07-01"),
      makePeriod("2025-10-01"),
    ];

    const labels = aggregateByQuarter(months).map((r) => r.label).sort();

    expect(labels).toEqual(["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"]);
  });

  it("returns empty array for empty input", () => {
    expect(aggregateByQuarter([])).toEqual([]);
  });
});

describe("toMonthlyPeriods", () => {
  it("maps each period to an AggregatedPeriod with matching fields", () => {
    const months = [
      makePeriod("2025-03-01", { totalDue: 400, totalPaid: 200, projectedNetIncome: 2000, personalBillsDue: 100 }),
    ];

    const result = toMonthlyPeriods(months);

    expect(result).toHaveLength(1);
    expect(result[0].totalDue).toBe(400);
    expect(result[0].totalPaid).toBe(200);
    expect(result[0].projectedNetIncome).toBe(2000);
    expect(result[0].personalBillsDue).toBe(100);
    expect(result[0].periodStart).toBe("2025-03-01");
  });

  it("marks the current month as isCurrent", () => {
    const nowKey = new Date().toISOString().slice(0, 7);
    const months = [makePeriod(`${nowKey}-01`)];

    const result = toMonthlyPeriods(months);

    expect(result[0].isCurrent).toBe(true);
  });

  it("does not mark a past month as isCurrent", () => {
    const months = [makePeriod("2020-01-01")];

    const result = toMonthlyPeriods(months);

    expect(result[0].isCurrent).toBe(false);
  });
});

describe("sortPeriods", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("places the current period first", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T00:00:00Z"));

    const periods = [
      { ...emptyBucket("May 2025", "2025-05-01"), isCurrent: false },
      { ...emptyBucket("Jun 2025", "2025-06-01"), isCurrent: true },
      { ...emptyBucket("Apr 2025", "2025-04-01"), isCurrent: false },
    ];

    const result = sortPeriods(periods);

    expect(result[0].label).toBe("Jun 2025");
  });

  it("places future periods before past periods (after current)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T00:00:00Z"));

    const periods = [
      { ...emptyBucket("Apr 2025", "2025-04-01"), isCurrent: false },
      { ...emptyBucket("Aug 2025", "2025-08-01"), isCurrent: false },
      { ...emptyBucket("Jun 2025", "2025-06-01"), isCurrent: true },
    ];

    const result = sortPeriods(periods);

    expect(result[0].label).toBe("Jun 2025");
    expect(result[1].label).toBe("Aug 2025");
    expect(result[2].label).toBe("Apr 2025");
  });

  it("sorts past periods descending (most recent first)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T00:00:00Z"));

    const periods = [
      { ...emptyBucket("2025", "2025-06-01"), isCurrent: true },
      { ...emptyBucket("Jan 2025", "2025-01-01"), isCurrent: false },
      { ...emptyBucket("Mar 2025", "2025-03-01"), isCurrent: false },
      { ...emptyBucket("Feb 2025", "2025-02-01"), isCurrent: false },
    ];

    const result = sortPeriods(periods);

    expect(result[1].label).toBe("Mar 2025");
    expect(result[2].label).toBe("Feb 2025");
    expect(result[3].label).toBe("Jan 2025");
  });
});
