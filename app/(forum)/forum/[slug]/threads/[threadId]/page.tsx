import { notFound } from "next/navigation";
import { parseMarkdown } from "@/lib/markdown";
import { CommentTree } from "./comment-tree";
import { timeAgo, getInitials } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { VoteButtons } from "./vote-buttons";
import { ThreadActions } from "./thread-actions";
import Link from "next/link";

import { fetchThreadServer, fetchCommentsServer } from "@/lib/api/forum";
import { fetchCommunityBySlugServer } from "@/lib/api/communities";
import { getSession } from "@/lib/auth/session";
import type { Thread, Comment } from "@/types/forum";

export const dynamic = 'force-dynamic';

export default async function ThreadPage({
  params,
}: {
  params: { slug: string; threadId: string };
}) {
  const [thread, commentsData, community] = await Promise.all([
    fetchThreadServer(params.threadId),
    fetchCommentsServer(params.threadId),
    fetchCommunityBySlugServer(params.slug),
  ]);

  if (!thread) notFound();

  const comments: Comment[] = commentsData?.items ?? [];
  const bodyHtml = await parseMarkdown(thread.content ?? thread.body ?? "");
  const session = await getSession();
  const isAuthed = !!session;

  return (
    <div className="page-enter sidebar-grid gap-12" >
    <div className="flex flex-col gap-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-4">
        <Link href="/forum" className="text-base text-ink-3 no-underline">
          Communities
        </Link>
        <span className="text-ink-3 text-base">/</span>
        <Link href={`/forum/${params.slug}`} className="text-base text-ink-3 no-underline capitalize">
          {params.slug}
        </Link>
      </nav>

      {/* Thread */}
      <article className="bg-paper overflow-hidden shadow-stamp border-ink">
        <div className="flex gap-0">
          {/* Vote column */}
          <div className="w-24 shrink-0 flex flex-col items-center p-[20px_0]" style={{ borderRight: "1.5px solid var(--ink)" }}>
            <VoteButtons threadId={thread.threadId} targetType={0} targetId={thread.threadId} initialScore={thread.voteScore ?? 0} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 py-10 px-12">
            <h1 className="font-serif font-bold text-4xl leading-none tracking-snug text-ink m-0">
              {thread.title}
            </h1>
            {thread.flair && thread.flair !== "None" && (
              <span className="inline-block mt-4 py-1 px-5 text-sm font-semibold tracking-[0.03em] bg-red-soft text-red" style={{ border: "1px solid var(--accent-border)" }}>
                {thread.flair}
              </span>
            )}
            <div className="flex items-center gap-4 mt-4">
              {(thread.authorDisplayName || thread.authorUsername) && (
                <span className="flex items-center gap-3">
                  {thread.authorAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thread.authorAvatarUrl}
                      alt=""
                      className="w-[18px] h-[18px] object-cover shrink-0 border-ink"
                    />
                  ) : (
                    <span className="w-[18px] h-[18px] bg-paper-3 flex items-center justify-center text-sm font-semibold text-ink-2 shrink-0">
                      {getInitials(thread.authorDisplayName ?? thread.authorUsername)}
                    </span>
                  )}
                  <span className="text-base text-ink-3">
                    {thread.authorId ? (
                      <Link href={`/profile/${thread.authorId}`} className="text-[inherit] no-underline"
                      >{thread.authorDisplayName ?? thread.authorUsername}</Link>
                    ) : (thread.authorDisplayName ?? thread.authorUsername)}
                  </span>
                </span>
              )}
              <span className="text-ink-3 text-base">·</span>
              <span className="text-base text-ink-3">{timeAgo(thread.createdAt)}</span>
              {thread.commentCount !== undefined && (
                <>
                  <span className="text-ink-3 text-base">·</span>
                  <span className="text-base text-ink-3">{thread.commentCount} comments</span>
                </>
              )}
            </div>
            <div
              className="prose prose-slate dark:prose-invert max-w-none mt-8 text-md text-ink-2 leading-[1.7]"
              
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
            {/* Action row */}
            <div className="flex items-center gap-2 mt-8 pt-6" style={{ borderTop: "1.5px solid var(--ink)" }}>
              <ThreadActions
                threadId={thread.threadId}
                threadUrl={`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/communities/${params.slug}/threads/${thread.threadId}`}
              />
            </div>
          </div>
        </div>
      </article>

      {/* Comment form */}
      <section className="bg-paper p-10 shadow-stamp border-ink">
        <h2 className="font-serif font-semibold text-md text-ink mb-6">
          Leave a comment
        </h2>
        <CommentForm threadId={params.threadId} isAuthed={isAuthed} />
      </section>

      {/* Comments — card header + list rendered inside CommentTree */}
      <CommentTree comments={comments} depth={0} threadId={params.threadId} isAuthed={isAuthed} />
    </div>

    {/* Right sidebar */}
    <aside className="flex flex-col gap-8 sticky top-[16px]" style={{ alignSelf: "start" }}>
      {community && (
        <div className="bg-paper overflow-hidden shadow-stamp border-ink">
          {/* Banner strip */}
          <div className="h-2 bg-ink" />
          <div className="p-[0_16px_16px]">
            <p className="font-serif font-extrabold text-md text-ink" style={{ margin: "12px 0 6px" }}>
              About {community.name}
            </p>
            {community.description && (
              <p className="text-base text-ink-2 leading-[1.5]" style={{ margin: "0 0 12px" }}>{community.description}</p>
            )}
            <div className="flex gap-8 mb-6">
              <div>
                <p className="font-serif font-bold text-md text-ink m-0">{community.memberCount.toLocaleString()}</p>
                <p className="text-sm text-ink-3 m-0">Members</p>
              </div>
              <div>
                <p className="font-serif font-bold text-md text-ink m-0">{community.threadCount.toLocaleString()}</p>
                <p className="text-sm text-ink-3 m-0">Posts</p>
              </div>
            </div>
            <Link
              href={`/forum/${params.slug}`}
              className="block text-center bg-red text-white py-4 px-6 text-base font-semibold no-underline"
            >
              Visit community
            </Link>
          </div>
        </div>
      )}
    </aside>
    </div>
  );
}
