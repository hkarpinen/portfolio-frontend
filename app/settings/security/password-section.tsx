"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "@/lib/api-client";
import { Btn, Input, Alert, Collapsible } from "@/components/editorial";
import { labelStyle } from "../settings-ui";

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
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError(null);
    setPasswordSaved(false);
    try {
      await api.put("/api/identity/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to update password. Check your current password.");
    }
  };

  return (
    <Collapsible
      title="Password"
      description="Change your account password"
      onOpenChange={(open) => { if (!open) { setPasswordSaved(false); setPasswordError(null); } }}
    >
      <form
        onSubmit={handleSubmit(onPasswordSubmit)}
        className="flex flex-col gap-[14px] mt-10 pt-10 border-ink-t"
      >
        {passwordError && <Alert variant="danger">{passwordError}</Alert>}
        {passwordSaved && <Alert variant="success">Password updated successfully!</Alert>}
        <div>
          <label style={labelStyle}>Current Password</label>
          <Input type="password" {...register("currentPassword")} placeholder="••••••••" />
          {errors.currentPassword && (
            <p className="text-red text-base mt-2">{errors.currentPassword.message}</p>
          )}
        </div>
        <div>
          <label style={labelStyle}>New Password</label>
          <Input type="password" {...register("newPassword")} placeholder="••••••••" />
          {errors.newPassword && (
            <p className="text-red text-base mt-2">{errors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label style={labelStyle}>Confirm New Password</label>
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
