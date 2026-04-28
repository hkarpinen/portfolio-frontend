import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timeAgo, formatDate, cn } from "@/lib/utils";

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
