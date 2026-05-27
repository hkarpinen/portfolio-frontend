"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { ERROR } from "@/lib/error-messages";
import { identityKeys } from "@/lib/query-keys";
import { Btn, Alert, Input, Textarea } from "@/components/editorial";
import { ProfileTabs } from "../profile-tabs";
import { cardClassName } from "../../settings-ui";
import { AvatarUpload } from "../avatar-upload";

const identitySchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50),
  handle: z.string().max(30).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  pronouns: z.string().max(50).optional(),
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
    api.get<{ displayName?: string; avatarUrl?: string | null; handle?: string; bio?: string; location?: string; pronouns?: string }>("/api/identity/me")
      .then((identity) => {
        identityForm.reset({
          displayName: identity.displayName ?? "",
          avatarUrl: identity.avatarUrl ?? null,
          handle: identity.handle ?? "",
          bio: identity.bio ?? "",
          location: identity.location ?? "",
          pronouns: identity.pronouns ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [identityForm]);

  const onIdentitySubmit = async (data: IdentityForm) => {
    setIdentityError(null);
    setIdentitySaved(false);
    try {
      await api.put("/api/identity/me", {
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        // TODO(handoff8): wire handle/bio/location/pronouns to /api/identity/me once backend exposes those fields
      });
      setIdentitySaved(true);
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
      router.refresh();
    } catch (err) {
      setIdentityError(err instanceof ApiError ? err.message : ERROR.DEFAULT);
    }
  };

  return (
    <div className="page-enter">
      <ProfileTabs active="Account" />

      {loading ? (
        <div className={`text-center py-24 px-10 border-ink ${cardClassName}`}>
          <p className="text-ink-3 text-md">Loading...</p>
        </div>
      ) : (
        <div className="sidebar-grid gap-10">
          <div className={`border-ink ${cardClassName}`}>
            <p className="ed-label-muted mb-8">Profile</p>
            <form onSubmit={identityForm.handleSubmit(onIdentitySubmit)} className="flex flex-col gap-8">
              <div aria-live="polite" aria-atomic="true">
                {identityError && <Alert variant="danger">{identityError}</Alert>}
                {identitySaved && <Alert variant="success">Profile updated.</Alert>}
              </div>

              {/* Row: Display Name + Handle */}
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Display Name"
                  type="text"
                  {...identityForm.register("displayName")}
                  placeholder="Hank K."
                  error={identityForm.formState.errors.displayName?.message}
                />
                <Input
                  label="Handle"
                  type="text"
                  {...identityForm.register("handle")}
                  placeholder="@hank"
                  error={identityForm.formState.errors.handle?.message}
                />
              </div>

              {/* Bio */}
              <Textarea
                label="Bio"
                {...identityForm.register("bio")}
                placeholder="Full-stack engineer in Oakland. Currently looking for senior / staff roles."
                rows={4}
                error={identityForm.formState.errors.bio?.message}
              />

              {/* Row: Location + Pronouns */}
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Location"
                  type="text"
                  {...identityForm.register("location")}
                  placeholder="Oakland, CA"
                  error={identityForm.formState.errors.location?.message}
                />
                <Input
                  label="Pronouns"
                  type="text"
                  {...identityForm.register("pronouns")}
                  placeholder="he/him"
                  error={identityForm.formState.errors.pronouns?.message}
                />
              </div>

              <Btn variant="primary" fullWidth type="submit" disabled={identityForm.formState.isSubmitting}>
                {identityForm.formState.isSubmitting ? "Saving…" : "Save Changes"}
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
