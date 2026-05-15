"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema, CreateCommentInput } from "@/schemas/forum";
import { useCreateComment } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";
import styles from "./comment-tree.module.css";

interface CommentFormProps {
  threadId: string;
  isAuthed: boolean;
}

export function CommentForm({ threadId, isAuthed }: CommentFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const createComment = useCreateComment(threadId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentInput>({ resolver: zodResolver(createCommentSchema) });

  if (!isAuthed) {
    return (
      <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>
        <Link
          href={`/login?from=${encodeURIComponent(pathname)}`}
          style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}
        >
          Sign in
        </Link>
        {" "}to leave a comment.
      </p>
    );
  }

  function onSubmit(data: CreateCommentInput) {
    createComment.mutate({ content: data.content }, {
      onSuccess: () => {
        reset();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        router.refresh();
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {createComment.isError && (
        <div style={{
          padding: "10px 14px", borderRadius: "10px",
          background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)",
          fontSize: "var(--ts-body-sm)", color: "var(--danger)",
        }}>
          {createComment.error instanceof ApiError ? createComment.error.message : "Failed to post comment. Are you logged in?"}
        </div>
      )}
      {submitted && (
        <div style={{
          padding: "10px 14px", borderRadius: "10px",
          background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.25)",
          fontSize: "var(--ts-body-sm)", color: "var(--success)",
        }}>Comment posted!</div>
      )}
      <textarea
        {...register("content")}
        rows={4}
        placeholder="Share your thoughts…"
        style={{
          width: "100%",
          background: "var(--surface-2)",
          border: `1px solid ${errors.content ? "var(--danger)" : "var(--border)"}`,
          borderRadius: "12px",
          padding: "10px 12px",
          fontSize: "var(--ts-body-sm)",
          color: "var(--text)",
          outline: "none",
          resize: "vertical",
          lineHeight: "1.6",
          transition: "border-color 110ms, box-shadow 110ms",
          fontFamily: "var(--ff-body)",
        }}
        onFocus={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-subtle)";
        }}
        onBlur={e => {
          (e.currentTarget as HTMLElement).style.borderColor = errors.content ? "var(--danger)" : "var(--border)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
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
          {createComment.isPending ? "Posting…" : "Post comment"}
        </button>
      </div>
    </form>
  );
}
