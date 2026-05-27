"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api-client";
import { useFormSubmit } from "@/hooks/use-form-submit";
import { Btn, Input, Alert, Collapsible } from "@/components/editorial";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordSection() {
  const [passwordSaved, setPasswordSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const { submit, serverError, clearError } = useFormSubmit(
    async (data: PasswordFormData) => {
      await api.put("/api/identity/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    {
      onSuccess: () => {
        reset();
        setPasswordSaved(true);
      },
    },
  );

  const onPasswordSubmit = (data: PasswordFormData) => {
    setPasswordSaved(false);
    submit(data);
  };

  return (
    <Collapsible
      title="Password"
      description="Change your account password"
      onOpenChange={(open) => { if (!open) { setPasswordSaved(false); clearError(); } }}
    >
      <form
        onSubmit={handleSubmit(onPasswordSubmit)}
        className="flex flex-col gap-[14px] mt-10 pt-10 border-ink-t"
      >
        {serverError && <Alert variant="danger">{serverError}</Alert>}
        {passwordSaved && <Alert variant="success">Password updated successfully!</Alert>}
        <div>
          <label className="ed-label block mb-[6px]">Current Password</label>
          <Input type="password" {...register("currentPassword")} placeholder="••••••••" />
          {errors.currentPassword && (
            <p className="text-red text-base mt-2">{errors.currentPassword.message}</p>
          )}
        </div>
        <div>
          <label className="ed-label block mb-[6px]">New Password</label>
          <Input type="password" {...register("newPassword")} placeholder="••••••••" />
          {errors.newPassword && (
            <p className="text-red text-base mt-2">{errors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label className="ed-label block mb-[6px]">Confirm New Password</label>
          <Input type="password" {...register("confirmPassword")} placeholder="••••••••" />
          {errors.confirmPassword && (
            <p className="text-red text-base mt-2">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Btn variant="primary" fullWidth type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update Password"}
        </Btn>
      </form>
    </Collapsible>
  );
}
