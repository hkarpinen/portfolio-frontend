import { Icon, VoteControl } from "@/components/editorial";
import Link from "next/link";
import { notFound } from "next/navigation";
import { parseMarkdown } from "@/lib/markdown";
import { CommentTree } from "./comment-tree";
import { timeAgo, authorHandle } from "@/lib/utils";
import { CommentForm } from "./comment-form";

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
  const handle = authorHandle(thread.authorUsername ?? thread.authorDisplayName);

  return (
    <div className="page-enter">
      {/* Back to the community — Terminus `.back`. */}
      <Link
        href={`/forum/g/${params.slug}`}
        className="back inline-flex items-center gap-2 no-underline"
      >
        <Icon name="arrowLeft" size={12} strokeWidth={2} aria-hidden /> g/{params.slug}
      </Link>

      <article style={{ maxWidth: 760 }}>
        {/* Kicker meta — community · time · author (+ flair) */}
        <div className="kicker row" style={{ marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
          <span>// g/{params.slug}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={thread.createdAt}>{timeAgo(thread.createdAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{handle}</span>
          {flair && (
            <>
              <span aria-hidden="true">·</span>
              <span>{flair}</span>
            </>
          )}
        </div>

        <h1 style={{ fontSize: "1.25rem", marginBottom: 16 }}>{thread.title}</h1>

        {/* Body */}
        <div
          className="prose prose-slate max-w-none text-md leading-[1.7] text-ink-2"
          style={{ marginBottom: 20 }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* Action bar — live VoteControl + Reply/Report/More, bordered top
            and bottom to mirror the prototype's button row. */}
        <div
          className="row"
          style={{
            gap: 14,
            padding: "12px 0",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            marginBottom: 22,
          }}
          aria-label="Thread actions"
        >
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

        {/* Reply composer */}
        <CommentForm threadId={params.threadId} isAuthed={isAuthed} />

        {/* Comments */}
        <section aria-labelledby="comments-heading" style={{ marginTop: 22 }}>
          <div className="section-h" style={{ marginBottom: 14 }}>
            <h2 id="comments-heading">
              // COMMENTS[{comments.length}]{" "}
            </h2>
          </div>
          <CommentTree
            comments={comments}
            depth={0}
            threadId={params.threadId}
            isAuthed={isAuthed}
          />
        </section>
      </article>
    </div>
  );
}
