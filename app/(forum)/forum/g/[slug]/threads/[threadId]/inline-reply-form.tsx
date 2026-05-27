"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema, CreateCommentInput } from "@/schemas/forum";
import { useCreateComment } from "@/hooks/use-forum";
import { Btn, Textarea } from "@/components/editorial";

interface InlineReplyFormProps {
  threadId: string;
  parentCommentId: string;
  onDone: () => void;
}

export function InlineReplyForm({ threadId, parentCommentId, onDone }: InlineReplyFormProps) {
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
      className="mt-5 p-6 bg-paper-2 flex flex-col gap-4 border-ink"
    >
      <Textarea
        {...register("content")}
        label="Your reply"
        rows={3}
        autoFocus
        placeholder="Write a reply…"
        error={errors.content?.message}
      />
      <div className="flex gap-4">
        <Btn type="submit" variant="primary" size="sm" disabled={createComment.isPending}>
          {createComment.isPending ? "Posting…" : "Post reply"}
        </Btn>
        <Btn type="button" variant="secondary" size="sm" onClick={onDone}>Cancel</Btn>
      </div>
    </form>
  );
}
