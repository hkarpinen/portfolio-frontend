"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateThread } from "@/hooks/use-forum";
import { useCommunities } from "@/hooks/use-community";
import { ApiError } from "@/lib/api-client";

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

      <div className="bg-paper p-12 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {createThread.isError && (
            <div className="text-base text-red bg-[rgba(178,42,26,0.10)] py-[10px] px-[14px]" style={{ border: "1px solid var(--danger)" }}>
              {createThread.error instanceof ApiError ? createThread.error.message : "An unexpected error occurred."}
            </div>
          )}

          {/* Community selector */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
              Community
            </label>
            <select
              value={communitySlug}
              onChange={(e) => setCommunitySlug(e.target.value)}
              required
              className="w-full py-[10px] px-[14px] bg-paper-2 text-ink text-md outline-none appearance-none" style={{ border: "1.5px solid var(--ink)", boxSizing: "border-box", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' strokeWidth='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              {communities.length === 0 && (
                <option value={params.slug}>{params.slug}</option>
              )}
              {communities.map((c) => (
                <option key={c.communityId} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Title — spec order: community → title → body → flair */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Thread title"
              className="w-full py-[10px] px-[14px] bg-paper-2 text-ink text-md outline-none" style={{ border: "1.5px solid var(--ink)", boxSizing: "border-box" }}
            />
            <span className="text-sm text-ink-3">Be specific — good titles get more engagement.</span>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              placeholder="Thread content (optional)"
              rows={6}
              className="w-full py-[10px] px-[14px] bg-paper-2 text-ink text-md outline-none font-body leading-[1.6]" style={{ border: "1.5px solid var(--ink)", resize: "vertical", boxSizing: "border-box" }}
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
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-paper-2 text-ink-2 py-5 px-10 font-semibold text-md cursor-pointer font-body" style={{ border: "1.5px solid var(--ink)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createThread.isPending}
              className="bg-red text-white py-5 px-10 font-semibold text-md font-body" style={{ flex: 2, border: "none", cursor: createThread.isPending ? "not-allowed" : "pointer", opacity: createThread.isPending ? 0.6 : 1 }}
            >
              {createThread.isPending ? "Posting…" : "Post Thread"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
