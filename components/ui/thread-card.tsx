"use client";

import { useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { ThreadActions } from "@/app/(forum)/forum/[slug]/threads/[threadId]/thread-actions";
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
      className="thread-card py-[16px] px-[18px] bg-paper"
      style={{ border: "1.5px solid var(--ink)", transition: "transform 200ms var(--ease-spring), box-shadow 200ms" }}
    >
      {/* Desktop: horizontal vote + content */}
      <div
        className="thread-card-inner flex gap-6 items-start"
        
      >
          {/* Vote controls — desktop column */}
          <div
            className="thread-vote-col flex flex-col items-center gap-2 shrink-0 w-[28px]"
            
          >
            <button
              onClick={(e) => handleVote(e, "up")}
              className="bg-transparent cursor-pointer p-2" style={{ border: "none", color: voted === "up" ? "var(--red)" : "var(--text-3)", transition: "color 150ms" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
            <span
              className="text-base font-bold min-w-[28px] text-center" style={{ color:
                  voted === "up"
                    ? "var(--red)"
                    : voted === "down"
                    ? "var(--danger)"
                    : "var(--text-2)" }}
            >
              {score}
            </span>
            <button
              onClick={(e) => handleVote(e, "down")}
              className="bg-transparent cursor-pointer p-2" style={{ border: "none", color: voted === "down" ? "var(--danger)" : "var(--text-3)", transition: "color 150ms" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Clickable meta + title */}
            <Link
              href={`/forum/${displaySlug}/threads/${thread.threadId}`}
              className="no-underline block"
            >
              {/* Meta row */}
              <div
                className="flex items-center gap-3 mb-2 flex-wrap"
              >
                {showCommunity && displayCommunity && (
                  <span className="text-sm font-semibold text-red">
                    {displayCommunity}
                  </span>
                )}
                {showCommunity && displayCommunity && (
                  <span className="text-sm text-ink-3">·</span>
                )}
                <span className="text-sm text-ink-3">
                  Posted by {thread.authorDisplayName ?? "Unknown"} · {timeAgo(thread.createdAt)}
                </span>
                {thread.isPinned && (
                  <span
                    className="font-mono text-green bg-[rgba(61,107,43,0.10)] py-[1px] px-[6px]" style={{ fontSize: "0.594rem", letterSpacing: "0.12em" }}
                  >
                    Pinned
                  </span>
                )}
                {thread.flair && thread.flair !== "None" && (
                  <span
                    className="font-mono text-red bg-[rgba(178,42,26,0.10)] py-[1px] px-[6px]" style={{ fontSize: "0.594rem", letterSpacing: "0.12em" }}
                  >
                    {thread.flair}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                className="font-serif font-semibold text-xl leading-[1.2] text-ink m-0 mb-4"
              >
                {thread.title}
              </h3>
            </Link>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Link
                href={`/forum/${displaySlug}/threads/${thread.threadId}`}
                
                className="row-hover flex items-center gap-2 py-2 px-5 text-sm text-ink-3 no-underline font-medium"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {thread.commentCount ?? 0} comments
              </Link>
              <ThreadActions
                threadId={thread.threadId}
                threadUrl={`/forum/${displaySlug}/threads/${thread.threadId}`}
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
