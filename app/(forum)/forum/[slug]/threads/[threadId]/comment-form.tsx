"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema, CreateCommentInput } from "@/schemas/forum";
import { useCreateComment } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";
import { Alert, Btn, Textarea } from "@/components/editorial";

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
        <Alert variant="danger">
          {createComment.error instanceof ApiError ? createComment.error.message : "Failed to post comment. Are you logged in?"}
        </Alert>
      )}
      {submitted && <Alert variant="success">Comment posted!</Alert>}
      <Textarea
        {...register("content")}
        rows={4}
        placeholder="Share your thoughts…"
        error={errors.content?.message}
      />
      <div className="flex gap-4">
        <Btn type="submit" variant="primary" size="sm" disabled={createComment.isPending}>
          {createComment.isPending ? "Posting…" : "Post comment"}
        </Btn>
      </div>
    </form>
  );
}
