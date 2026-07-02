"use client";

import { VoteControl } from "@/components/editorial";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { timeAgo, getInitials, authorHandle } from "@/lib/utils";
import type { Comment } from "@/types/forum";
import styles from "./comment-tree.module.css";

import { InlineReplyForm } from "./inline-reply-form";
import { ReportButton } from "./report-button";
import { useIsDemo } from "@/hooks/use-demo";

// Indent rail colors by depth — accent fades as nesting deepens.
const RAIL_COLORS = [
  "var(--amber)", // depth 1
  "var(--border-hi)", // depth 2
  "var(--border)", // depth 3
  "var(--text-4)", // depth 4+
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
      style={{
        display: "flex",
        gap: 14,
        padding: "16px 0",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        paddingLeft: depth > 0 ? 20 : 0,
        borderLeft: depth > 0 ? `2px solid ${railColor(depth)}` : "none",
        marginLeft: depth > 0 ? 10 : 0,
      }}
    >
      {/* Avatar — Terminus `.avatar` (amber) or the author image. */}
      <div>
        {comment.authorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={comment.authorAvatarUrl}
            alt=""
            aria-hidden="true"
            className="avatar object-cover"
            style={{ width: 28, height: 28 }}
          />
        ) : (
          <span className="avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
            {initials}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Author row — amber handle · time */}
        <div className="row" style={{ gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ font: "600 0.72rem/1 var(--ff-mono)", color: "var(--amber)" }}>
            {comment.authorId ? (
              <Link
                href={`/forum/profile/${comment.authorId}`}
                aria-label={`View profile of ${authorName}`}
                className={styles.authorLink}
              >
                {handle}
              </Link>
            ) : (
              handle
            )}
          </span>
          <time className="label" dateTime={comment.createdAt}>
            {timeAgo(comment.createdAt)}
          </time>
        </div>

        {/* Content */}
        <p
          className="whitespace-pre-wrap"
          style={{
            font: "400 0.8rem/1.75 var(--ff-mono)",
            color: "var(--text-2)",
            marginBottom: 10,
          }}
        >
          {comment.content}
        </p>

        {/* Action footer: vote · reply · report */}
        <div className="row" style={{ gap: 10 }}>
          <VoteControl
            threadId={threadId}
            targetType={1}
            targetId={comment.commentId}
            initialScore={comment.voteScore ?? 0}
            orientation="row"
            size={10}
          />
          {depth < 3 &&
            (isDemo ? (
              <span className="label normal-case">
                Demo —{" "}
                <a href="/identity/register" className="font-medium text-accent no-underline">
                  sign up
                </a>{" "}
                to reply
              </span>
            ) : isAuthed ? (
              <button
                type="button"
                onClick={() => setReplying((r) => !r)}
                aria-expanded={replying}
                aria-label={replying ? `Cancel reply to ${authorName}` : `Reply to ${authorName}`}
                data-replying={replying ? "true" : undefined}
                className="btn btn-ghost btn-sm"
              >
                {replying ? "Cancel" : "Reply"}
              </button>
            ) : (
              <Link
                href={`/identity/login?from=${encodeURIComponent(pathname)}`}
                className="btn btn-ghost btn-sm no-underline"
              >
                Sign in to reply
              </Link>
            ))}
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

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div role="list" aria-label={`Replies to ${authorName}`} style={{ marginTop: 6 }}>
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
      </div>
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
    return <p className="py-6 text-base text-ink-3">No comments yet — be the first!</p>;
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
