"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { identityKeys } from "@/lib/query-keys";
import { Btn, Alert, Input } from "@/components/editorial";

export default function TwoFactorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post("/api/identity/2fa/verify", { code });
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
      router.push("/forum");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-paper-2 shadow-stamp p-16 border-ink">
      <div className="mb-[28px]">
        <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-3">
          Two-factor auth<span className="text-red">.</span>
        </h1>
        <p className="font-mono text-sm text-ink-3 uppercase tracking-wide">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        {error && <Alert variant="danger">{error}</Alert>}

        <Input
          label="Authenticator code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          error={error ?? undefined}
          className="text-center tracking-[0.25em] text-xl"
        />

        <Btn
          type="submit"
          disabled={isSubmitting || code.length !== 6}
          variant="primary"
          fullWidth
          className="mt-2 h-[42px]"
        >
          {isSubmitting ? "Verifying…" : "Verify"}
        </Btn>
      </form>
    </div>
  );
}
