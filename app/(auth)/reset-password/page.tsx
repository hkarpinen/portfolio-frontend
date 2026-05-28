"use client";

import { Alert, Btn, Icon, Input } from "@/components/editorial";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/lib/error-messages";
import { useResetPassword } from "@/hooks/use-identity";

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

  const resetMutation = useResetPassword();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Backend can return any of {"link expired", "invalid token", …}. Coalesce
  // those into one expired-link UX so the form can offer "Request a new link".
  const rawErrorMessage = resetMutation.isError
    ? getErrorMessage(resetMutation.error, "Failed to reset password. The link may have expired.")
    : null;
  const isExpiredLink =
    rawErrorMessage !== null &&
    (rawErrorMessage.toLowerCase().includes("expired") ||
      rawErrorMessage.toLowerCase().includes("invalid"));
  const displayError = isExpiredLink
    ? "This reset link has expired or is invalid. Please request a new one."
    : rawErrorMessage;

  if (!userId || !token) {
    return (
      <div className="ed-auth-card text-center">
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center border border-red bg-red-soft">
          <span className="text-red">
            <Icon name="x" size={24} strokeWidth={2} />
          </span>
        </div>
        <p className="ed-kicker mb-4">Invalid link</p>
        <h1 className="ed-h1 mb-6">
          Something went <em>wrong.</em>
        </h1>
        <p className="ed-deck mb-10">This reset link is missing required information.</p>
        <Btn href="/forgot-password" variant="primary">
          Request a new link
        </Btn>
      </div>
    );
  }

  if (resetMutation.isSuccess) {
    return (
      <div className="ed-auth-card text-center">
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center border border-green bg-green-soft">
          <span className="text-green">
            <Icon name="check" size={24} strokeWidth={2} />
          </span>
        </div>
        <p className="ed-kicker mb-4">Password updated</p>
        <h1 className="ed-h1 mb-6">
          You&apos;re all <em>set.</em>
        </h1>
        <p className="ed-deck mb-10">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Btn href="/login" variant="primary">
          Sign in
        </Btn>
      </div>
    );
  }

  function onSubmit(data: FormData) {
    resetMutation.mutate({ userId: userId!, token: token!, newPassword: data.newPassword });
  }

  return (
    <div className="ed-auth-card">
      <h1 className="ed-h1">
        New <em>password</em>
      </h1>
      <p className="ed-hint mb-2 mt-2">Choose a strong password for your account.</p>
      <p className="ed-label-muted mb-8 leading-relaxed">
        Min 8 characters · use a mix of letters, numbers, and symbols for best security.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {displayError && (
          <Alert variant="danger" role="alert">
            {displayError}{" "}
            {isExpiredLink && (
              <a href="/forgot-password" className="font-semibold text-ink underline">
                Request a new link
              </a>
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
          <button
            type="button"
            onClick={() => setShowNew((s) => !s)}
            aria-label={showNew ? "Hide password" : "Show password"}
            aria-pressed={showNew}
            className="absolute bottom-3.5 right-0 cursor-pointer border-none bg-transparent p-0 leading-none text-ink-3"
          >
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
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            aria-pressed={showConfirm}
            className="absolute bottom-3.5 right-0 cursor-pointer border-none bg-transparent p-0 leading-none text-ink-3"
          >
            {EYE(showConfirm)}
          </button>
        </div>

        <Btn
          type="submit"
          disabled={resetMutation.isPending}
          loading={resetMutation.isPending}
          variant="primary"
          size="lg"
          fullWidth
          iconRight={<Icon name="arrowRight" size={16} />}
        >
          {resetMutation.isPending ? "Updating…" : "Set new password"}
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
          <div
            className="h-24 w-24"
            style={{
              border: "2px solid var(--ink-4)",
              borderTopColor: "var(--ink)",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
