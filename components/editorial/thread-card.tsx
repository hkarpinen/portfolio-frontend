import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { Icon } from "./icon";
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
  const displaySlug = slug ?? thread.communitySlug ?? "";
  const displayCommunity = communityName ?? thread.communityName ?? thread.communitySlug ?? slug;

  return (
    <div
      className="thread-card py-[16px] px-[18px] bg-paper border-ink"
      style={{transition: "transform 200ms var(--ease-spring), box-shadow 200ms" }}
    >
      {/* Desktop: horizontal vote + content */}
      <div
        className="thread-card-inner flex gap-6 items-start"
        
      >
          {/* Vote score — static */}
          <div className="thread-vote-col flex flex-col items-center justify-center shrink-0 w-[28px]">
            <span className="text-base font-bold min-w-[28px] text-center" style={{ color: "var(--text-2)" }}>
              {thread.voteScore ?? 0}
            </span>
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
                    className="font-mono text-green bg-green-soft py-[1px] px-[6px]" style={{ fontSize: "0.594rem", letterSpacing: "0.12em" }}
                  >
                    Pinned
                  </span>
                )}
                {thread.flair && thread.flair !== "None" && (
                  <span
                    className="font-mono text-red bg-red-soft py-[1px] px-[6px]" style={{ fontSize: "0.594rem", letterSpacing: "0.12em" }}
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
                <Icon name="forum" size={12} strokeWidth={2} />
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
