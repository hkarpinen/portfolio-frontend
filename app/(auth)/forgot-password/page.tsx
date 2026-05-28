"use client";

import { Alert, Btn, Icon, Input } from "@/components/editorial";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPassword } from "@/lib/api/identity";

import { ERROR } from "@/lib/error-messages";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await forgotPassword(data.email);
      setSubmitted(true);
    } catch {
      setServerError(ERROR.DEFAULT);
    }
  }

  if (submitted) {
    return (
      <div className="ed-auth-card">
        <h1 className="ed-h1">
          Check your <em>inbox</em>
        </h1>
        <p className="ed-deck mb-8 mt-3">
          If that email is registered, we&apos;ve sent a password reset link. Check your inbox and
          follow the instructions.
        </p>
        <Btn href="/login" variant="secondary" size="lg">
          Back to sign in
        </Btn>
      </div>
    );
  }

  return (
    <div className="ed-auth-card">
      <h1 className="ed-h1">
        Forgot <em>password?</em>
      </h1>
      <p className="ed-hint mb-2 mt-2">Enter your email and we&apos;ll send a reset link.</p>
      <p className="ed-label-muted mb-8 leading-relaxed">
        For your privacy, we won&apos;t confirm whether the address is registered. Check your inbox
        — the link is valid for 24 hours.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Input
          type="email"
          label="Email address"
          placeholder="you@email.com"
          autoComplete="email"
          aria-describedby="forgot-pw-hint"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-wrap gap-3">
          <Btn
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Btn>
          <Btn href="/login" variant="secondary" size="lg">
            Back to sign in
          </Btn>
        </div>
      </form>
    </div>
  );
}
