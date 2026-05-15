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
        router.push(`/communities/${communitySlug}/threads/${thread.threadId}`);
      },
    });
  }

  return (
    <div className="page-enter" style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-h2)", lineHeight: "var(--lh-display)", letterSpacing: "-0.02em", color: "var(--text)", margin: 0 }}>
          Create Thread
        </h1>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)",
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {createThread.isError && (
            <div style={{
              fontSize: "var(--ts-body-sm)", color: "var(--danger)",
              background: "var(--danger-s)", border: "1px solid var(--danger)",
              borderRadius: "10px", padding: "10px 14px",
            }}>
              {createThread.error instanceof ApiError ? createThread.error.message : "An unexpected error occurred."}
            </div>
          )}

          {/* Community selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "var(--ts-meta)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Community
            </label>
            <select
              value={communitySlug}
              onChange={(e) => setCommunitySlug(e.target.value)}
              required
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "var(--ts-body)",
                outline: "none", boxSizing: "border-box", appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' strokeWidth='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "var(--ts-meta)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Thread title"
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "var(--ts-body)",
                outline: "none", boxSizing: "border-box",
              }}
            />
            <span style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)" }}>Be specific — good titles get more engagement.</span>
          </div>

          {/* Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "var(--ts-meta)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              placeholder="Thread content (optional)"
              rows={6}
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "var(--ts-body)",
                outline: "none", resize: "vertical", boxSizing: "border-box",
                fontFamily: "var(--ff-body)", lineHeight: 1.6,
              }}
            />
            <span style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)" }}>Optional. Markdown supported.</span>
          </div>

          {/* Flair */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "var(--ts-meta)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Flair</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {flairOptions.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFlair(f)}
                  style={{
                    padding: "5px 12px", borderRadius: "20px", fontSize: "var(--ts-label)",
                    fontWeight: flair === f ? 700 : 500,
                    background: flair === f ? "var(--accent-subtle)" : "var(--surface-2)",
                    color: flair === f ? "var(--accent)" : "var(--text-2)",
                    border: flair === f ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                    cursor: "pointer", transition: "all 0.12s",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                flex: 1, background: "var(--surface-2)", color: "var(--text-2)",
                border: "1px solid var(--border)", borderRadius: "12px",
                padding: "10px 20px", fontWeight: 600, fontSize: "var(--ts-body)",
                cursor: "pointer", fontFamily: "var(--ff-body)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createThread.isPending}
              style={{
                flex: 2, background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: "12px",
                padding: "10px 20px", fontWeight: 600, fontSize: "var(--ts-body)",
                cursor: createThread.isPending ? "not-allowed" : "pointer",
                opacity: createThread.isPending ? 0.6 : 1,
                fontFamily: "var(--ff-body)",
              }}
            >
              {createThread.isPending ? "Posting…" : "Post Thread"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
