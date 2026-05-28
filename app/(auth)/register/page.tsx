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
  // Dynamic runtime values — colors and score are computed at runtime from
  // the password string; no static class can encode this, so style={{}} is kept here.
  const colors = ["var(--red)", "var(--red)", "var(--warning)", "var(--warning)", "var(--green)"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "2px",
              background: i < score ? colors[score] : "var(--ink-4)",
              transition: "background 220ms",
            }}
          />
        ))}
      </div>
      {score > 0 && (
        <span className="ed-label-muted" style={{ color: colors[score] }}>
          {labels[score]}
        </span>
      )}
    </div>
  );
}

const GITHUB_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const GOOGLE_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const EYE = (show: boolean) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

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
      <div className="ed-auth-card">
        <h1 className="ed-h1">
          Check your <em>email</em>
        </h1>
        <p className="ed-deck mb-8 mt-3">
          We&apos;ve sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Btn href="/login" variant="secondary" size="lg">
          Back to sign in
        </Btn>
      </div>
    );
  }

  return (
    <>
      <div className="ed-auth-card">
        <h1 className="ed-h1">
          Create an <em>account</em>
        </h1>
        <p className="ed-hint mb-8 mt-2">
          Already have one?{" "}
          <Link href="/login" className="font-semibold text-red">
            Sign in →
          </Link>
        </p>

        {/* OAuth */}
        <div className="mb-8 grid grid-cols-1 gap-3">
          <Btn
            variant="secondary"
            fullWidth
            iconLeft={GITHUB_SVG}
            onClick={() => {
              window.location.href = "/api/identity/oauth/github";
            }}
          >
            Continue with GitHub
          </Btn>
          <Btn
            variant="secondary"
            fullWidth
            iconLeft={GOOGLE_SVG}
            onClick={() => {
              window.location.href = "/api/identity/oauth/google";
            }}
          >
            Continue with Google
          </Btn>
        </div>

        <div className="mb-8 flex items-center gap-6">
          <div className="h-px flex-1 bg-ink-4" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-3">
            or with email
          </span>
          <div className="h-px flex-1 bg-ink-4" />
        </div>

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
                {EYE(showPw)}
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
              {EYE(showConfirm)}
            </button>
          </div>

          <p className="ed-label-muted leading-relaxed">
            Protected by reCAPTCHA · by signing up you agree to the{" "}
            <a href="/terms" className="underline hover:text-red">
              terms of service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-red">
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
            {registerMutation.isPending ? "Creating account…" : "Create account"}
          </Btn>
        </form>

        <div className="mt-8 border-[1.5px] border-[color:var(--rule-soft)] p-4">
          <p className="ed-hint">
            Just want to look around?{" "}
            <Link href="/demo" className="font-semibold text-red">
              Try the demo →
            </Link>
          </p>
        </div>
      </div>
      <RecaptchaScript />
    </>
  );
}
