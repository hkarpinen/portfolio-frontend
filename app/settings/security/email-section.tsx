"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMe, useUpdateMe } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";
import { Btn, Input, Alert } from "@/components/editorial";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function EmailSection() {
  const { data: me } = useMe();
  const updateMe = useUpdateMe();
  const currentEmail = me?.email ?? "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });

  // Seed the form once the identity query resolves.
  useEffect(() => {
    if (me?.email) reset({ email: me.email });
  }, [me?.email, reset]);

  const onSubmit = (data: EmailFormData) => {
    // TODO(handoff8): wire to /api/identity/email once backend exposes an email-update endpoint
    updateMe.mutate({ email: data.email });
  };

  return (
    <section aria-labelledby="email-section-heading" className="border-ink bg-paper-2 p-5">
      <h2 id="email-section-heading" className="ed-label-muted mb-1">
        Email
      </h2>
      <p className="mb-6 text-base text-ink-2">
        Used for sign-in and account recovery. A confirmation email will be sent to verify the new
        address.
      </p>
      <div aria-live="polite" aria-atomic="true">
        {updateMe.isError && (
          <div className="mb-4">
            <Alert variant="danger">
              {getErrorMessage(updateMe.error, "Failed to update email. Please try again.")}
            </Alert>
          </div>
        )}
        {updateMe.isSuccess && (
          <div className="mb-4">
            <Alert variant="success">Email updated successfully!</Alert>
          </div>
        )}
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
          <Btn variant="primary" type="submit" disabled={updateMe.isPending}>
            {updateMe.isPending ? "Updating…" : "Update email"}
          </Btn>
        </div>
      </form>
    </section>
  );
}
