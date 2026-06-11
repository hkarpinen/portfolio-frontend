"use client";

import { Alert, Btn, GithubMark, GoogleG, Icon, Input } from "@/components/editorial";
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
        <Btn href="/identity/login" variant="secondary" size="lg">
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
          <Link href="/identity/login" className="font-semibold text-red">
            Sign in{" "}
            <Icon name="arrowRight" size={13} strokeWidth={2} className="inline align-[-2px]" />
          </Link>
        </p>

        {/* OAuth */}
        <div className="mb-8 grid grid-cols-1 gap-3">
          <Btn
            variant="secondary"
            fullWidth
            iconLeft={<GithubMark />}
            onClick={() => {
              window.location.href = "/api/identity/oauth/github";
            }}
          >
            Continue with GitHub
          </Btn>
          <Btn
            variant="secondary"
            fullWidth
            iconLeft={<GoogleG />}
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
              Try the demo{" "}
              <Icon name="arrowRight" size={13} strokeWidth={2} className="inline align-[-2px]" />
            </Link>
          </p>
        </div>
      </div>
      <RecaptchaScript />
    </>
  );
}
