import { describe, it, expect } from "vitest";
import {
  createCommunitySchema,
  createThreadSchema,
  createCommentSchema,
} from "@/schemas/forum";

describe("createCommunitySchema", () => {
  const valid = { name: "Developers", description: "A community for devs" };

  it("passes with valid input", () => {
    expect(createCommunitySchema.safeParse(valid).success).toBe(true);
  });

  it("fails with name shorter than 3 characters", () => {
    const result = createCommunitySchema.safeParse({ ...valid, name: "ab" });
    expect(result.success).toBe(false);
  });

  it("fails with name longer than 64 characters", () => {
    const result = createCommunitySchema.safeParse({
      ...valid,
      name: "a".repeat(65),
    });
    expect(result.success).toBe(false);
  });

  it("fails with description longer than 500 characters", () => {
    const result = createCommunitySchema.safeParse({
      ...valid,
      description: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("fails when name is missing", () => {
    expect(createCommunitySchema.safeParse({ description: "desc" }).success).toBe(false);
  });
});

describe("createThreadSchema", () => {
  const valid = { title: "Hello World", content: "My first thread" };

  it("passes with valid input", () => {
    expect(createThreadSchema.safeParse(valid).success).toBe(true);
  });

  it("fails with title shorter than 3 characters", () => {
    expect(createThreadSchema.safeParse({ ...valid, title: "Hi" }).success).toBe(false);
  });

  it("fails with title longer than 200 characters", () => {
    expect(
      createThreadSchema.safeParse({ ...valid, title: "a".repeat(201) }).success
    ).toBe(false);
  });

  it("fails with empty content", () => {
    expect(createThreadSchema.safeParse({ ...valid, content: "" }).success).toBe(false);
  });

  it("fails when content is missing", () => {
    expect(createThreadSchema.safeParse({ title: "My Title" }).success).toBe(false);
  });
});

describe("createCommentSchema", () => {
  it("passes with non-empty content", () => {
    expect(createCommentSchema.safeParse({ content: "Great post!" }).success).toBe(true);
  });

  it("fails with empty content", () => {
    expect(createCommentSchema.safeParse({ content: "" }).success).toBe(false);
  });

  it("fails when content is missing", () => {
    expect(createCommentSchema.safeParse({}).success).toBe(false);
  });
});
