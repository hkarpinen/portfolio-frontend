import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, confirmEmailSchema } from "@/schemas/auth";

describe("loginSchema", () => {
  it("passes with valid credentials", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("fails with invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("fails with password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password");
    }
  });

  it("fails when email is missing", () => {
    const result = loginSchema.safeParse({ password: "password123" });
    expect(result.success).toBe(false);
  });

  it("fails when password is missing", () => {
    const result = loginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    email: "user@example.com",
    displayName: "Alice",
    password: "securepassword123",
    confirmPassword: "securepassword123",
  };

  it("passes with valid input", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails with invalid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "bad-email" });
    expect(result.success).toBe(false);
  });

  it("fails with displayName shorter than 3 characters", () => {
    const result = registerSchema.safeParse({ ...valid, displayName: "Al" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("displayName");
    }
  });

  it("fails with password shorter than 12 characters", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password");
    }
  });

  it("fails when passwords do not match", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "differentpassword123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
      expect(result.error.issues[0].message).toMatch(/don't match/i);
    }
  });
});

describe("confirmEmailSchema", () => {
  it("passes with a token string", () => {
    const result = confirmEmailSchema.safeParse({ token: "abc123" });
    expect(result.success).toBe(true);
  });

  it("fails when token is missing", () => {
    const result = confirmEmailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
