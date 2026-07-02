"use client";

import { Alert, Btn, Icon } from "@/components/editorial";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVerify2FA } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";

const OTP_LENGTH = 6;

export default function TwoFactorPage() {
  const router = useRouter();
  const verify = useVerify2FA();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    verify.mutate(code, {
      onSuccess: () => {
        router.push("/forum");
        router.refresh();
      },
    });
  }

  return (
    <div>
      <p className="ed-kicker mb-2.5">// AUTH · 2FA</p>
      <h1 className="ed-h1">Two-factor code</h1>
      <p className="ed-hint mb-2 mt-2">Open your authenticator app and enter the six-digit code.</p>
      <p className="ed-label-muted mb-8 leading-relaxed">
        Codes refresh every 30 seconds — use the current one shown in your app.
      </p>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-6"
        aria-label="Two-factor authentication"
      >
        {verify.isError && (
          <Alert variant="danger" role="alert">
            {getErrorMessage(verify.error, "Invalid code. Please try again.")}
          </Alert>
        )}

        {/* 6-cell OTP input */}
        <fieldset className="w-full min-w-0">
          <legend className="ed-label-muted mb-3">Six-digit code</legend>
          <div className="flex gap-2" role="group" aria-label="Six-digit verification code">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                aria-label={`Digit ${i + 1} of 6`}
                className="min-w-0 flex-1 border border-border bg-paper py-4 text-center font-mono text-xl font-semibold outline-none transition-colors focus:border-[color:var(--amber)]"
              />
            ))}
          </div>
        </fieldset>

        <Btn
          type="submit"
          disabled={verify.isPending || code.length !== OTP_LENGTH}
          variant="primary"
          size="lg"
          fullWidth
          iconRight={<Icon name="arrowRight" size={16} />}
        >
          {verify.isPending ? "Verifying…" : "Verify"}
        </Btn>
      </form>

      <div className="mt-8 border-t border-border pt-6 text-center">
        <p className="ed-label-muted mb-2">Can&apos;t access your authenticator?</p>
        <Link href="/identity/login/recovery" className="text-sm font-semibold text-amber hover:underline">
          Use a recovery code{" "}
          <Icon name="arrowRight" size={13} strokeWidth={2} className="inline align-[-2px]" />
        </Link>
      </div>
    </div>
  );
}
