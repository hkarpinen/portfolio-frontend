"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { timeAgo, getInitials, authorHandle } from "@/lib/utils";
import type { Comment } from "@/types/forum";
import styles from "./comment-tree.module.css";
import { CommentVote } from "./comment-vote";
import { InlineReplyForm } from "./inline-reply-form";
import { ReportButton } from "./report-button";
import { useIsDemo } from "@/hooks/use-demo";

// Indent rail colors by depth — accent fades as nesting deepens.
const RAIL_COLORS = [
  "var(--red)",        // depth 1
  "var(--accent-v)",   // depth 2
  "var(--border-2)",   // depth 3
  "var(--ink-3)",      // depth 4+
];
function railColor(depth: number) {
  return RAIL_COLORS[Math.min(depth - 1, RAIL_COLORS.length - 1)];
}

function CommentNode({
  comment,
  depth,
  threadId,
  isAuthed,
  isLast,
}: {
  comment: Comment;
  depth: number;
  threadId: string;
  isAuthed: boolean;
  isLast: boolean;
}) {
  const pathname = usePathname();
  const isDemo = useIsDemo();
  const authorName = comment.authorDisplayName ?? comment.authorUsername ?? "Anonymous";
  const handle = authorHandle(comment.authorUsername ?? comment.authorDisplayName);
  const initials = getInitials(authorName);
  const [replying, setReplying] = useState(false);

  return (
    <article
      aria-label={`Comment by ${authorName}`}
      className={isLast ? "" : "border-b border-[var(--rule-soft)]"}
      style={{
        paddingLeft: depth > 0 ? "20px" : "0",
        borderLeft: depth > 0 ? `2px solid ${railColor(depth)}` : "none",
        marginLeft: depth > 0 ? "10px" : "0",
      }}
    >
      <div className="pt-6 pb-5">
        {/* Author row — avatar + @handle · time · N votes */}
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          {comment.authorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.authorAvatarUrl}
              alt=""
              aria-hidden="true"
              className="w-12 h-12 object-cover shrink-0 border-ink"
            />
          ) : (
            <span aria-hidden="true" className="w-12 h-12 bg-paper-3 text-ink-2 flex items-center justify-center text-sm font-bold shrink-0 border-ink">
              {initials}
            </span>
          )}
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink">
            {comment.authorId ? (
              <Link
                href={`/profile/${comment.authorId}`}
                aria-label={`View profile of ${authorName}`}
                className={styles.authorLink}
              >{handle}</Link>
            ) : handle}
          </span>
          <span aria-hidden="true" className="font-mono text-xs text-ink-4">·</span>
          <time dateTime={comment.createdAt} className="font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
            {timeAgo(comment.createdAt)}
          </time>
          <span aria-hidden="true" className="font-mono text-xs text-ink-4">·</span>
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
            {comment.voteScore ?? 0} {(comment.voteScore ?? 0) === 1 ? "vote" : "votes"}
          </span>
        </div>

        {/* Content */}
        <p className="text-md text-ink-2 leading-[1.65] whitespace-pre-wrap mb-4">{comment.content}</p>

        {/* Action footer: vote · reply · report */}
        <div className="flex items-center gap-5">
          <CommentVote
            threadId={threadId}
            commentId={comment.commentId}
            initialScore={comment.voteScore ?? 0}
          />
          {depth < 3 && (
            isDemo ? (
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
                Demo — <a href="/register" className="text-red no-underline font-medium normal-case">sign up</a> to reply
              </span>
            ) : isAuthed ? (
              <button
                type="button"
                onClick={() => setReplying(r => !r)}
                aria-expanded={replying}
                aria-label={replying ? `Cancel reply to ${authorName}` : `Reply to ${authorName}`}
                data-replying={replying ? "true" : undefined}
                className="font-mono text-xs uppercase tracking-[0.12em] text-ink-3 hover:text-ink cursor-pointer bg-transparent border-0 p-0"
              >
                {replying ? "Cancel" : "Reply"}
              </button>
            ) : (
              <Link
                href={`/login?from=${encodeURIComponent(pathname)}`}
                className="font-mono text-xs uppercase tracking-[0.12em] text-ink-3 hover:text-ink no-underline"
              >
                Sign in to reply
              </Link>
            )
          )}
          <ReportButton kind="comment" targetId={comment.commentId} />
        </div>

        {/* Inline reply form */}
        {replying && (
          <InlineReplyForm
            threadId={threadId}
            parentCommentId={comment.commentId}
            onDone={() => setReplying(false)}
          />
        )}
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div role="list" aria-label={`Replies to ${authorName}`}>
          {comment.replies.map((reply, i) => (
            <div key={reply.commentId} role="listitem">
              <CommentNode
                comment={reply}
                depth={depth + 1}
                threadId={threadId}
                isAuthed={isAuthed}
                isLast={i === comment.replies!.length - 1}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export function CommentTree({
  comments,
  depth,
  threadId,
  isAuthed,
}: {
  comments: Comment[];
  depth: number;
  threadId: string;
  isAuthed: boolean;
}) {
  if (comments.length === 0) {
    return (
      <p className="text-base text-ink-3 italic py-6">No comments yet — be the first!</p>
    );
  }
  return (
    <div role="list" aria-label="Thread comments">
      {comments.map((comment, i) => (
        <div key={comment.commentId} role="listitem">
          <CommentNode
            comment={comment}
            depth={depth}
            threadId={threadId}
            isAuthed={isAuthed}
            isLast={i === comments.length - 1}
          />
        </div>
      ))}
    </div>
  );
}
