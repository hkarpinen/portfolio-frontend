"use client";

import { Alert, Btn, Icon, Input } from "@/components/editorial";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import type { RegisterInput } from "@/schemas/auth";
import { registerSchema } from "@/schemas/auth";
import { useRegister } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";

import { RecaptchaScript, useRecaptcha } from "@/components/recaptcha";

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [len >= 8, hasUpper && hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <>
      <div className="pw-strength">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < score ? "on" : undefined} />
        ))}
      </div>
      {score > 0 && (
        <div className="ed-label-muted mt-1.5">
          // {labels[score]} · {len} chars{hasNumber ? " · 1 number" : ""}
        </div>
      )}
    </>
  );
}

export default function RegisterPage() {
  const executeRecaptcha = useRecaptcha();
  const registerMutation = useRegister();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwValue, setPwValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  // The captcha token has to be fetched at submit time (it expires), so the
  // submit handler stays async — but every transient flag (pending, error,
  // success) comes from the mutation. The "Check your email" screen below
  // keys off `registerMutation.isSuccess` directly.
  async function onSubmit(data: RegisterInput) {
    const captchaToken = await executeRecaptcha("register");
    registerMutation.mutate({
      email: data.email,
      displayName: data.displayName,
      password: data.password,
      captchaToken,
    });
  }

  if (registerMutation.isSuccess) {
    return (
      <div>
        <p className="ed-kicker mb-2.5">// AUTH</p>
        <h1 className="ed-h1">Check your email</h1>
        <p className="ed-deck mb-8 mt-3">
          We&apos;ve sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Btn href="/identity/login" variant="secondary" size="lg">
          Back to sign in
        </Btn>
      </div>
    );
  }

  return (
    <>
      <div>
        <p className="ed-kicker mb-2.5">// AUTH</p>
        <h1 className="ed-h1">Create account</h1>
        <p className="ed-hint mb-8 mt-2">
          Already have one?{" "}
          <Link href="/identity/login" className="font-semibold text-amber">
            $ login{" "}
            <Icon name="arrowRight" size={13} strokeWidth={2} className="inline align-[-2px]" />
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {registerMutation.isError && (
            <Alert variant="danger">
              {getErrorMessage(registerMutation.error, "Registration failed. Please try again.")}
            </Alert>
          )}

          <Input
            label="Display name"
            type="text"
            placeholder="What should we call you?"
            autoComplete="name"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                label="Password"
                placeholder="At least 10 characters"
                autoComplete="new-password"
                aria-describedby="pw-requirements"
                error={errors.password?.message}
                {...register("password", { onChange: (e) => setPwValue(e.target.value) })}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                className="absolute bottom-3.5 right-0 cursor-pointer border-none bg-transparent p-0 leading-none text-ink-3"
              >
                <Icon name={showPw ? "eyeOff" : "eye"} size={14} strokeWidth={1.75} />
              </button>
            </div>
            <p id="pw-requirements" className="ed-label-muted mt-2 leading-relaxed">
              Min 10 characters · mix of upper &amp; lowercase, numbers, and symbols recommended.
            </p>
            <PasswordStrength password={pwValue} />
          </div>

          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              label="Confirm password"
              placeholder="Type it again"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              aria-pressed={showConfirm}
              className="absolute bottom-3.5 right-0 cursor-pointer border-none bg-transparent p-0 leading-none text-ink-3"
            >
              <Icon name={showConfirm ? "eyeOff" : "eye"} size={14} strokeWidth={1.75} />
            </button>
          </div>

          <p className="ed-label-muted leading-relaxed">
            Protected by reCAPTCHA · by signing up you agree to the{" "}
            <a href="/terms" className="underline hover:text-amber">
              terms of service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-amber">
              privacy policy
            </a>
            .
          </p>

          <Btn
            type="submit"
            disabled={registerMutation.isPending}
            loading={registerMutation.isPending}
            variant="primary"
            size="lg"
            fullWidth
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            {registerMutation.isPending ? "Creating account…" : "$ create-account"}
          </Btn>
        </form>

        <div className="mt-8 border border-border p-4">
          <p className="ed-hint">
            Just want to look around?{" "}
            <Link href="/demo" className="font-semibold text-amber">
              $ try-demo{" "}
              <Icon name="arrowRight" size={13} strokeWidth={2} className="inline align-[-2px]" />
            </Link>
          </p>
        </div>
      </div>
      <RecaptchaScript />
    </>
  );
}
