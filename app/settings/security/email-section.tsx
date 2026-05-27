"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "@/lib/api-client";
import { Btn, Input, Alert } from "@/components/editorial";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function EmailSection() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });

  useEffect(() => {
    api.get<{ email?: string }>("/api/identity/me")
      .then((data) => {
        const email = data.email ?? "";
        setCurrentEmail(email);
        reset({ email });
      })
      .catch(() => {});
  }, [reset]);

  const onSubmit = async (data: EmailFormData) => {
    setError(null);
    setSaved(false);
    try {
      // TODO(handoff8): wire to /api/identity/email once backend exposes an email-update endpoint
      await api.put("/api/identity/me", { email: data.email });
      setCurrentEmail(data.email);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update email. Please try again.");
    }
  };

  return (
    <section aria-labelledby="email-section-heading" className="bg-paper-2 p-5 border-ink">
      <h2 id="email-section-heading" className="ed-label-muted mb-1">Email</h2>
      <p className="text-base text-ink-2 mb-6">
        Used for sign-in and account recovery. A confirmation email will be sent to verify the new address.
      </p>
      <div aria-live="polite" aria-atomic="true">
        {error && <div className="mb-4"><Alert variant="danger">{error}</Alert></div>}
        {saved && <div className="mb-4"><Alert variant="success">Email updated successfully!</Alert></div>}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Input
          label="Email address"
          type="email"
          {...register("email")}
          placeholder={currentEmail || "your@email.com"}
          error={errors.email?.message}
        />
        <div>
          <Btn variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating…" : "Update email"}
          </Btn>
        </div>
      </form>
    </section>
  );
}
