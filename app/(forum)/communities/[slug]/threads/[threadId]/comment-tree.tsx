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
    <div style={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
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
      <span style={{
        fontSize: "var(--ts-meta)", fontWeight: "700", minWidth: "16px", textAlign: "center",
        color: voted === 1 ? "var(--success)" : voted === -1 ? "var(--danger)" : "var(--text-3)",
        fontFamily: "var(--ff-display)",
      }}>
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
      style={{
        marginTop: "10px",
        padding: "12px",
        background: "var(--surface-2)",
        borderRadius: "12px",
        border: "1px solid var(--border)",
        display: "flex", flexDirection: "column", gap: "8px",
      }}
    >
      <textarea
        {...register("content")}
        rows={3}
        autoFocus
        placeholder="Write a reply…"
        style={{
          width: "100%",
          background: "var(--surface)",
          border: `1px solid ${errors.content ? "var(--danger)" : "var(--border)"}`,
          borderRadius: "8px",
          padding: "8px 10px",
          fontSize: "var(--ts-body-sm)",
          color: "var(--text)",
          outline: "none",
          resize: "vertical",
          lineHeight: "1.6",
          fontFamily: "var(--ff-body)",
          transition: "border-color 110ms, box-shadow 110ms",
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = errors.content ? "var(--danger)" : "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {errors.content && (
        <span style={{ fontSize: "var(--ts-meta)", color: "var(--danger)" }}>{errors.content.message}</span>
      )}
      <div style={{ display: "flex", gap: "8px" }}>
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
  "var(--accent)",         // depth 1
  "var(--accent-v)",       // depth 2
  "var(--border-2)",       // depth 3
  "var(--border)",         // depth 4+
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
      <div style={{ paddingTop: "12px", paddingBottom: "4px" }}>
        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          {comment.authorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.authorAvatarUrl}
              alt=""
              style={{
                width: "24px", height: "24px", borderRadius: "9999px",
                objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0,
              }}
            />
          ) : (
            <span style={{
              width: "24px", height: "24px", borderRadius: "9999px",
              background: "var(--surface-3)", color: "var(--text-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "var(--ts-meta)", fontWeight: "700", flexShrink: 0,
              border: "1px solid var(--border)",
            }}>
              {initials}
            </span>
          )}
          <span style={{ fontSize: "var(--ts-body-sm)", fontWeight: "600", color: "var(--text)" }}>
            {comment.authorId ? (
              <Link
                href={`/profile/${comment.authorId}`}
                className={styles.authorLink}
              >{authorName}</Link>
            ) : authorName}
          </span>
          <span style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)" }}>·</span>
          <span style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)" }}>{timeAgo(comment.createdAt)}</span>
        </div>

        {/* Content */}
        <p style={{
          fontSize: "var(--ts-body)", color: "var(--text-2)", lineHeight: "1.65",
          whiteSpace: "pre-wrap",
          marginBottom: "10px",
        }}>{comment.content}</p>

        {/* Action bar: votes + reply */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <CommentVote
            threadId={threadId}
            commentId={comment.commentId}
            initialScore={comment.voteScore ?? 0}
          />
          {depth < 3 && (
            <span style={{ width: "1px", height: "14px", background: "var(--border)", flexShrink: 0 }} />
          )}
          {depth < 3 && (
            isAuthed ? (
              <button
                type="button"
                onClick={() => setReplying(r => !r)}
                data-replying={replying ? "true" : undefined}
                className={styles.replyBtn}
                style={{
                  background: replying ? "var(--accent-subtle)" : undefined,
                  color: replying ? "var(--accent)" : undefined,
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
                style={{
                  fontSize: "var(--ts-meta)", fontWeight: "600", color: "var(--text-3)",
                  textDecoration: "none", padding: "3px 8px", borderRadius: "6px",
                  display: "flex", alignItems: "center", gap: "4px",
                }}
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
        <div style={{ marginTop: "4px" }}>
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
    <section style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span style={{ fontSize: "var(--ts-body-sm)", fontWeight: "600", color: "var(--text-2)", fontFamily: "var(--ff-display)" }}>
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {/* Body */}
      {comments.length === 0 ? (
        <div style={{
          padding: "40px 20px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border-2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>No comments yet — be the first!</p>
        </div>
      ) : (
        <div style={{ padding: "0 20px" }}>
          {comments.map((comment, i) => (
            <div
              key={comment.commentId}
              style={{ borderBottom: i < comments.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <CommentNode comment={comment} depth={depth} threadId={threadId} isAuthed={isAuthed} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}