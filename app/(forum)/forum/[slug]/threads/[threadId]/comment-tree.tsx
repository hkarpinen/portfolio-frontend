"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { timeAgo, getInitials } from "@/lib/utils";
import type { Comment } from "@/types/forum";
import styles from "./comment-tree.module.css";
import { CommentVote } from "./comment-vote";
import { InlineReplyForm } from "./inline-reply-form";

// Indent rail colors by depth — accent fades as nesting deepens
const RAIL_COLORS = [
  "var(--red)",            // depth 1
  "var(--accent-v)",       // depth 2
  "var(--border-2)",       // depth 3
  "var(--ink-3)",         // depth 4+
];
function railColor(depth: number) {
  return RAIL_COLORS[Math.min(depth - 1, RAIL_COLORS.length - 1)];
}

function CommentNode({
  comment,
  depth,
  threadId,
  isAuthed,
}: {
  comment: Comment;
  depth: number;
  threadId: string;
  isAuthed: boolean;
}) {
  const pathname = usePathname();
  const authorName = comment.authorDisplayName ?? comment.authorUsername ?? "Anonymous";
  const initials = getInitials(authorName);
  const [replying, setReplying] = useState(false);

  return (
    <div
      style={{
        paddingLeft: depth > 0 ? "20px" : "0",
        borderLeft: depth > 0 ? `2px solid ${railColor(depth)}` : "none",
        marginLeft: depth > 0 ? "10px" : "0",
      }}
    >
      <div className="pt-6 pb-2">
        {/* Author row */}
        <div className="flex items-center gap-4 mb-4">
          {comment.authorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.authorAvatarUrl}
              alt=""
              className="w-12 h-12 object-cover shrink-0 border-ink"
            />
          ) : (
            <span className="w-12 h-12 bg-paper-3 text-ink-2 flex items-center justify-center text-sm font-bold shrink-0 border-ink">
              {initials}
            </span>
          )}
          <span className="text-base font-semibold text-ink">
            {comment.authorId ? (
              <Link
                href={`/profile/${comment.authorId}`}
                className={styles.authorLink}
              >{authorName}</Link>
            ) : authorName}
          </span>
          <span className="text-sm text-ink-3">·</span>
          <span className="text-sm text-ink-3">{timeAgo(comment.createdAt)}</span>
        </div>

        {/* Content */}
        <p className="text-md text-ink-2 leading-[1.65] whitespace-pre-wrap mb-5">{comment.content}</p>

        {/* Action bar: votes + reply */}
        <div className="flex items-center gap-6">
          <CommentVote
            threadId={threadId}
            commentId={comment.commentId}
            initialScore={comment.voteScore ?? 0}
          />
          {depth < 3 && (
            <span className="w-[1px] h-[14px] shrink-0" style={{ background: "var(--ink-3)" }} />
          )}
          {depth < 3 && (
            isAuthed ? (
              <button
                type="button"
                onClick={() => setReplying(r => !r)}
                data-replying={replying ? "true" : undefined}
                className={styles.replyBtn}
                style={{
                  background: replying ? "rgba(178,42,26,0.08)" : undefined,
                  color: replying ? "var(--red)" : undefined,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
                Reply
              </button>
            ) : (
              <Link
                href={`/login?from=${encodeURIComponent(pathname)}`}
                className="text-sm font-semibold text-ink-3 no-underline py-[3px] px-[8px] flex items-center gap-2"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
                Reply
              </Link>
            )
          )}
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
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.commentId}
              comment={reply}
              depth={depth + 1}
              threadId={threadId}
              isAuthed={isAuthed}
            />
          ))}
        </div>
      )}
    </div>
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
  return (
    <section className="bg-paper overflow-hidden shadow-stamp border-ink">
      {/* Header */}
      <div className="py-[14px] px-[20px] flex items-center gap-4" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-base font-semibold text-ink-2 font-serif">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {/* Body */}
      {comments.length === 0 ? (
        <div className="py-20 px-10 flex flex-col items-center gap-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border-2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-base text-ink-3">No comments yet — be the first!</p>
        </div>
      ) : (
        <div className="p-[0_20px]">
          {comments.map((comment, i) => (
            <div
              key={comment.commentId}
              style={{ borderBottom: i < comments.length - 1 ? "1.5px solid var(--ink)" : "none" }}
            >
              <CommentNode comment={comment} depth={depth} threadId={threadId} isAuthed={isAuthed} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}