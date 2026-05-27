"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { identityKeys } from "@/lib/query-keys";
import { Btn, Alert, Icon } from "@/components/editorial";

const OTP_LENGTH = 6;

export default function TwoFactorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");

  function handleDigitChange(index: number, value: string) {
    // Only allow numeric input; take only the last character if pasted mid-field
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);

    // Auto-advance to the next cell on input
    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        // Clear current cell
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        // Move to previous cell if current is already empty
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    // Focus the cell after the last pasted digit (or last cell)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }

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
    <div className="ed-auth-card">
      <h1 className="ed-h1">Two-factor <em>code</em></h1>
      <p className="ed-hint mt-2 mb-2">Open your authenticator app and enter the six-digit code.</p>
      <p className="ed-label-muted mb-8 leading-relaxed">
        Codes refresh every 30 seconds — use the current one shown in your app.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-6" aria-label="Two-factor authentication">
        {error && <Alert variant="danger" role="alert">{error}</Alert>}

        {/* 6-cell OTP input */}
        <fieldset className="w-full min-w-0">
          <legend className="ed-label-muted mb-3">Six-digit code</legend>
          <div className="flex gap-2" role="group" aria-label="Six-digit verification code">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                aria-label={`Digit ${i + 1} of 6`}
                className="flex-1 min-w-0 text-center font-mono text-xl font-semibold bg-paper border-[1.5px] border-[color:var(--ink)] outline-none py-4 focus:border-[color:var(--red)] transition-colors"
              />
            ))}
          </div>
        </fieldset>

        <Btn
          type="submit"
          disabled={isSubmitting || code.length !== OTP_LENGTH}
          variant="primary"
          size="lg"
          fullWidth
          iconRight={<Icon name="arrowRight" size={16} />}
        >
          {isSubmitting ? "Verifying…" : "Verify"}
        </Btn>
      </form>

      <div className="mt-8 pt-6 border-t border-[color:var(--rule-soft)] text-center">
        <p className="ed-label-muted mb-2">Can&apos;t access your authenticator?</p>
        <Link href="/login/recovery" className="text-red font-semibold text-sm hover:underline">
          Use a recovery code →
        </Link>
      </div>
    </div>
  );
}
