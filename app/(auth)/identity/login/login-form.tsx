"use client";

import { Alert, Btn, Icon, Input } from "@/components/editorial";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { useLogin } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";
import { resendConfirmationEmail } from "@/lib/api/identity";

interface LoginFormProps {
  from: string;
}

export function LoginForm({ from }: LoginFormProps) {
  const router = useRouter();
  const login = useLogin();
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginInput) {
    setUnconfirmedEmail(null);
    setResendState("idle");
    login.mutate(data, {
      onSuccess: () => {
        router.push(from);
        router.refresh();
      },
      onError: (err) => {
        // "Email not confirmed" is a UX branch (offer to resend), not a generic
        // error — switch into the resend flow when we see the canonical message.
        if (getErrorMessage(err) === "Email not confirmed.") {
          setUnconfirmedEmail(data.email);
        }
      },
    });
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
    <div>
      <p className="ed-kicker mb-2.5">// AUTH</p>
      <h1 className="ed-h1">Sign in</h1>
      <p className="ed-hint mb-6 mt-2">
        New here?{" "}
        <Link href="/identity/register" className="font-semibold text-amber">
          $ register{" "}
          <Icon name="arrowRight" size={13} strokeWidth={2} className="inline align-[-2px]" />
        </Link>
      </p>
      <p className="ed-label-muted mb-8 leading-relaxed">
        Access your household dashboard, forum, and finance tools — all in one place.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {login.isError && !unconfirmedEmail && (
          <Alert variant="danger">
            {getErrorMessage(login.error, "Invalid email or password.")}
          </Alert>
        )}
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
                  className="cursor-pointer border-none bg-transparent p-0 font-semibold text-ink underline"
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

        <div className="flex flex-col gap-3">
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
              className="absolute bottom-3.5 right-0 cursor-pointer border-none bg-transparent p-0 leading-none text-ink-3"
            >
              <Icon name={showPw ? "eyeOff" : "eye"} size={14} strokeWidth={1.75} />
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between gap-4">
            <label
              htmlFor="remember-me"
              className="flex cursor-pointer select-none items-center gap-2"
            >
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-[color:var(--amber)]"
              />
              <span className="ed-label-muted">Remember me</span>
            </label>
            <Link href="/identity/forgot-password" className="ed-label-muted hover:text-amber">
              Forgot password?
            </Link>
          </div>
        </div>

        <Btn
          type="submit"
          disabled={login.isPending}
          loading={login.isPending}
          variant="primary"
          size="lg"
          fullWidth
          className="mt-2"
          iconRight={<Icon name="arrowRight" size={16} />}
        >
          {login.isPending ? "Signing in…" : "$ sign-in"}
        </Btn>
      </form>

      <div className="mt-8 border border-border p-4">
        <p className="ed-hint">
          Skip signup?{" "}
          <Link href="/demo" className="font-semibold text-amber">
            $ try-demo{" "}
            <Icon name="arrowRight" size={13} strokeWidth={2} className="inline align-[-2px]" />
          </Link>{" "}
          — no account required, three seconds in.
        </p>
      </div>
    </div>
  );
}
