"use client";

import { Alert, Btn, Collapsible, Input } from "@/components/editorial";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdatePassword } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";

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
  const updatePassword = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => reset() },
    );
  };

  return (
    <Collapsible
      title="Password"
      description="Change your account password"
      // Closing the section is the "I'm done seeing the result" signal —
      // resetting the mutation clears both isError and isSuccess in one shot.
      onOpenChange={(open) => {
        if (!open) updatePassword.reset();
      }}
    >
      <form
        onSubmit={handleSubmit(onPasswordSubmit)}
        className="border-ink-t mt-10 flex flex-col gap-[14px] pt-10"
      >
        {updatePassword.isError && (
          <Alert variant="danger">{getErrorMessage(updatePassword.error)}</Alert>
        )}
        {updatePassword.isSuccess && (
          <Alert variant="success">Password updated successfully!</Alert>
        )}
        <div>
          <label className="ed-label mb-[6px] block">Current Password</label>
          <Input type="password" {...register("currentPassword")} placeholder="••••••••" />
          {errors.currentPassword && (
            <p className="mt-2 text-base text-red">{errors.currentPassword.message}</p>
          )}
        </div>
        <div>
          <label className="ed-label mb-[6px] block">New Password</label>
          <Input type="password" {...register("newPassword")} placeholder="••••••••" />
          {errors.newPassword && (
            <p className="mt-2 text-base text-red">{errors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label className="ed-label mb-[6px] block">Confirm New Password</label>
          <Input type="password" {...register("confirmPassword")} placeholder="••••••••" />
          {errors.confirmPassword && (
            <p className="mt-2 text-base text-red">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Btn variant="primary" fullWidth type="submit" disabled={updatePassword.isPending}>
          {updatePassword.isPending ? "Updating…" : "Update Password"}
        </Btn>
      </form>
    </Collapsible>
  );
}
