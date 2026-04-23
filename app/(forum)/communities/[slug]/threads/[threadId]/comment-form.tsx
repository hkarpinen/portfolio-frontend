"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema, CreateCommentInput } from "@/schemas/forum";
import { useCreateComment } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";

interface CommentFormProps {
  threadId: string;
}

export function CommentForm({ threadId }: CommentFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const createComment = useCreateComment(threadId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentInput>({ resolver: zodResolver(createCommentSchema) });

  function onSubmit(data: CreateCommentInput) {
    createComment.mutate({ content: data.content }, {
      onSuccess: () => {
        reset();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {createComment.isError && (
        <div style={{
          padding: "10px 14px", borderRadius: "10px",
          background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)",
          fontSize: "13px", color: "var(--danger)",
        }}>
          {createComment.error instanceof ApiError ? createComment.error.message : "Failed to post comment. Are you logged in?"}
        </div>
      )}
      {submitted && (
        <div style={{
          padding: "10px 14px", borderRadius: "10px",
          background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.25)",
          fontSize: "13px", color: "var(--success)",
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
          fontSize: "13px",
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
        <span style={{ fontSize: "11px", color: "var(--danger)" }}>{errors.content.message}</span>
      )}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="submit"
          disabled={createComment.isPending}
          style={{
            padding: "8px 18px", borderRadius: "10px",
            background: createComment.isPending ? "var(--surface-3)" : "var(--accent)",
            color: createComment.isPending ? "var(--text-3)" : "#fff",
            border: "none", cursor: createComment.isPending ? "not-allowed" : "pointer",
            fontSize: "13px", fontWeight: "600", fontFamily: "var(--ff-display)",
            transition: "background 110ms",
          }}
          onMouseEnter={e => { if (!createComment.isPending) (e.currentTarget as HTMLElement).style.background = "var(--accent-hi)"; }}
          onMouseLeave={e => { if (!createComment.isPending) (e.currentTarget as HTMLElement).style.background = "var(--accent)"; }}
        >
          {createComment.isPending ? "Posting…" : "Post comment"}
        </button>
      </div>
    </form>
  );
}
