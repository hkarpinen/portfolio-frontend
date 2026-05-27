"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { resetPassword } from "@/lib/api/identity";
import { Btn, Input, Alert, Icon } from "@/components/editorial";

const EYE = (show: boolean) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
    {show
      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
  </svg>
);

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!userId || !token) {
    return (
      <div className="ed-auth-card text-center">
        <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center mx-auto mb-8 border border-red">
          <span className="text-red"><Icon name="x" size={24} strokeWidth={2} /></span>
        </div>
        <p className="ed-kicker mb-4">Invalid link</p>
        <h1 className="ed-h1 mb-6">Something went <em>wrong.</em></h1>
        <p className="ed-deck mb-10">This reset link is missing required information.</p>
        <Btn href="/forgot-password" variant="primary">Request a new link</Btn>
      </div>
    );
  }

  if (done) {
    return (
      <div className="ed-auth-card text-center">
        <div className="w-[56px] h-[56px] bg-green-soft flex items-center justify-center mx-auto mb-8 border border-green">
          <span className="text-green"><Icon name="check" size={24} strokeWidth={2} /></span>
        </div>
        <p className="ed-kicker mb-4">Password updated</p>
        <h1 className="ed-h1 mb-6">You&apos;re all <em>set.</em></h1>
        <p className="ed-deck mb-10">Your password has been reset. You can now sign in with your new password.</p>
        <Btn href="/login" variant="primary">Sign in</Btn>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await resetPassword(userId!, token!, data.newPassword);
      setDone(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to reset password. The link may have expired.";
      if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")) {
        setServerError("This reset link has expired or is invalid. Please request a new one.");
      } else {
        setServerError(message);
      }
    }
  }

  return (
    <div className="ed-auth-card">
      <h1 className="ed-h1">New <em>password</em></h1>
      <p className="ed-hint mt-2 mb-2">Choose a strong password for your account.</p>
      <p className="ed-label-muted mb-8 leading-relaxed">
        Min 8 characters · use a mix of letters, numbers, and symbols for best security.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {serverError && (
          <Alert variant="danger" role="alert">
            {serverError}{" "}
            {serverError.includes("expired") && (
              <a href="/forgot-password" className="underline font-semibold text-ink">Request a new link</a>
            )}
          </Alert>
        )}

        <div className="relative">
          <Input
            type={showNew ? "text" : "password"}
            label="New password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <button type="button" onClick={() => setShowNew(s => !s)} aria-label={showNew ? "Hide password" : "Show password"} aria-pressed={showNew} className="absolute right-0 bottom-[7px] bg-transparent cursor-pointer text-ink-3 p-0 border-none leading-none">
            {EYE(showNew)}
          </button>
        </div>

        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            label="Confirm new password"
            placeholder="Type it again"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <button type="button" onClick={() => setShowConfirm(s => !s)} aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirm} className="absolute right-0 bottom-[7px] bg-transparent cursor-pointer text-ink-3 p-0 border-none leading-none">
            {EYE(showConfirm)}
          </button>
        </div>

        <Btn type="submit" disabled={isSubmitting} loading={isSubmitting} variant="primary" size="lg" fullWidth iconRight={<Icon name="arrowRight" size={16} />}>
          {isSubmitting ? "Updating…" : "Set new password"}
        </Btn>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="ed-auth-card flex items-center justify-center py-16">
          {/* Spinner: composite border + animation has no single Tailwind equivalent — kept inline */}
          <div className="w-[48px] h-[48px]" style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite" }} />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
