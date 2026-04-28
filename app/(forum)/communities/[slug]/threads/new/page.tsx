"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateThread } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";

export default function NewThreadPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createThread = useCreateThread();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createThread.mutate({ communitySlug: params.slug, title, content }, {
      onSuccess: (thread) => {
        router.refresh();
        router.push(`/communities/${params.slug}/threads/${thread.threadId}`);
      },
    });
  }

  return (
    <div className="page-enter" style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "24px", color: "var(--text)", margin: 0 }}>
          Create Thread
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "14px" }}>
          in <span style={{ color: "var(--text-2)", fontWeight: 500 }}>{params.slug}</span>
        </p>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)",
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {createThread.isError && (
            <div style={{
              fontSize: "13px", color: "var(--danger)",
              background: "var(--danger-s)", border: "1px solid var(--danger)",
              borderRadius: "10px", padding: "10px 14px",
            }}>
              {createThread.error instanceof ApiError ? createThread.error.message : "An unexpected error occurred."}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
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
                borderRadius: "10px", color: "var(--text)", fontSize: "14px",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              placeholder="Thread content (optional)"
              rows={8}
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "14px",
                outline: "none", resize: "vertical", boxSizing: "border-box",
                fontFamily: "var(--ff-body)", lineHeight: 1.6,
              }}
            />
          </div>
          <button
            type="submit"
            disabled={createThread.isPending}
            style={{
              background: "var(--accent)", color: "#fff",
              border: "none", borderRadius: "12px",
              padding: "10px 20px", fontWeight: 600, fontSize: "14px",
              cursor: createThread.isPending ? "not-allowed" : "pointer",
              opacity: createThread.isPending ? 0.6 : 1,
              fontFamily: "var(--ff-body)",
            }}
          >
            {createThread.isPending ? "Creating…" : "Create Thread"}
          </button>
        </form>
      </div>
    </div>
  );
}
