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
import { SettingsTabs } from "../../settings-tabs";
import { ProfileTabs } from "../profile-tabs";
import { labelStyle, sectionLabelStyle, cardStyle, FocusTextarea } from "../../settings-ui";

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
    <div className="page-enter max-w-[860px] mx-auto py-16 px-12">
      <div className="mb-[28px]">
        <h1 className="font-serif text-4xl leading-none tracking-snug font-bold text-ink">Settings</h1>
        <p className="text-base text-ink-3 mt-2">Manage your account, security, and preferences</p>
      </div>

      <SettingsTabs active="Profile" />
      <ProfileTabs active="Forum Profile" />

      {loading ? (
        <div className="text-center py-24 px-10 border-ink" style={{ ...cardStyle }}>
          <p className="text-ink-3 text-md">Loading...</p>
        </div>
      ) : (
        <div className="border-ink" style={cardStyle}>
          <p className="mb-2" style={{ ...sectionLabelStyle }}>Forum Profile</p>
          <p className="text-base text-ink-3 mb-8">Visible on your forum posts and profile.</p>
          <form onSubmit={forumForm.handleSubmit(onForumSubmit)} className="flex flex-col gap-8">
            {forumError && <Alert variant="danger">{forumError}</Alert>}
            {forumSaved && <Alert variant="success">Forum profile updated.</Alert>}
            <div>
              <label style={labelStyle}>Bio <span className="text-ink-3 font-normal">(optional)</span></label>
              <FocusTextarea {...forumForm.register("bio")} placeholder="Tell the forum a bit about yourself" rows={4} />
              {forumForm.formState.errors.bio && (
                <p className="text-red text-base mt-2">{forumForm.formState.errors.bio.message}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Signature <span className="text-ink-3 font-normal">(optional)</span></label>
              <FocusTextarea {...forumForm.register("signature")} placeholder="Appears beneath your forum posts" rows={2} />
              {forumForm.formState.errors.signature && (
                <p className="text-red text-base mt-2">{forumForm.formState.errors.signature.message}</p>
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
