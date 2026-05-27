"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { api, ApiError } from "@/lib/api-client";
import { resendConfirmationEmail } from "@/lib/api/identity";
import { Btn, Input, Alert } from "@/components/editorial";
import { Icon } from "@/components/editorial/icon";
import { identityKeys } from "@/lib/query-keys";

interface LoginFormProps {
  from: string;
}

export function LoginForm({ from }: LoginFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    setUnconfirmedEmail(null);
    setResendState("idle");
    try {
      await api.post("/api/identity/login", data);
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
      router.push(from);
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Invalid email or password.";
      if (message === "Email not confirmed.") {
        setUnconfirmedEmail(data.email);
      } else {
        setServerError(message);
      }
    }
  }

  async function handleResend() {
    if (!unconfirmedEmail || resendState !== "idle") return;
    setResendState("sending");
    try {
      await resendConfirmationEmail(unconfirmedEmail);
    } finally {
      setResendState("sent");
    }
  }

  return (
    <div className="ed-auth-card">
      <h1 className="ed-h1">Sign <em>in</em></h1>
      <p className="ed-hint mt-2 mb-6">
        New here?{" "}
        <Link href="/register" className="text-red font-semibold">Create an account →</Link>
      </p>
      <p className="ed-label-muted mb-8 leading-relaxed">
        Access your household dashboard, forum, and finance tools — all in one place.
      </p>

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Btn
          variant="secondary"
          fullWidth
          onClick={() => { window.location.href = "/api/identity/oauth/github"; }}
          iconLeft={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          }
        >
          GitHub
        </Btn>
        <Btn
          variant="secondary"
          fullWidth
          onClick={() => { window.location.href = "/api/identity/oauth/google"; }}
          iconLeft={
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          }
        >
          Google
        </Btn>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="flex-1 h-px bg-ink-4" />
        <span className="font-mono text-xs text-ink-3 uppercase tracking-[0.2em]">or with email</span>
        <div className="flex-1 h-px bg-ink-4" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {serverError && <Alert variant="danger">{serverError}</Alert>}
        {unconfirmedEmail && (
          <Alert variant="warning" title="Email not confirmed">
            {resendState === "sent" ? (
              "Confirmation email sent — check your inbox."
            ) : (
              <>
                Please confirm your email before signing in.{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendState === "sending"}
                  className="underline font-semibold text-ink cursor-pointer bg-transparent border-none p-0"
                >
                  {resendState === "sending" ? "Sending…" : "Resend confirmation email"}
                </button>
              </>
            )}
          </Alert>
        )}

        <Input
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-[6px]">
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-0 bottom-[7px] bg-transparent cursor-pointer text-ink-3 p-0 border-none leading-none"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                {showPw
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                }
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 mt-1">
            <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[color:var(--ink)] cursor-pointer"
              />
              <span className="ed-label-muted">Remember me</span>
            </label>
            <Link href="/forgot-password" className="ed-label-muted hover:text-red">Forgot password?</Link>
          </div>
        </div>

        <Btn
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          variant="primary"
          size="lg"
          fullWidth
          className="mt-2"
          iconRight={<Icon name="arrowRight" size={16} />}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Btn>
      </form>

      <div className="mt-8 p-4 border-[1.5px] border-[color:var(--rule-soft)]">
        <p className="ed-hint">
          Skip signup?{" "}
          <Link href="/demo" className="text-red font-semibold">Try the demo →</Link>{" "}
          — no account required, three seconds in.
        </p>
      </div>
    </div>
  );
}
