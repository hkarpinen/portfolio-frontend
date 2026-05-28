"use client";

import { Alert, Btn, Textarea } from "@/components/editorial";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateCommentInput } from "@/schemas/forum";
import { createCommentSchema } from "@/schemas/forum";
import { useCreateComment } from "@/hooks/use-forum";
import { useIsDemo } from "@/hooks/use-demo";
import { getErrorMessage } from "@/lib/error-messages";
import { parseMarkdown } from "@/lib/markdown";

interface CommentFormProps {
  threadId: string;
  isAuthed: boolean;
}

export function CommentForm({ threadId, isAuthed }: CommentFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDemo = useIsDemo();
  const [submitted, setSubmitted] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const createComment = useCreateComment(threadId);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CreateCommentInput>({ resolver: zodResolver(createCommentSchema) });

  if (!isAuthed) {
    return (
      <p className="text-base text-ink-3">
        <Link
          href={`/login?from=${encodeURIComponent(pathname)}`}
          className="font-medium text-red no-underline"
        >
          Sign in
        </Link>{" "}
        to leave a comment.
      </p>
    );
  }

  if (isDemo) {
    return (
      <p className="text-base text-ink-3">
        Commenting is not available in the demo.{" "}
        <a href="/register" className="font-medium text-red no-underline">
          Create a free account
        </a>{" "}
        to join the conversation.
      </p>
    );
  }

  function onSubmit(data: CreateCommentInput) {
    createComment.mutate(
      { content: data.content },
      {
        onSuccess: () => {
          reset();
          setPreviewing(false);
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 3000);
          router.refresh();
        },
      },
    );
  }

  async function togglePreview() {
    if (previewing) {
      setPreviewing(false);
      return;
    }
    const content = getValues("content") ?? "";
    setPreviewHtml(await parseMarkdown(content));
    setPreviewing(true);
  }

  // Hidden register for the textarea content so RHF tracks the field while
  // we own the styling and the `id` attribute.
  const contentReg = register("content");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      aria-label="Reply to thread"
    >
      {createComment.isError && (
        <Alert variant="danger">
          {getErrorMessage(createComment.error, "Failed to post comment. Are you logged in?")}
        </Alert>
      )}
      {submitted && <Alert variant="success">Reply posted!</Alert>}

      {previewing ? (
        <div
          className="prose prose-slate min-h-[120px] max-w-none border border-rule-soft bg-paper-2 p-5 text-md leading-[1.7] text-ink-2"
          aria-label="Reply preview"
          dangerouslySetInnerHTML={{
            __html:
              previewHtml.trim() || `<p class="text-ink-3 italic">Nothing to preview yet.</p>`,
          }}
        />
      ) : (
        <Textarea
          {...contentReg}
          id="reply-input"
          rows={5}
          placeholder="Share your thoughts…"
          error={errors.content?.message}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Btn type="button" variant="secondary" size="sm" onClick={togglePreview}>
          {previewing ? "Edit" : "Preview"}
        </Btn>
        <Btn type="submit" variant="primary" size="sm" disabled={createComment.isPending}>
          {createComment.isPending ? "Posting…" : "Post reply →"}
        </Btn>
      </div>
    </form>
  );
}
