"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { resetPassword } from "@/lib/api/identity";
import { Btn, Input, Alert, Icon } from "@/components/editorial";

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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!userId || !token) {
    return (
      <div className="bg-paper-2 shadow-stamp py-20 px-16 text-center border-ink">
        <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center" style={{ margin: "0 auto 20px", border: "1.5px solid var(--red)" }}>
          <span style={{ color: "var(--red)" }}><Icon name="x" size={24} strokeWidth={2} /></span>
        </div>
        <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-4">Invalid link<span className="text-red">.</span></h1>
        <p className="text-base text-ink-3 leading-[1.6] mb-[28px]">This reset link is missing required information.</p>
        <Btn href="/forgot-password" variant="primary">Request a new link</Btn>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-paper-2 shadow-stamp py-20 px-16 text-center border-ink">
        <div className="w-[56px] h-[56px] bg-green-soft flex items-center justify-center" style={{ margin: "0 auto 20px", border: "1.5px solid var(--green)" }}>
          <span style={{ color: "var(--green)" }}><Icon name="check" size={24} strokeWidth={2} /></span>
        </div>
        <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-4">Password updated<span className="text-red">.</span></h1>
        <p className="text-base text-ink-3 leading-[1.6] mb-[28px]">Your password has been reset. You can now sign in with your new password.</p>
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
    <div className="bg-paper-2 shadow-stamp p-16 border-ink">
      <div className="mb-[28px]">
        <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-3">
          Reset password<span className="text-red">.</span>
        </h1>
        <p className="font-mono text-sm text-ink-3 uppercase tracking-wide">
          Choose a new password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {serverError && (
          <Alert variant="danger">
            {serverError}{" "}
            {serverError.includes("expired") && (
              <a href="/forgot-password" className="underline font-semibold text-ink">Request a new link</a>
            )}
          </Alert>
        )}

        <Input
          type="password"
          label="New password"
          placeholder="Min. 8 characters"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <Input
          type="password"
          label="Confirm new password"
          placeholder="Repeat password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Btn type="submit" disabled={isSubmitting} loading={isSubmitting} variant="primary" fullWidth className="mt-2">
          {isSubmitting ? "Updating…" : "Update password"}
        </Btn>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-paper-2 py-20 px-16 shadow-stamp text-center border-ink">
          <div className="w-[48px] h-[48px] mx-auto" style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite" }} />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
