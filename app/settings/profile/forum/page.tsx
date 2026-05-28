"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMyForumProfile, useUpdateMyForumProfile } from "@/hooks/use-forum";
import { getErrorMessage } from "@/lib/error-messages";
import { Btn, Alert } from "@/components/editorial";
import { ProfileTabs } from "../profile-tabs";
import { cardClassName, FocusTextarea } from "../../settings-ui";

const forumSchema = z.object({
  bio: z.string().max(500).optional(),
  signature: z.string().max(200).optional(),
});

type ForumForm = z.infer<typeof forumSchema>;

export default function ForumProfileSettingsPage() {
  const router = useRouter();
  const { data: profile, isLoading: loading } = useMyForumProfile();
  const updateProfile = useUpdateMyForumProfile();

  const forumForm = useForm<ForumForm>({ resolver: zodResolver(forumSchema) });

  useEffect(() => {
    if (profile) {
      forumForm.reset({ bio: profile.bio ?? "", signature: profile.signature ?? "" });
    }
  }, [profile, forumForm]);

  const onForumSubmit = (data: ForumForm) => {
    updateProfile.mutate(
      { bio: data.bio ?? null, signature: data.signature ?? null },
      { onSuccess: () => router.refresh() },
    );
  };

  return (
    <div className="page-enter">
      <ProfileTabs active="Forum Profile" />

      {loading ? (
        <div className={`border-ink px-10 py-24 text-center ${cardClassName}`}>
          <p className="text-md text-ink-3">Loading...</p>
        </div>
      ) : (
        <div className={`border-ink ${cardClassName}`}>
          <h2 className="ed-label-muted mb-2">Forum Profile</h2>
          <p className="mb-8 text-base text-ink-3">
            Visible on your forum posts and profile page. Separate from your account details.
          </p>
          <form onSubmit={forumForm.handleSubmit(onForumSubmit)} className="flex flex-col gap-8">
            <div aria-live="polite" aria-atomic="true">
              {updateProfile.isError && (
                <Alert variant="danger">{getErrorMessage(updateProfile.error)}</Alert>
              )}
              {updateProfile.isSuccess && (
                <Alert variant="success">Forum profile updated.</Alert>
              )}
            </div>
            <div>
              <label htmlFor="forum-bio" className="ed-label mb-[6px] block">
                Bio <span className="font-normal text-ink-3">(optional)</span>
              </label>
              <FocusTextarea
                id="forum-bio"
                {...forumForm.register("bio")}
                placeholder="Tell the forum a bit about yourself"
                rows={4}
                aria-describedby={forumForm.formState.errors.bio ? "forum-bio-error" : undefined}
              />
              {forumForm.formState.errors.bio && (
                <p id="forum-bio-error" className="mt-2 text-base text-red" role="alert">
                  {forumForm.formState.errors.bio.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="forum-signature" className="ed-label mb-[6px] block">
                Signature <span className="font-normal text-ink-3">(optional)</span>
              </label>
              <FocusTextarea
                id="forum-signature"
                {...forumForm.register("signature")}
                placeholder="Appears beneath your forum posts"
                rows={2}
                aria-describedby={
                  forumForm.formState.errors.signature ? "forum-signature-error" : undefined
                }
              />
              {forumForm.formState.errors.signature && (
                <p id="forum-signature-error" className="mt-2 text-base text-red" role="alert">
                  {forumForm.formState.errors.signature.message}
                </p>
              )}
            </div>
            <Btn variant="primary" fullWidth type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving…" : "Save Forum Profile"}
            </Btn>
          </form>
        </div>
      )}
    </div>
  );
}
