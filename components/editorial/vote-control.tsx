"use client";

import { useVoteOptimistic } from "@/hooks/use-vote-optimistic";
import { VoteArrow } from "@/components/editorial/vote-arrow";
import { cn } from "@/lib/utils";
import styles from "./vote-control.module.css";

/**
 * <VoteControl>
 *
 * Unified vote UI for both threads and comments.
 *
 * orientation="column" (default) — vertical arrow / score / arrow stack,
 *   used in thread feed cards.
 * orientation="row" — horizontal arrow score arrow strip,
 *   used in thread action bars and comment footers.
 *
 * targetType follows the API numeric enum: 0 = thread, 1 = comment.
 */
export function VoteControl({
  threadId,
  targetType,
  targetId,
  initialScore,
  orientation = "column",
  size = 12,
}: {
  threadId: string;
  /** 0 = thread, 1 = comment */
  targetType: 0 | 1;
  targetId: string;
  initialScore: number;
  orientation?: "column" | "row";
  size?: number;
}) {
  const { score, voted, vote } = useVoteOptimistic({
    threadId,
    targetType,
    targetId,
    initialScore,
    redirectOn401: targetType === 0,
  });

  const isRow = orientation === "row";

  const wrapperClass = isRow
    ? "flex items-center gap-2 shrink-0"
    : "flex flex-col items-center gap-2 shrink-0 w-20";

  const scoreClass = isRow
    ? "text-base font-bold font-serif leading-none min-w-[28px] text-center"
    : "text-base font-bold font-serif leading-none";

  // Thread column uses larger buttons; comment row uses compact
  const sizeVariant = isRow ? styles.sm : styles.lg;

  return (
    <div className={cn(wrapperClass, sizeVariant)} role="group" aria-label="Vote">
      <button
        type="button"
        onClick={() => vote(1)}
        aria-label="Upvote"
        aria-pressed={voted === 1}
        data-voted={voted === 1 ? "true" : undefined}
        className={cn(styles.voteBtn, styles.voteBtnUp)}
        style={{
          background: voted === 1 ? "var(--success-s)" : undefined,
          color: voted === 1 ? "var(--success)" : undefined,
        }}
      >
        <VoteArrow direction="up" active={voted === 1} size={size} />
      </button>

      <span
        className={scoreClass}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${score} votes`}
        style={{
          color: voted === 1 ? "var(--success)" : voted === -1 ? "var(--danger)" : "var(--ink-2)",
        }}
      >
        {score}
      </span>

      <button
        type="button"
        onClick={() => vote(-1)}
        aria-label="Downvote"
        aria-pressed={voted === -1}
        data-voted={voted === -1 ? "true" : undefined}
        className={cn(styles.voteBtn, styles.voteBtnDown)}
        style={{
          background: voted === -1 ? "var(--danger-s)" : undefined,
          color: voted === -1 ? "var(--danger)" : undefined,
        }}
      >
        <VoteArrow direction="down" active={voted === -1} size={size} />
      </button>
    </div>
  );
}
