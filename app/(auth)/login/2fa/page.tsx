"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { identityKeys } from "@/lib/query-keys";
import { Btn } from "@/components/editorial";

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
    <div className="bg-paper-2 shadow-stamp p-16" style={{ border: "1.5px solid var(--ink)" }}>
      <div className="mb-[28px]">
        <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-3">
          Two-factor auth<span className="text-red">.</span>
        </h1>
        <p className="font-mono text-sm text-ink-3 uppercase tracking-wide">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        {error && (
          <div className="py-6 px-8 bg-[rgba(178,42,26,0.10)] text-base text-red" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
            Authenticator code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="h-[38px] bg-paper-2 p-[0_12px] text-xl tracking-[0.25em] text-ink outline-none text-center" style={{ border: `1px solid ${error ? "var(--danger)" : "var(--ink-3)"}`, transition: "border-color 110ms, box-shadow 110ms" }}
            onFocus={e => {
              if (!error) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--red)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
              }
            }}
            onBlur={e => {
              if (!error) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-3)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }
            }}
          />
        </div>

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
