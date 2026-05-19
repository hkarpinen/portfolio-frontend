"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateThread } from "@/hooks/use-forum";
import { useCommunities } from "@/hooks/use-community";
import { ApiError } from "@/lib/api-client";
import { Btn, Input, Textarea, SelectField } from "@/components/editorial";

export default function NewThreadPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [flair, setFlair] = useState("None");
  const [communitySlug, setCommunitySlug] = useState(params.slug);
  const createThread = useCreateThread();
  const { data: communitiesPage } = useCommunities(1, 50);
  const communities = communitiesPage?.items ?? [];

  const flairOptions = ["None", "Discussion", "Article", "Show & Tell", "Question", "Announcement"];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createThread.mutate({ communitySlug, title, content, flair: flair !== "None" ? flair : undefined }, {
      onSuccess: (thread) => {
        router.refresh();
        router.push(`/forum/${communitySlug}/threads/${thread.threadId}`);
      },
    });
  }

  return (
    <div className="page-enter max-w-[680px] mx-auto flex flex-col gap-12" >
      <div>
        <h1 className="font-serif font-bold text-4xl leading-none tracking-snug text-ink m-0">
          Create Thread
        </h1>
      </div>

      <div className="bg-paper p-12 shadow-stamp border-ink">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {createThread.isError && (
            <div className="text-base text-red bg-red-soft py-[10px] px-[14px]" style={{ border: "1px solid var(--danger)" }}>
              {createThread.error instanceof ApiError ? createThread.error.message : "An unexpected error occurred."}
            </div>
          )}

          {/* Community selector */}
          <SelectField
            label="Community"
            value={communitySlug}
            onChange={(e) => setCommunitySlug(e.target.value)}
            required
          >
            {communities.length === 0 && (
              <option value={params.slug}>{params.slug}</option>
            )}
            {communities.map((c) => (
              <option key={c.communityId} value={c.slug}>{c.name}</option>
            ))}
          </SelectField>

          {/* Title */}
          <div>
            <Input
              label="Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Thread title"
            />
            <span className="text-sm text-ink-3">Be specific — good titles get more engagement.</span>
          </div>

          {/* Body */}
          <div>
            <Textarea
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              placeholder="Thread content (optional)"
              rows={6}
            />
            <span className="text-sm text-ink-3">Optional. Markdown supported.</span>
          </div>

          {/* Flair */}
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">Flair</label>
            <div className="flex gap-3 flex-wrap">
              {flairOptions.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFlair(f)}
                  className="py-[5px] px-[12px] text-base cursor-pointer" style={{ fontWeight: flair === f ? 700 : 500, background: flair === f ? "rgba(178,42,26,0.08)" : "var(--paper-2)", color: flair === f ? "var(--red)" : "var(--text-2)", border: flair === f ? "1px solid var(--accent-border)" : "1.5px solid var(--ink)", transition: "all 0.12s" }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-5">
            <Btn
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Btn>
            <Btn
              type="submit"
              variant="primary"
              disabled={createThread.isPending}
              style={{ flex: 2 }}
            >
              {createThread.isPending ? "Posting…" : "Post Thread"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
