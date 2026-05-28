import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { z } from "zod";
import { api, ApiError, ResponseValidationError } from "@/lib/api-client";

/**
 * These tests pin three contracts the audit (§6.4) called out:
 *   1. The fallback chain in `toApiError` — `.error`, `.message`, `.detail`,
 *      then a synthetic "(status)" message — so any reorganisation of that
 *      function breaks here, not in production.
 *   2. 204 / empty-body handling for both blind and validated requests.
 *   3. `ResponseValidationError` shape when a 2xx body fails its schema.
 */

function mockFetchOnce(init: ResponseInit, body?: string) {
  const stub = vi.fn(async () => new Response(body ?? null, init));
  vi.stubGlobal("fetch", stub);
  return stub;
}

beforeEach(() => {
  // Quiet expected error logs from parseValidated's dev console.error.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("toApiError fallback chain", () => {
  it("prefers `.error` over `.message` and `.detail`", async () => {
    mockFetchOnce(
      { status: 400, headers: { "Content-Type": "application/json" } },
      JSON.stringify({ error: "from-error", message: "from-message", detail: "from-detail" }),
    );

    await expect(api.get("/x")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "from-error",
    });
  });

  it("falls back to `.message` when `.error` is absent", async () => {
    mockFetchOnce(
      { status: 422, headers: { "Content-Type": "application/json" } },
      JSON.stringify({ message: "from-message", detail: "from-detail" }),
    );

    await expect(api.get("/x")).rejects.toMatchObject({
      status: 422,
      message: "from-message",
    });
  });

  it("falls back to ASP.NET Core ProblemDetails `.detail` when both are absent", async () => {
    mockFetchOnce(
      { status: 500, headers: { "Content-Type": "application/json" } },
      JSON.stringify({ detail: "from-detail" }),
    );

    await expect(api.get("/x")).rejects.toMatchObject({
      status: 500,
      message: "from-detail",
    });
  });

  it("falls back to synthetic '(status)' message when the error body is empty / non-JSON", async () => {
    mockFetchOnce({ status: 503 }, "");

    await expect(api.get("/x")).rejects.toMatchObject({
      status: 503,
      message: "Request failed (503)",
    });
  });

  it("is an instance of ApiError", async () => {
    mockFetchOnce({ status: 404 }, "{}");
    await expect(api.get("/x")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("parseBody (blind path)", () => {
  it("returns undefined for 204 No Content", async () => {
    mockFetchOnce({ status: 204 }, null as unknown as string);
    await expect(api.delete<undefined>("/x")).resolves.toBeUndefined();
  });

  it("returns undefined for a 2xx response with empty body", async () => {
    mockFetchOnce({ status: 200 }, "");
    await expect(api.get<undefined>("/x")).resolves.toBeUndefined();
  });

  it("parses the body as JSON when present", async () => {
    mockFetchOnce(
      { status: 200, headers: { "Content-Type": "application/json" } },
      JSON.stringify({ a: 1 }),
    );
    await expect(api.get<{ a: number }>("/x")).resolves.toEqual({ a: 1 });
  });
});

describe("api.parsed.* (validated path)", () => {
  const schema = z.object({ count: z.number() });

  it("returns the parsed payload on a matching shape", async () => {
    mockFetchOnce(
      { status: 200, headers: { "Content-Type": "application/json" } },
      JSON.stringify({ count: 7 }),
    );
    await expect(api.parsed.get("/x", schema)).resolves.toEqual({ count: 7 });
  });

  it("throws ResponseValidationError when the body doesn't match", async () => {
    mockFetchOnce(
      { status: 200, headers: { "Content-Type": "application/json" } },
      JSON.stringify({ count: "seven" }),
    );

    const err = await api.parsed.get("/x", schema).catch((e) => e);
    expect(err).toBeInstanceOf(ResponseValidationError);
    expect(err.path).toBe("/x");
    expect(Array.isArray(err.issues)).toBe(true);
    expect(err.issues.length).toBeGreaterThan(0);
  });

  it("a 4xx still surfaces as ApiError, not ResponseValidationError", async () => {
    mockFetchOnce(
      { status: 400, headers: { "Content-Type": "application/json" } },
      JSON.stringify({ error: "bad" }),
    );

    const err = await api.parsed.get("/x", schema).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).not.toBeInstanceOf(ResponseValidationError);
    expect(err.message).toBe("bad");
  });

  it("204 with a schema that accepts undefined returns undefined", async () => {
    mockFetchOnce({ status: 204 }, null as unknown as string);
    const undefinedOk = z.undefined();
    await expect(api.parsed.delete("/x", undefinedOk)).resolves.toBeUndefined();
  });

  it("204 with a schema that REJECTS undefined throws ResponseValidationError", async () => {
    mockFetchOnce({ status: 204 }, null as unknown as string);
    // Schema requires an object — 204's undefined body fails.
    await expect(api.parsed.get("/x", schema)).rejects.toBeInstanceOf(ResponseValidationError);
  });
});
