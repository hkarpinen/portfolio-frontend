"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { registerSchema, RegisterInput } from "@/schemas/auth";
import { api, ApiError } from "@/lib/api-client";
import { Btn, Input, Alert, Icon } from "@/components/editorial";

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [len >= 8, hasUpper && hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const colors = ["var(--red)", "var(--red)", "var(--warning)", "var(--warning)", "var(--green)"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex gap-[3px]">
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: "2px", background: i < score ? colors[score] : "var(--ink-4)", transition: "background 220ms" }} />
        ))}
      </div>
      {score > 0 && (
        <span className="font-mono" style={{ fontSize: "0.594rem", letterSpacing: "0.14em", color: colors[score] }}>
          {labels[score]}
        </span>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwValue, setPwValue] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    try {
      await api.post("/api/identity/register", { email: data.email, displayName: data.displayName, password: data.password });
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="bg-paper-2 shadow-stamp py-20 px-16 text-center border-ink">
        <div className="w-[56px] h-[56px] bg-green-soft flex items-center justify-center" style={{ margin: "0 auto 20px", border: "1.5px solid var(--green)" }}>
          <span style={{ color: "var(--green)" }}><Icon name="check" size={24} strokeWidth={2} /></span>
        </div>
        <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-4">Check your inbox<span className="text-red">.</span></h1>
        <p className="text-base text-ink-3 leading-[1.6] mb-12">We&apos;ve sent a confirmation link to your email. Click it to activate your account.</p>
        <Btn href="/login" variant="secondary">Back to sign in</Btn>
      </div>
    );
  }

  return (
    <div className="bg-paper-2 shadow-stamp p-16 border-ink">
      <div className="mb-[28px]">
        <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-3">Create account<span className="text-red">.</span></h1>
        <p className="font-mono text-sm text-ink-3 uppercase tracking-wide">Join the community today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Input label="Display name" type="text" placeholder="Your name" error={errors.displayName?.message} {...register("displayName")} />
        <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />

        <div>
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              label="Password"
              placeholder="Min. 12 characters"
              error={errors.password?.message}
              {...register("password", { onChange: e => setPwValue(e.target.value) })}
            />
            <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-0 bottom-[7px] bg-transparent cursor-pointer text-ink-3 p-0" style={{ border: "none", lineHeight: 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                {showPw ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
          </div>
          <PasswordStrength password={pwValue} />
        </div>

        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            label="Confirm password"
            placeholder="Repeat password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <button type="button" onClick={() => setShowConfirm(s => !s)} aria-label={showConfirm ? "Hide password" : "Show password"} className="absolute right-0 bottom-[7px] bg-transparent cursor-pointer text-ink-3 p-0" style={{ border: "none", lineHeight: 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              {showConfirm ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
            </svg>
          </button>
        </div>

        <Btn type="submit" disabled={isSubmitting} loading={isSubmitting} variant="primary" fullWidth className="mt-2">
          {isSubmitting ? "Creating account…" : "Create account"}
        </Btn>
      </form>

      <p className="text-center text-base text-ink-3 mt-12">
        Already have an account?{" "}
        <Link href="/login" className="text-ink font-semibold underline">Sign in</Link>
      </p>
    </div>
  );
}
