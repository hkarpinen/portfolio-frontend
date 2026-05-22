"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { forgotPassword } from "@/lib/api/identity";
import { Btn, Input, Alert, Icon } from "@/components/editorial";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await forgotPassword(data.email);
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="bg-paper-2 shadow-stamp py-20 px-16 text-center border-ink">
        <div className="w-[56px] h-[56px] bg-green-soft flex items-center justify-center" style={{ margin: "0 auto 20px", border: "1.5px solid var(--green)" }}>
          <span style={{ color: "var(--green)" }}><Icon name="check" size={24} strokeWidth={2} /></span>
        </div>
        <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-4">Check your inbox<span className="text-red">.</span></h1>
        <p className="text-base text-ink-3 leading-[1.6] mb-12">
          If that email is registered, we&apos;ve sent a password reset link. Check your inbox and follow the instructions.
        </p>
        <Btn href="/login" variant="secondary">Back to sign in</Btn>
      </div>
    );
  }

  return (
    <div className="bg-paper-2 shadow-stamp p-16 border-ink">
      <div className="mb-[28px]">
        <h1 className="font-serif italic font-normal text-3xl tracking-[-0.025em] text-ink mb-3">
          Forgot password<span className="text-red">?</span>
        </h1>
        <p className="font-mono text-sm text-ink-3 uppercase tracking-wide">
          We&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Input
          type="email"
          label="Email address"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Btn type="submit" disabled={isSubmitting} loading={isSubmitting} variant="primary" fullWidth className="mt-2">
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Btn>
      </form>

      <p className="text-center text-base text-ink-3 mt-12">
        <Link href="/login" className="text-ink font-semibold underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
