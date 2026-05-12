import { describe, it, expect } from "vitest";
import {
  createHouseholdSchema,
  createHouseholdExpenseSchema,
  updateIncomeSchema,
} from "@/schemas/finance";

describe("createHouseholdSchema", () => {
  it("passes with a valid name", () => {
    const result = createHouseholdSchema.safeParse({ name: "My Household" });
    expect(result.success).toBe(true);
  });

  it("passes with name and optional description", () => {
    const result = createHouseholdSchema.safeParse({
      name: "My Household",
      description: "A shared household",
    });
    expect(result.success).toBe(true);
  });

  it("fails with an empty name", () => {
    const result = createHouseholdSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("fails with name longer than 100 characters", () => {
    const result = createHouseholdSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("fails with description longer than 500 characters", () => {
    const result = createHouseholdSchema.safeParse({
      name: "Valid Name",
      description: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("createHouseholdExpenseSchema", () => {
  const valid = {
    title: "Electricity",
    amount: 120.5,
    dueDate: "2024-08-01",
    householdId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("passes with valid input", () => {
    expect(createHouseholdExpenseSchema.safeParse(valid).success).toBe(true);
  });

  it("fails with empty title", () => {
    expect(createHouseholdExpenseSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
  });

  it("fails with title longer than 300 characters", () => {
    expect(
      createHouseholdExpenseSchema.safeParse({ ...valid, title: "a".repeat(301) }).success
    ).toBe(false);
  });

  it("fails with non-positive amount", () => {
    expect(createHouseholdExpenseSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
    expect(createHouseholdExpenseSchema.safeParse({ ...valid, amount: -5 }).success).toBe(false);
  });

  it("fails with empty dueDate", () => {
    expect(createHouseholdExpenseSchema.safeParse({ ...valid, dueDate: "" }).success).toBe(false);
  });

  it("fails with invalid householdId (not a UUID)", () => {
    expect(
      createHouseholdExpenseSchema.safeParse({ ...valid, householdId: "not-a-uuid" }).success
    ).toBe(false);
  });
});

describe("updateIncomeSchema", () => {
  const valid = {
    householdId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 2500,
  };

  it("passes with valid input", () => {
    expect(updateIncomeSchema.safeParse(valid).success).toBe(true);
  });

  it("passes with zero amount (nonnegative)", () => {
    expect(updateIncomeSchema.safeParse({ ...valid, amount: 0 }).success).toBe(true);
  });

  it("fails with negative amount", () => {
    expect(updateIncomeSchema.safeParse({ ...valid, amount: -1 }).success).toBe(false);
  });

  it("fails with invalid UUID", () => {
    expect(
      updateIncomeSchema.safeParse({ ...valid, householdId: "bad-id" }).success
    ).toBe(false);
  });
});
