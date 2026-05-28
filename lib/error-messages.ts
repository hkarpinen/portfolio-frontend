// lib/error-messages.ts
import { ApiError } from "./api-client";

export const ERROR = {
  DEFAULT: "Something went wrong. Please try again.",
  NETWORK: "Couldn't reach the server. Check your connection.",
  VALIDATION: "Some fields need attention.",
} as const;

/**
 * Narrow an unknown caught value to a user-facing string. Use this in every
 * `catch (err)` block — the prior pattern of
 *
 *     err instanceof ApiError ? err.message : "fallback"
 *
 * silently dropped the message for any non-ApiError throw (TypeError,
 * AbortError, a raw string thrown by a library, etc.). React Query's
 * `error` field is `unknown`, so the same helper covers both `try/catch`
 * and `useMutation` consumers.
 */
export function getErrorMessage(err: unknown, fallback: string = ERROR.DEFAULT): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}
