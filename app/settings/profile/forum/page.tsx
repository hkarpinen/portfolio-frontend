"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { forumKeys } from "@/lib/query-keys";
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
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [forumSaved, setForumSaved] = useState(false);
  const [forumError, setForumError] = useState<string | null>(null);

  const forumForm = useForm<ForumForm>({ resolver: zodResolver(forumSchema) });

  useEffect(() => {
    api.get<{ bio?: string | null; signature?: string | null }>("/api/forum/profiles/me")
      .then((forum) => {
        forumForm.reset({ bio: forum.bio ?? "", signature: forum.signature ?? "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [forumForm]);

  const onForumSubmit = async (data: ForumForm) => {
    setForumError(null);
    setForumSaved(false);
    try {
      await api.put("/api/forum/profiles/me", { bio: data.bio ?? null, signature: data.signature ?? null });
      setForumSaved(true);
      queryClient.invalidateQueries({ queryKey: forumKeys.all });
      router.refresh();
    } catch (err) {
      setForumError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="page-enter">
      <ProfileTabs active="Forum Profile" />

      {loading ? (
        <div className={`text-center py-24 px-10 border-ink ${cardClassName}`}>
          <p className="text-ink-3 text-md">Loading...</p>
        </div>
      ) : (
        <div className={`border-ink ${cardClassName}`}>
          <h2 className="ed-label-muted mb-2">Forum Profile</h2>
          <p className="text-base text-ink-3 mb-8">
            Visible on your forum posts and profile page. Separate from your account details.
          </p>
          <form onSubmit={forumForm.handleSubmit(onForumSubmit)} className="flex flex-col gap-8">
            <div aria-live="polite" aria-atomic="true">
              {forumError && <Alert variant="danger">{forumError}</Alert>}
              {forumSaved && <Alert variant="success">Forum profile updated.</Alert>}
            </div>
            <div>
              <label htmlFor="forum-bio" className="ed-label block mb-[6px]">
                Bio <span className="text-ink-3 font-normal">(optional)</span>
              </label>
              <FocusTextarea
                id="forum-bio"
                {...forumForm.register("bio")}
                placeholder="Tell the forum a bit about yourself"
                rows={4}
                aria-describedby={forumForm.formState.errors.bio ? "forum-bio-error" : undefined}
              />
              {forumForm.formState.errors.bio && (
                <p id="forum-bio-error" className="text-red text-base mt-2" role="alert">
                  {forumForm.formState.errors.bio.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="forum-signature" className="ed-label block mb-[6px]">
                Signature <span className="text-ink-3 font-normal">(optional)</span>
              </label>
              <FocusTextarea
                id="forum-signature"
                {...forumForm.register("signature")}
                placeholder="Appears beneath your forum posts"
                rows={2}
                aria-describedby={forumForm.formState.errors.signature ? "forum-signature-error" : undefined}
              />
              {forumForm.formState.errors.signature && (
                <p id="forum-signature-error" className="text-red text-base mt-2" role="alert">
                  {forumForm.formState.errors.signature.message}
                </p>
              )}
            </div>
            <Btn variant="primary" fullWidth type="submit" disabled={forumForm.formState.isSubmitting}>
              {forumForm.formState.isSubmitting ? "Saving…" : "Save Forum Profile"}
            </Btn>
          </form>
        </div>
      )}
    </div>
  );
}
