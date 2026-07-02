"use client";

import { Alert, Btn, Input, Textarea } from "@/components/editorial";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMe, useUpdateMe } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";

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
  const { data: me, isLoading: loading } = useMe();
  const updateMe = useUpdateMe();

  const identityForm = useForm<IdentityForm>({ resolver: zodResolver(identitySchema) });

  // Seed the form when `me` resolves. Handle/bio/location/pronouns aren't on
  // the canonical Me type yet (TODO(handoff8)) — read them off `me` defensively.
  useEffect(() => {
    if (!me) return;
    const extra = me as typeof me & {
      handle?: string;
      bio?: string;
      location?: string;
      pronouns?: string;
    };
    identityForm.reset({
      displayName: me.displayName ?? "",
      avatarUrl: me.avatarUrl ?? null,
      handle: extra.handle ?? "",
      bio: extra.bio ?? "",
      location: extra.location ?? "",
      pronouns: extra.pronouns ?? "",
    });
  }, [me, identityForm]);

  const onIdentitySubmit = (data: IdentityForm) => {
    updateMe.mutate(
      {
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        // TODO(handoff8): wire handle/bio/location/pronouns to /api/identity/me once backend exposes those fields
      },
      { onSuccess: () => router.refresh() },
    );
  };

  return (
    <div className="page-enter">
      <ProfileTabs active="Account" />

      {loading ? (
        <div className={`px-10 py-24 text-center ${cardClassName}`}>
          <p className="text-md text-ink-3">Loading...</p>
        </div>
      ) : (
        <div className="split">
          <div className="card">
            <h3 className="card-h mb-6">// PROFILE</h3>
            <form
              onSubmit={identityForm.handleSubmit(onIdentitySubmit)}
              className="flex flex-col gap-8"
            >
              <div aria-live="polite" aria-atomic="true">
                {updateMe.isError && (
                  <Alert variant="danger">{getErrorMessage(updateMe.error)}</Alert>
                )}
                {updateMe.isSuccess && <Alert variant="success">Profile updated.</Alert>}
              </div>

              {/* Row: Display Name + Handle */}
              <div className="field-row">
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
              <div className="field-row">
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

              <Btn variant="primary" fullWidth type="submit" disabled={updateMe.isPending}>
                {updateMe.isPending ? "Saving…" : "Save Changes"}
              </Btn>
            </form>
          </div>

          <aside className="card">
            <h3 className="card-h mb-4">// AVATAR</h3>
            <AvatarUpload
              value={identityForm.watch("avatarUrl") ?? null}
              onChange={(url) => identityForm.setValue("avatarUrl", url)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
