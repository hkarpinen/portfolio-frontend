import { CLIENT_API } from "./api-url";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function handleUnauthorized() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

async function request<T>(path: string, method: Method, body?: unknown): Promise<T> {
  const res = await fetch(`${CLIENT_API}${path}`, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, "Session expired. Redirecting to login...");
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.error ?? payload?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${CLIENT_API}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, "Session expired. Redirecting to login...");
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.error ?? payload?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get:    <T>(path: string) => request<T>(path, "GET"),
  post:   <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
  put:    <T>(path: string, body?: unknown) => request<T>(path, "PUT", body),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, "PATCH", body),
  delete: <T>(path: string) => request<T>(path, "DELETE"),
  upload: <T>(path: string, formData: FormData) => upload<T>(path, formData),
};
