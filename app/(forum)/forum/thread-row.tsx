import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import type { ThreadSummaryResponse } from "@/types/forum";

/**
 * Editorial thread row — vote tally, meta line, italic title, reply count.
 * Shared by the forum feed and community pages. No client interactivity.
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
  return (
    <Link
      href={`/forum/g/${slug}/threads/${thread.threadId}`}
      className="flex gap-6 sm:gap-10 py-6 border-b border-rule-soft last:border-b-0 no-underline group items-start"
    >
      <div className="flex flex-col items-center w-14 shrink-0 pt-0.5">
        <span className="font-serif italic text-ink text-[1.625rem] leading-none">{thread.voteScore ?? 0}</span>
        <span className="ed-meta mt-1.5">votes</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="ed-meta mb-2.5 flex items-center gap-2 flex-wrap">
          {showCommunity && (
            <>
              <span className="text-red">{thread.communityName ?? thread.communitySlug ?? slug}</span>
              <span className="text-ink-4">·</span>
            </>
          )}
          <span>{thread.authorDisplayName ?? "—"}</span>
          <span className="text-ink-4">·</span>
          <span>{timeAgo(thread.createdAt)}</span>
          {thread.isPinned && <span className="text-red">· Pinned</span>}
        </p>
        <h3 className="font-serif italic text-ink text-[1.25rem] leading-snug group-hover:text-red">{thread.title}</h3>
      </div>
      <div className="shrink-0 text-right pt-0.5">
        <span className="font-serif italic text-ink text-[1.375rem] leading-none">{thread.commentCount ?? 0}</span>
        <span className="ed-meta block mt-1.5">replies</span>
      </div>
    </Link>
  );
}
