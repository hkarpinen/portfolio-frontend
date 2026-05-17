"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema, CreateCommentInput } from "@/schemas/forum";
import { useCreateComment, useCastVote } from "@/hooks/use-forum";
import type { Comment } from "@/types/forum";
import styles from "./comment-tree.module.css";

// Compact horizontal vote controls for comments
function CommentVote({ threadId, commentId, initialScore }: { threadId: string; commentId: string; initialScore: number }) {
  const [score, setScore] = useState(initialScore);
  const [voted, setVoted] = useState<1 | -1 | null>(null);

  // Sync with server data after router.refresh() re-renders the parent server component
  useEffect(() => {
    setScore(initialScore);
  }, [initialScore]);

  const { mutate: castVote, isPending } = useCastVote(threadId);

  function vote(direction: 1 | -1) {
    if (voted === direction || isPending) return;
    const delta = voted === null ? direction : direction * 2;
    const previous = voted;
    setScore(s => s + delta);
    setVoted(direction);
    castVote(
      { targetType: 1, targetId: commentId, direction },
      {
        onError: () => {
          setScore(s => s - delta);
          setVoted(previous);
        },
      }
    );
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => vote(1)}
        aria-label="Upvote"
        title="Upvote"
        data-voted={voted === 1 ? "true" : undefined}
        className={`${styles.voteBtn} ${styles.voteBtnUp}`}
        style={{
          cursor: isPending ? "not-allowed" : "pointer",
          background: voted === 1 ? "var(--success-s)" : undefined,
          color: voted === 1 ? "var(--success)" : undefined,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill={voted === 1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 4l8 8H4l8-8z" />
        </svg>
      </button>
      <span className="text-sm font-bold min-w-[16px] text-center font-serif" style={{ color: voted === 1 ? "var(--success)" : voted === -1 ? "var(--danger)" : "var(--text-3)" }}>
        {score}
      </span>
      <button
        onClick={() => vote(-1)}
        aria-label="Downvote"
        title="Downvote"
        data-voted={voted === -1 ? "true" : undefined}
        className={`${styles.voteBtn} ${styles.voteBtnDown}`}
        style={{
          cursor: isPending ? "not-allowed" : "pointer",
          background: voted === -1 ? "var(--danger-s)" : undefined,
          color: voted === -1 ? "var(--danger)" : undefined,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill={voted === -1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 20l-8-8h16l-8 8z" />
        </svg>
      </button>
    </div>
  );
}

function InlineReplyForm({
  threadId,
  parentCommentId,
  onDone,
}: {
  threadId: string;
  parentCommentId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const createComment = useCreateComment(threadId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
  });

  function onSubmit(data: CreateCommentInput) {
    createComment.mutate({ content: data.content, parentCommentId }, {
      onSuccess: () => {
        reset();
        router.refresh();
        onDone();
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-5 p-6 bg-paper-2 flex flex-col gap-4" style={{ border: "1.5px solid var(--ink)" }}
    >
      <textarea
        {...register("content")}
        rows={3}
        autoFocus
        placeholder="Write a reply…"
        className="w-full bg-paper py-4 px-5 text-base text-ink outline-none leading-[1.6] font-body" style={{ border: `1px solid ${errors.content ? "var(--danger)" : "var(--ink-3)"}`, resize: "vertical", transition: "border-color 110ms, box-shadow 110ms" }}
        onFocus={e => {
          e.currentTarget.style.borderColor = "var(--ink)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = errors.content ? "var(--danger)" : "var(--ink-3)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {errors.content && (
        <span className="text-sm text-red">{errors.content.message}</span>
      )}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={createComment.isPending}
          className={styles.replySubmit}
        >
          {createComment.isPending ? "Posting…" : "Post reply"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className={styles.replyCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

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
  const initials = authorName[0].toUpperCase();
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
              className="w-12 h-12 object-cover shrink-0" style={{ border: "1.5px solid var(--ink)" }}
            />
          ) : (
            <span className="w-12 h-12 bg-paper-3 text-ink-2 flex items-center justify-center text-sm font-bold shrink-0" style={{ border: "1.5px solid var(--ink)" }}>
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
    <section className="bg-paper overflow-hidden shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
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