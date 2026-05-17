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
      <p className="text-base text-ink-3">
        <Link
          href={`/login?from=${encodeURIComponent(pathname)}`}
          className="text-red no-underline font-medium"
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {createComment.isError && (
        <div className="py-[10px] px-[14px] bg-[rgba(178,42,26,0.10)] text-base text-red" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
          {createComment.error instanceof ApiError ? createComment.error.message : "Failed to post comment. Are you logged in?"}
        </div>
      )}
      {submitted && (
        <div className="py-[10px] px-[14px] bg-[rgba(61,107,43,0.10)] text-base text-green" style={{ border: "1px solid oklch(68% 0.18 152 / 0.25)" }}>Comment posted!</div>
      )}
      <textarea
        {...register("content")}
        rows={4}
        placeholder="Share your thoughts…"
        className="w-full bg-paper-2 py-5 px-6 text-base text-ink outline-none leading-[1.6] font-body" style={{ border: `1px solid ${errors.content ? "var(--danger)" : "var(--ink-3)"}`, resize: "vertical", transition: "border-color 110ms, box-shadow 110ms" }}
        onFocus={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--ink)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
        }}
        onBlur={e => {
          (e.currentTarget as HTMLElement).style.borderColor = errors.content ? "var(--danger)" : "var(--ink-3)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
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
          {createComment.isPending ? "Posting…" : "Post comment"}
        </button>
      </div>
    </form>
  );
}
