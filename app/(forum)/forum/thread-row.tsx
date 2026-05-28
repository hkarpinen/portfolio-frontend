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
      className="group flex items-start gap-6 border-b border-rule-soft py-6 no-underline last:border-b-0 sm:gap-10"
    >
      <div className="flex w-14 shrink-0 flex-col items-center pt-0.5">
        <span className="font-serif text-[1.625rem] italic leading-none text-ink">
          {thread.voteScore ?? 0}
        </span>
        <span className="ed-meta mt-1.5">votes</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="ed-meta mb-2.5 flex flex-wrap items-center gap-2">
          {showCommunity && (
            <>
              <span className="text-red">
                {thread.communityName ?? thread.communitySlug ?? slug}
              </span>
              <span className="text-ink-4">·</span>
            </>
          )}
          <span>{thread.authorDisplayName ?? "—"}</span>
          <span className="text-ink-4">·</span>
          <span>{timeAgo(thread.createdAt)}</span>
          {thread.isPinned && <span className="text-red">· Pinned</span>}
        </p>
        <h3 className="font-serif text-[1.25rem] italic leading-snug text-ink group-hover:text-red">
          {thread.title}
        </h3>
      </div>
      <div className="shrink-0 pt-0.5 text-right">
        <span className="font-serif text-[1.375rem] italic leading-none text-ink">
          {thread.commentCount ?? 0}
        </span>
        <span className="ed-meta mt-1.5 block">replies</span>
      </div>
    </Link>
  );
}
