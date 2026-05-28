import type { z, ZodTypeAny } from "zod";
import { CLIENT_API } from "./api-url";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Thrown when a 2xx response body fails its zod schema. This is the runtime
 * shape of the bug the audit's §1.2 warned about: backend renames a field,
 * frontend keeps casting `as T`, and the lie surfaces later as
 * `undefined.foo`. With a schema in the loop, the lie surfaces *here* — at
 * the network boundary — with the offending path and the raw payload
 * console-logged in development.
 *
 * Kept distinct from ApiError so `getErrorMessage` and React Query
 * consumers can branch on it if they care (e.g. surface a "this app needs
 * to be updated" toast rather than the generic fallback).
 */
export class ResponseValidationError extends Error {
  constructor(
    public readonly path: string,
    public readonly issues: z.ZodIssue[],
  ) {
    super(`Response from ${path} did not match the expected shape`);
    this.name = "ResponseValidationError";
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Single source of truth for translating a backend HTTP error into an
 * {@link ApiError}. Centralising this avoids subtle behaviour drift between
 * the JSON and multipart upload helpers.
 *
 * Note: a 401 is intentionally surfaced as a regular {@link ApiError}. We do
 * NOT redirect to /login here. Routing is enforced by `middleware.ts`; doing
 * a hard `window.location` here would (a) break public pages that
 * legitimately call authenticated endpoints (e.g. `useMe()` on a public
 * profile) and (b) hide the real error from React Query's cache/error UI.
 */
async function toApiError(res: Response): Promise<ApiError> {
  const payload = await res.json().catch(() => ({}) as Record<string, unknown>);
  const message =
    (payload as { error?: string }).error ??
    (payload as { message?: string }).message ??
    (payload as { detail?: string }).detail ?? // ASP.NET Core ProblemDetails
    `Request failed (${res.status})`;
  return new ApiError(res.status, message);
}

async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function request<T>(path: string, method: Method, body?: unknown): Promise<T> {
  const res = await fetch(`${CLIENT_API}${path}`, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw await toApiError(res);
  return parseBody<T>(res);
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${CLIENT_API}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) throw await toApiError(res);
  return parseBody<T>(res);
}

// ─── Validated variants (zod) ─────────────────────────────────────────────────
//
// Use `api.parsed.<verb>` when you have a schema for the response shape. The
// generic `api.<verb><T>` casts blindly; `api.parsed.<verb>(path, schema)`
// returns `z.infer<typeof schema>` and throws ResponseValidationError on
// contract drift. Both coexist so the migration can land endpoint-by-endpoint.

async function parseValidated<S extends ZodTypeAny>(
  res: Response,
  schema: S,
  path: string,
): Promise<z.infer<S>> {
  // 204 has no body; let the schema's own undefined-handling decide.
  if (res.status === 204) {
    const result = schema.safeParse(undefined);
    if (!result.success) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`[api] Empty body did not match schema for ${path}`, result.error.issues);
      }
      throw new ResponseValidationError(path, result.error.issues);
    }
    return result.data;
  }
  const text = await res.text();
  const raw = text ? JSON.parse(text) : undefined;
  const result = schema.safeParse(raw);
  if (!result.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[api] Response validation failed for ${path}`, result.error.issues, raw);
    }
    throw new ResponseValidationError(path, result.error.issues);
  }
  return result.data;
}

async function parsedRequest<S extends ZodTypeAny>(
  path: string,
  method: Method,
  schema: S,
  body?: unknown,
): Promise<z.infer<S>> {
  const res = await fetch(`${CLIENT_API}${path}`, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await toApiError(res);
  return parseValidated(res, schema, path);
}

async function parsedUpload<S extends ZodTypeAny>(
  path: string,
  schema: S,
  formData: FormData,
): Promise<z.infer<S>> {
  const res = await fetch(`${CLIENT_API}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw await toApiError(res);
  return parseValidated(res, schema, path);
}

export const api = {
  get: <T>(path: string) => request<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
  put: <T>(path: string, body?: unknown) => request<T>(path, "PUT", body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, "PATCH", body),
  delete: <T>(path: string, body?: unknown) => request<T>(path, "DELETE", body),
  upload: <T>(path: string, formData: FormData) => upload<T>(path, formData),
  parsed: {
    get: <S extends ZodTypeAny>(path: string, schema: S) => parsedRequest(path, "GET", schema),
    post: <S extends ZodTypeAny>(path: string, schema: S, body?: unknown) =>
      parsedRequest(path, "POST", schema, body),
    put: <S extends ZodTypeAny>(path: string, schema: S, body?: unknown) =>
      parsedRequest(path, "PUT", schema, body),
    patch: <S extends ZodTypeAny>(path: string, schema: S, body?: unknown) =>
      parsedRequest(path, "PATCH", schema, body),
    delete: <S extends ZodTypeAny>(path: string, schema: S, body?: unknown) =>
      parsedRequest(path, "DELETE", schema, body),
    upload: <S extends ZodTypeAny>(path: string, schema: S, formData: FormData) =>
      parsedUpload(path, schema, formData),
  },
};
