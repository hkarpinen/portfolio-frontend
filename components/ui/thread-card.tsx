"use client";

import { useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { ThreadActions } from "@/app/(forum)/communities/[slug]/threads/[threadId]/thread-actions";
import type { ThreadSummaryResponse } from "@/types/forum";

interface ThreadCardProps {
  thread: ThreadSummaryResponse;
  slug?: string;
  communityName?: string;
  showCommunity?: boolean;
}

export function ThreadCard({
  thread,
  slug,
  communityName,
  showCommunity = true,
}: ThreadCardProps) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const displaySlug = slug ?? thread.communitySlug ?? "";
  const displayCommunity = communityName ?? thread.communityName ?? thread.communitySlug ?? slug;
  const baseScore = thread.voteScore ?? 0;
  const score = baseScore + (voted === "up" ? 1 : voted === "down" ? -1 : 0);

  function handleVote(e: React.MouseEvent, dir: "up" | "down") {
    e.preventDefault();
    e.stopPropagation();
    setVoted((prev) => (prev === dir ? null : dir));
  }

  return (
    <div
      className="thread-card"
      style={{
        padding: "16px 18px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        transition: "transform 200ms var(--ease-spring), box-shadow 200ms",
      }}
    >
      {/* Desktop: horizontal vote + content */}
      <div
        className="thread-card-inner"
        style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
      >
          {/* Vote controls — desktop column */}
          <div
            className="thread-vote-col"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              flexShrink: 0,
              width: "28px",
            }}
          >
            <button
              onClick={(e) => handleVote(e, "up")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                color: voted === "up" ? "var(--accent)" : "var(--text-3)",
                transition: "color 150ms",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                minWidth: "28px",
                textAlign: "center",
                color:
                  voted === "up"
                    ? "var(--accent)"
                    : voted === "down"
                    ? "var(--danger)"
                    : "var(--text-2)",
              }}
            >
              {score}
            </span>
            <button
              onClick={(e) => handleVote(e, "down")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                color: voted === "down" ? "var(--danger)" : "var(--text-3)",
                transition: "color 150ms",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Clickable meta + title */}
            <Link
              href={`/communities/${displaySlug}/threads/${thread.threadId}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              {/* Meta row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                  flexWrap: "wrap",
                }}
              >
                {showCommunity && displayCommunity && (
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent)" }}>
                    {displayCommunity}
                  </span>
                )}
                {showCommunity && displayCommunity && (
                  <span style={{ fontSize: "11px", color: "var(--text-3)" }}>·</span>
                )}
                <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                  Posted by {thread.authorDisplayName ?? "Unknown"} · {timeAgo(thread.createdAt)}
                </span>
                {thread.isPinned && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--success)",
                      background: "var(--success-s)",
                      borderRadius: "9999px",
                      padding: "1px 6px",
                    }}
                  >
                    Pinned
                  </span>
                )}
                {thread.flair && thread.flair !== "None" && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--accent-v)",
                      background: "var(--accent-v-subtle)",
                      borderRadius: "9999px",
                      padding: "1px 6px",
                    }}
                  >
                    {thread.flair}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "var(--ff-display)",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: 1.45,
                  color: "var(--text)",
                  margin: 0,
                  marginBottom: "8px",
                }}
              >
                {thread.title}
              </h3>
            </Link>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Link
                href={`/communities/${displaySlug}/threads/${thread.threadId}`}
                style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "4px 10px", borderRadius: "6px",
                  fontSize: "11px", color: "var(--text-3)", textDecoration: "none", fontWeight: 500,
                }}
                className="row-hover"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {thread.commentCount ?? 0} comments
              </Link>
              <ThreadActions
                threadId={thread.threadId}
                threadUrl={`/communities/${displaySlug}/threads/${thread.threadId}`}
              />
            </div>
          </div>
        </div>
      <style>{`
        .thread-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}
