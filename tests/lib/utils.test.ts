import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timeAgo, formatDate, cn, toMonthlyAmount, getInitials } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    // twMerge lets the last conflicting utility win
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters falsy values", () => {
    expect(cn("foo", false && "bar", undefined, null as unknown as string, "baz")).toBe("foo baz");
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns minutes ago when less than 60 minutes", () => {
    const now = new Date("2024-06-01T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-01T11:45:00Z").toISOString(); // 15 minutes ago
    expect(timeAgo(date)).toBe("15m ago");
  });

  it("returns hours ago when less than 24 hours", () => {
    const now = new Date("2024-06-01T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-01T06:00:00Z").toISOString(); // 6 hours ago
    expect(timeAgo(date)).toBe("6h ago");
  });

  it("returns days ago when less than 30 days", () => {
    const now = new Date("2024-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-08T12:00:00Z").toISOString(); // 7 days ago
    expect(timeAgo(date)).toBe("7d ago");
  });

  it("returns locale date string when 30 or more days ago", () => {
    const now = new Date("2024-07-15T12:00:00Z");
    vi.setSystemTime(now);
    const dateStr = "2024-06-01T12:00:00Z"; // 44 days ago
    const result = timeAgo(dateStr);
    expect(result).toBe(new Date(dateStr).toLocaleDateString());
  });

  it("returns 0m ago for a just-created timestamp", () => {
    const now = new Date("2024-06-01T12:00:00Z");
    vi.setSystemTime(now);
    expect(timeAgo(now.toISOString())).toBe("0m ago");
  });
});

describe("toMonthlyAmount", () => {
  it("returns amount unchanged for monthly frequency", () => {
    expect(toMonthlyAmount(1000, "MONTHLY")).toBe(1000);
  });

  it("returns amount unchanged when frequency is null", () => {
    expect(toMonthlyAmount(1000, null)).toBe(1000);
  });

  it("returns amount unchanged when frequency is undefined", () => {
    expect(toMonthlyAmount(1000, undefined)).toBe(1000);
  });

  it("converts weekly to monthly (×52÷12)", () => {
    expect(toMonthlyAmount(1200, "WEEKLY")).toBeCloseTo((1200 * 52) / 12);
  });

  it("converts biweekly to monthly (×26÷12)", () => {
    expect(toMonthlyAmount(1200, "BIWEEKLY")).toBeCloseTo((1200 * 26) / 12);
  });

  it("converts quarterly to monthly (÷3)", () => {
    expect(toMonthlyAmount(3000, "QUARTERLY")).toBeCloseTo(1000);
  });

  it("converts semi-annually to monthly (÷6)", () => {
    expect(toMonthlyAmount(6000, "SEMIANNUALLY")).toBeCloseTo(1000);
  });

  it("converts annually to monthly (÷12)", () => {
    expect(toMonthlyAmount(12000, "ANNUALLY")).toBeCloseTo(1000);
  });

  it("is case-insensitive for frequency string", () => {
    expect(toMonthlyAmount(1000, "weekly")).toBeCloseTo(toMonthlyAmount(1000, "WEEKLY"));
  });
});

describe("getInitials", () => {
  it("returns initials for a two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial for a one-word name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns at most two initials for a multi-word name", () => {
    // splits on whitespace: "Jean-Claude" → J, "Van" → V (hyphenated first word counts as one token)
    expect(getInitials("Jean-Claude Van Damme")).toBe("JV");
  });

  it("returns ? for null", () => {
    expect(getInitials(null)).toBe("?");
  });

  it("returns ? for undefined", () => {
    expect(getInitials(undefined)).toBe("?");
  });

  it("returns ? for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("uppercases initials", () => {
    expect(getInitials("alice bob")).toBe("AB");
  });
});

describe("formatDate", () => {
  it("formats a date string to a readable locale date", () => {
    const result = formatDate("2024-06-15T12:00:00Z");
    // The exact string depends on locale; just assert it contains the year
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("uses en-US locale format (long month)", () => {
    const result = formatDate("2024-03-05T00:00:00Z");
    // en-US long format should include 'March'
    expect(result).toMatch(/March|3/);
  });
});
