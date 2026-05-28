import { describe, it, expect } from "vitest";
import { formatCurrency, formatAmount } from "@/lib/formatting";

/**
 * These tests pin the editorial display contract for money. They protect
 * against the regression class the audit (§5.1) flagged: six hand-rolled
 * helpers ("fmt0", "fmtUsdInt", "fmtCurrency") had drifted from one
 * another, three of them dropped the `currency` parameter entirely and
 * always rendered "$". Centralising means every consumer gets the locale-
 * native symbol (€, £, ¥) for free — but only if `formatCurrency` actually
 * delivers it. Hence these tests.
 */

describe("formatCurrency", () => {
  it("uses Intl.NumberFormat — USD renders with $", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });

  it("renders non-USD with the native symbol, not the ISO code", () => {
    // GBP must render as £, not "GBP". This is the bug the audit was
    // protecting against — hand-rolled fmt0 hardcoded "$" for non-USD.
    expect(formatCurrency(1234.5, "GBP")).toBe("£1,234.50");
  });

  it("EUR renders with €", () => {
    // Note: Intl's EUR formatting in en-US locale renders as "€1,234.50"
    // (symbol-first). This pins that.
    expect(formatCurrency(1234.5, "EUR")).toBe("€1,234.50");
  });

  it("defaults currency to USD when omitted", () => {
    expect(formatCurrency(100)).toBe("$100.00");
  });

  it("precision: 0 rounds and strips decimals — replaces fmt0/fmtUsdInt", () => {
    expect(formatCurrency(1234.78, "USD", { precision: 0 })).toBe("$1,235");
    expect(formatCurrency(1234.4, "USD", { precision: 0 })).toBe("$1,234");
  });

  it("treats the amount as absolute by default (unsigned)", () => {
    // Editorial convention: the surrounding label says "YOU OWE", the
    // figure itself is unsigned. fmt0 used Math.abs; we preserve that.
    expect(formatCurrency(-500, "USD", { precision: 0 })).toBe("$500");
  });

  it("signed: true prefixes + / − and renders zero with no sign", () => {
    expect(formatCurrency(500, "USD", { precision: 0, signed: true })).toBe("+$500");
    expect(formatCurrency(-500, "USD", { precision: 0, signed: true })).toBe("−$500");
    expect(formatCurrency(0, "USD", { precision: 0, signed: true })).toBe("$0");
  });

  it("falls back to <value> <code> on an invalid currency code", () => {
    // Backend ships a bogus code → we render *something*, not a crash.
    // The fallback shape is `<digits> <code>`, no symbol.
    const out = formatCurrency(123.45, "XYZ-NOPE");
    expect(out).toMatch(/123\.45/);
    expect(out).toMatch(/XYZ-NOPE/);
  });

  it("Intl uses U+2212 MINUS, not ASCII hyphen, for signed negatives", () => {
    // Pinned because the editorial type uses U+2212 (the typographic
    // minus) throughout; a hand-rolled "+/-" prefix would visibly drift.
    const out = formatCurrency(-1, "USD", { precision: 0, signed: true });
    expect(out.startsWith("−")).toBe(true);
  });
});

describe("formatAmount", () => {
  it("renders a plain number with 2 decimals and US-locale separators", () => {
    expect(formatAmount(1234.5)).toBe("1,234.50");
  });

  it("treats negatives literally — no abs", () => {
    expect(formatAmount(-100)).toBe("-100.00");
  });
});
