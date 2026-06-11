import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  timeAgo,
  formatDate,
  cn,
  toMonthlyAmount,
  getInitials,
  ordinalSuffix,
  formatCountdown,
  pluralize,
  toDateInputValue,
} from "@/lib/utils";

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

// `timeAgo` is exercised in its own describe block below. It absorbed
// the former `relativeTimeShort` helper; assertions for the consolidated
// "just now" / 7-day cutoff / short locale fallback behaviour live below.

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

  it("returns first + last initial for a multi-word name", () => {
    // splits on whitespace: first token "Jean-Claude" → J (hyphenated first
    // word counts as one token), last token "Damme" → D. The middle "Van"
    // is dropped — first+last beats first-two for "Mary Jane Watson" cases.
    expect(getInitials("Jean-Claude Van Damme")).toBe("JD");
  });

  it("returns first + last for three-token names", () => {
    expect(getInitials("John Quincy Adams")).toBe("JA");
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

describe("ordinalSuffix", () => {
  it("returns 'st' for 1, 21, 31", () => {
    expect(ordinalSuffix(1)).toBe("st");
    expect(ordinalSuffix(21)).toBe("st");
    expect(ordinalSuffix(31)).toBe("st");
  });

  it("returns 'nd' for 2, 22", () => {
    expect(ordinalSuffix(2)).toBe("nd");
    expect(ordinalSuffix(22)).toBe("nd");
  });

  it("returns 'rd' for 3, 23", () => {
    expect(ordinalSuffix(3)).toBe("rd");
    expect(ordinalSuffix(23)).toBe("rd");
  });

  it("returns 'th' for the 11-13 exception", () => {
    expect(ordinalSuffix(11)).toBe("th");
    expect(ordinalSuffix(12)).toBe("th");
    expect(ordinalSuffix(13)).toBe("th");
  });

  it("returns 'th' for everything else", () => {
    expect(ordinalSuffix(4)).toBe("th");
    expect(ordinalSuffix(10)).toBe("th");
    expect(ordinalSuffix(100)).toBe("th");
  });
});

describe("pluralize", () => {
  it("returns the bare noun for 1", () => {
    expect(pluralize("item", 1)).toBe("item");
  });

  it("appends 's' by default for non-1 counts", () => {
    expect(pluralize("item", 0)).toBe("items");
    expect(pluralize("item", 2)).toBe("items");
    expect(pluralize("item", 10)).toBe("items");
  });

  it("accepts a custom suffix", () => {
    expect(pluralize("box", 2, "es")).toBe("boxes");
    expect(pluralize("box", 1, "es")).toBe("box");
  });
});

describe("formatCountdown", () => {
  it("renders Ns under a minute", () => {
    expect(formatCountdown(0)).toBe("0s");
    expect(formatCountdown(45)).toBe("45s");
  });

  it("renders Nm NNs under an hour", () => {
    expect(formatCountdown(60)).toBe("1m 00s");
    expect(formatCountdown(125)).toBe("2m 05s");
  });

  it("renders Nh Nm above an hour", () => {
    expect(formatCountdown(3600)).toBe("1h 0m");
    expect(formatCountdown(3660)).toBe("1h 1m");
  });

  it("clamps negative input to 0s", () => {
    expect(formatCountdown(-10)).toBe("0s");
  });
});

describe("timeAgo", () => {
  const now = new Date("2024-06-15T12:00:00Z");

  it("returns 'just now' under a minute", () => {
    const then = new Date("2024-06-15T11:59:30Z");
    expect(timeAgo(then, now)).toBe("just now");
  });

  it("returns Nm ago under an hour", () => {
    const then = new Date("2024-06-15T11:55:00Z");
    expect(timeAgo(then, now)).toBe("5m ago");
  });

  it("returns Nh ago under a day", () => {
    const then = new Date("2024-06-15T09:00:00Z");
    expect(timeAgo(then, now)).toBe("3h ago");
  });

  it("returns Nd ago under a week", () => {
    const then = new Date("2024-06-12T12:00:00Z");
    expect(timeAgo(then, now)).toBe("3d ago");
  });

  it("falls back to Mon D past a week", () => {
    const then = new Date("2024-05-01T12:00:00Z");
    // Locale-dependent format; just assert the year is dropped and the
    // month abbreviation shows up.
    const result = timeAgo(then, now);
    expect(result).toMatch(/May/);
    expect(result).not.toMatch(/2024/);
  });
});

describe("toDateInputValue", () => {
  it("formats an ISO string to YYYY-MM-DD", () => {
    expect(toDateInputValue("2024-06-15T12:34:56Z")).toBe("2024-06-15");
  });

  it("accepts a Date input", () => {
    expect(toDateInputValue(new Date("2024-01-02T00:00:00Z"))).toBe("2024-01-02");
  });
});
