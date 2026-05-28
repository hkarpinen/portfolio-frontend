import { notFound } from "next/navigation";
import { parseMarkdown } from "@/lib/markdown";
import { CommentTree } from "./comment-tree";
import { timeAgo, authorHandle, renderTitleAccent } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { VoteControl } from "@/components/editorial/vote-control";
import { ThreadActions } from "./thread-actions";
import { fetchThreadServer, fetchCommentsServer } from "@/lib/api/forum";
import { getSession } from "@/lib/auth/session";
import type { Comment } from "@/types/forum";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: { slug: string; threadId: string };
}) {
  const [thread, commentsData] = await Promise.all([
    fetchThreadServer(params.threadId),
    fetchCommentsServer(params.threadId),
  ]);

  if (!thread) notFound();

  const comments: Comment[] = commentsData?.items ?? [];
  const bodyHtml = await parseMarkdown(thread.content ?? thread.body ?? "");
  const session = await getSession();
  const isAuthed = !!session;

  const flair = thread.flair && thread.flair !== "None" ? thread.flair : null;
  const replyCount = thread.commentCount ?? comments.length;
  const handle = authorHandle(thread.authorUsername ?? thread.authorDisplayName);

  return (
    <div className="page-enter flex max-w-[760px] flex-col gap-7">
      {/* Two-line kicker: community on top, thread + flair below */}
      <header className="flex flex-col gap-3">
        <p className="ed-kicker">g/{params.slug}</p>
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-3">
          <span>Thread</span>
          {flair && (
            <>
              <span aria-hidden="true" className="text-ink-4">
                ·
              </span>
              <span className="text-red">{flair}</span>
            </>
          )}
        </p>
        <h1
          className="ed-h1"
          // `thread.title` is user input — `renderTitleAccent` HTML-escapes
          // everything except `*…*` segments, which become <em>…</em>.
          dangerouslySetInnerHTML={{ __html: renderTitleAccent(thread.title) }}
        />
        <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-3">
          <span className="text-ink">{handle}</span>
          <span aria-hidden="true" className="text-ink-4">
            ·
          </span>
          <time dateTime={thread.createdAt}>{timeAgo(thread.createdAt)}</time>
          <span aria-hidden="true" className="text-ink-4">
            ·
          </span>
          <span>
            {thread.voteScore ?? 0} {(thread.voteScore ?? 0) === 1 ? "vote" : "votes"}
          </span>
          <span aria-hidden="true" className="text-ink-4">
            ·
          </span>
          <span>
            {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </span>
        </p>
      </header>

      {/* Action bar: horizontal vote · Reply CTA · spacer · overflow menu */}
      <div className="ed-thread-action-bar" aria-label="Thread actions">
        <VoteControl
          threadId={thread.threadId}
          targetType={0}
          targetId={thread.threadId}
          initialScore={thread.voteScore ?? 0}
          orientation="row"
        />
        <ThreadActions
          threadId={thread.threadId}
          threadUrl={`/forum/g/${params.slug}/threads/${thread.threadId}`}
        />
      </div>

      {/* Body */}
      <div
        className="prose prose-slate max-w-none text-md leading-[1.7] text-ink-2"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {/* Reply composer — inline below body, no section heading per mockup */}
      <CommentForm threadId={params.threadId} isAuthed={isAuthed} />

      {/* Comments */}
      <section aria-labelledby="comments-heading" className="pt-2">
        <h2 id="comments-heading" className="ed-h3 mb-2">
          {comments.length} <em>{comments.length === 1 ? "reply" : "replies"}</em>
        </h2>
        <CommentTree comments={comments} depth={0} threadId={params.threadId} isAuthed={isAuthed} />
      </section>
    </div>
  );
}
