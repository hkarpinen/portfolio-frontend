import { describe, it, expect } from "vitest";
import { householdMonthFigures } from "@/app/(household)/household/[id]/household-detail-derivations";
import type { HouseholdExpense } from "@/types/household-expense";

// The derivation only reads `amount` and `callerShare`; build minimal objects.
const bill = (amount: number, callerShare?: number | null): HouseholdExpense =>
  ({ amount, callerShare } as unknown as HouseholdExpense);

describe("householdMonthFigures", () => {
  it("sums the caller's REAL share, not an even split (regression: uneven split)", () => {
    // $1200 bill split 65/35; caller is the 65% member → their share is $780, not $600.
    const figures = householdMonthFigures([bill(1200, 780)], 2);
    expect(figures.monthlyObligations).toBe(1200);
    expect(figures.yourShare).toBe(780);
    expect(figures.yourSharePct).toBe(65);
  });

  it("matches an even split when the allocation actually is even", () => {
    const figures = householdMonthFigures([bill(1200, 600)], 2);
    expect(figures.yourShare).toBe(600);
    expect(figures.yourSharePct).toBe(50);
  });

  it("sums across multiple bills using each bill's caller share", () => {
    const figures = householdMonthFigures([bill(1200, 780), bill(100, 25)], 2);
    expect(figures.monthlyObligations).toBe(1300);
    expect(figures.yourShare).toBe(805);
  });

  it("falls back to a per-bill even split when the server gave no caller share", () => {
    // callerShare null → even split of THAT bill (1200/2), not the whole pot.
    const figures = householdMonthFigures([bill(1200, null)], 2);
    expect(figures.yourShare).toBe(600);
  });

  it("returns nulls for an empty household", () => {
    const figures = householdMonthFigures([], 2);
    expect(figures.monthlyObligations).toBeNull();
    expect(figures.yourShare).toBeNull();
    expect(figures.yourSharePct).toBeNull();
  });
});
