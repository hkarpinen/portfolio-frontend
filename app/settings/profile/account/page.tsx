"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { identityKeys } from "@/lib/query-keys";
import { Btn, Alert, Input } from "@/components/editorial";
import { SettingsTabs } from "../../settings-tabs";
import { ProfileTabs } from "../profile-tabs";
import { labelStyle, sectionLabelStyle, cardStyle } from "../../settings-ui";
import { AvatarUpload } from "../avatar-upload";

const identitySchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50),
  avatarUrl: z.string().nullable().optional(),
});

type IdentityForm = z.infer<typeof identitySchema>;

export default function AccountSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [identitySaved, setIdentitySaved] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  const identityForm = useForm<IdentityForm>({ resolver: zodResolver(identitySchema) });

  useEffect(() => {
    api.get<{ displayName?: string; avatarUrl?: string | null }>("/api/identity/me")
      .then((identity) => {
        identityForm.reset({
          displayName: identity.displayName ?? "",
          avatarUrl: identity.avatarUrl ?? null,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [identityForm]);

  const onIdentitySubmit = async (data: IdentityForm) => {
    setIdentityError(null);
    setIdentitySaved(false);
    try {
      await api.put("/api/identity/me", { displayName: data.displayName, avatarUrl: data.avatarUrl });
      setIdentitySaved(true);
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
      router.refresh();
    } catch (err) {
      setIdentityError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="page-enter max-w-[860px] mx-auto py-16 px-12">
      <div className="mb-[28px]">
        <h1 className="font-serif text-4xl leading-none tracking-snug font-bold text-ink">Settings</h1>
        <p className="text-base text-ink-3 mt-2">Manage your account, security, and preferences</p>
      </div>

      <SettingsTabs active="Profile" />
      <ProfileTabs active="Account" />

      {loading ? (
        <div className="text-center py-24 px-10 border-ink" style={{ ...cardStyle }}>
          <p className="text-ink-3 text-md">Loading...</p>
        </div>
      ) : (
        <div className="sidebar-grid gap-10">
          <div className="border-ink" style={cardStyle}>
            <p className="mb-8" style={{ ...sectionLabelStyle }}>Account</p>
            <form onSubmit={identityForm.handleSubmit(onIdentitySubmit)} className="flex flex-col gap-8">
              {identityError && <Alert variant="danger">{identityError}</Alert>}
              {identitySaved && <Alert variant="success">Account updated.</Alert>}
              <Input
                label="Display Name"
                type="text"
                {...identityForm.register("displayName")}
                placeholder="Your display name"
                error={identityForm.formState.errors.displayName?.message}
              />
              <Btn variant="primary" fullWidth type="submit" disabled={identityForm.formState.isSubmitting}>
                {identityForm.formState.isSubmitting ? "Saving…" : "Save Account"}
              </Btn>
            </form>
          </div>

          <AvatarUpload
            value={identityForm.watch("avatarUrl") ?? null}
            onChange={(url) => identityForm.setValue("avatarUrl", url)}
          />
        </div>
      )}
    </div>
  );
}
