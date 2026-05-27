"use client";
import { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { ERROR } from "@/lib/error-messages";

export function useFormSubmit<TValues, TResult>(
  fn: (values: TValues) => Promise<TResult>,
  options: { onSuccess?: (result: TResult) => void } = {},
) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function submit(values: TValues) {
    setServerError(null);
    setIsPending(true);
    try {
      const result = await fn(values);
      options.onSuccess?.(result);
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : ERROR.DEFAULT);
    } finally {
      setIsPending(false);
    }
  }

  return { submit, serverError, isPending, clearError: () => setServerError(null) };
}
