import Link from "next/link";
import { VoteArrow } from "@/components/editorial";
import { timeAgo } from "@/lib/utils";
import type { ThreadSummaryResponse } from "@/types/forum";

/**
 * Terminus thread row — `.thread-row` = `.thread-votes` | `.thread-body`.
 *
 * The vote tally reads amber via `.thread-votes.hot` when the thread is
 * "hot" (pinned or score over a threshold), matching the prototype. The
 * tally is a STATIC `<VoteArrow>` + count, not an interactive vote control,
 * so the whole row stays a single `<Link>` with no nested buttons.
 */
export function ThreadRow({
  thread,
  slug,
  showCommunity = true,
}: {
  thread: ThreadSummaryResponse;
  slug: string;
  showCommunity?: boolean;
}) {
  const votes = thread.voteScore ?? 0;
  // "Hot" = pinned or a meaningfully upvoted thread. Drives the amber numeral.
  const isHot = thread.isPinned || votes >= 50;
  const replyCount = thread.commentCount ?? 0;

  return (
    <Link
      href={`/forum/g/${slug}/threads/${thread.threadId}`}
      className="thread-row group no-underline"
    >
      <div className={`thread-votes${isHot ? " hot" : ""}`}>
        <VoteArrow direction="up" active={isHot} size={11} />
        <span>{votes}</span>
      </div>
      <div className="thread-body">
        <div className="thread-title group-hover:text-accent">{thread.title}</div>
        <div className="thread-meta">
          {showCommunity && (
            <span className="t-tag">g/{thread.communitySlug ?? slug}</span>
          )}
          <span>
            {replyCount} {replyCount === 1 ? "comment" : "comments"} ·{" "}
            {timeAgo(thread.createdAt)}
          </span>
          {thread.isPinned && <span className="text-accent">Pinned</span>}
        </div>
      </div>
    </Link>
  );
}
