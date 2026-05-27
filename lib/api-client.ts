import { CLIENT_API } from "./api-url";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
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
  const payload = await res.json().catch(() => ({} as Record<string, unknown>));
  const message =
    (payload as { error?: string }).error ??
    (payload as { message?: string }).message ??
    (payload as { detail?: string }).detail ??   // ASP.NET Core ProblemDetails
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

export const api = {
  get:    <T>(path: string) => request<T>(path, "GET"),
  post:   <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
  put:    <T>(path: string, body?: unknown) => request<T>(path, "PUT", body),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, "PATCH", body),
  delete: <T>(path: string, body?: unknown) => request<T>(path, "DELETE", body),
  upload: <T>(path: string, formData: FormData) => upload<T>(path, formData),
};
