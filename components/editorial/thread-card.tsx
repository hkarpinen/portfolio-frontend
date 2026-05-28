import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { Icon } from "./icon";
import { ThreadActions } from "@/app/(forum)/forum/g/[slug]/threads/[threadId]/thread-actions";
import type { ThreadSummaryResponse } from "@/types/forum";

interface ThreadCardProps {
  thread: ThreadSummaryResponse;
  slug?: string;
  communityName?: string;
  showCommunity?: boolean;
}

export function ThreadCard({ thread, slug, communityName, showCommunity = true }: ThreadCardProps) {
  const displaySlug = slug ?? thread.communitySlug ?? "";
  const displayCommunity = communityName ?? thread.communityName ?? thread.communitySlug ?? slug;

  return (
    <div
      className="thread-card border-ink bg-paper px-[18px] py-[16px]"
      style={{ transition: "transform 200ms var(--ease-spring), box-shadow 200ms" }}
    >
      {/* Desktop: horizontal vote + content */}
      <div className="thread-card-inner flex items-start gap-6">
        {/* Vote score — static */}
        <div className="thread-vote-col flex w-[28px] shrink-0 flex-col items-center justify-center">
          <span
            className="min-w-[28px] text-center text-base font-bold"
            style={{ color: "var(--text-2)" }}
          >
            {thread.voteScore ?? 0}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Clickable meta + title */}
          <Link
            href={`/forum/g/${displaySlug}/threads/${thread.threadId}`}
            className="block no-underline"
          >
            {/* Meta row */}
            <div className="mb-2 flex flex-wrap items-center gap-3">
              {showCommunity && displayCommunity && (
                <span className="text-sm font-semibold text-red">{displayCommunity}</span>
              )}
              {showCommunity && displayCommunity && <span className="text-sm text-ink-3">·</span>}
              <span className="text-sm text-ink-3">
                Posted by {thread.authorDisplayName ?? "Unknown"} · {timeAgo(thread.createdAt)}
              </span>
              {thread.isPinned && (
                <span
                  className="bg-green-soft px-[6px] py-[1px] font-mono text-green"
                  style={{ fontSize: "0.594rem", letterSpacing: "0.12em" }}
                >
                  Pinned
                </span>
              )}
              {thread.flair && thread.flair !== "None" && (
                <span
                  className="bg-red-soft px-[6px] py-[1px] font-mono text-red"
                  style={{ fontSize: "0.594rem", letterSpacing: "0.12em" }}
                >
                  {thread.flair}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="m-0 mb-4 font-serif text-xl font-semibold leading-[1.2] text-ink">
              {thread.title}
            </h3>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/forum/g/${displaySlug}/threads/${thread.threadId}`}
              className="row-hover flex items-center gap-2 px-5 py-2 text-sm font-medium text-ink-3 no-underline"
            >
              <Icon name="forum" size={12} strokeWidth={2} />
              {thread.commentCount ?? 0} comments
            </Link>
            <ThreadActions
              threadId={thread.threadId}
              threadUrl={`/forum/g/${displaySlug}/threads/${thread.threadId}`}
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
