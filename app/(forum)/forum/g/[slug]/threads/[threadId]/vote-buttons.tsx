"use client";

import { useEffect, useState } from "react";
import { useCastVote } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";
import { VoteArrow } from "@/components/editorial/vote-arrow";
import styles from "./vote-buttons.module.css";

interface VoteButtonsProps {
  threadId: string;
  targetType: 0 | 1;
  targetId: string;
  initialScore: number;
  /**
   * `"column"` (default) renders ▲ / score / ▼ vertically — used in thread row cards.
   * `"row"` renders ▲ score ▼ inline — used inside the thread action bar so the
   * vote control reads as part of the bar instead of a column to its left.
   */
  orientation?: "column" | "row";
}

export function VoteButtons({
  threadId,
  targetType,
  targetId,
  initialScore,
  orientation = "column",
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [voted, setVoted] = useState<1 | -1 | null>(null);

  // Sync with server-rendered score after router.refresh() re-renders the parent
  useEffect(() => {
    setScore(initialScore);
  }, [initialScore]);

  const { mutate: castVote, isPending } = useCastVote(threadId);

  function vote(direction: 1 | -1) {
    if (voted === direction || isPending) return;
    // Optimistic update
    const delta = voted === null ? direction : direction * 2;
    const previous = voted;
    setScore((s) => s + delta);
    setVoted(direction);
    castVote(
      { targetType, targetId, direction },
      {
        onError: (err) => {
          // Roll back
          setScore((s) => s - delta);
          setVoted(previous);
          if (err instanceof ApiError && err.status === 401) {
            window.location.href = "/login";
          }
        },
      }
    );
  }

  const isRow = orientation === "row";
  const wrapperClass = isRow
    ? "flex items-center gap-2 shrink-0"
    : "flex flex-col items-center gap-2 shrink-0 w-20";
  const scoreClass = isRow
    ? "text-base font-bold font-serif leading-none min-w-[28px] text-center"
    : "text-base font-bold font-serif leading-none";

  return (
    <div className={wrapperClass} role="group" aria-label="Vote">
      <button
        onClick={() => vote(1)}
        aria-label="Upvote"
        aria-pressed={voted === 1}
        data-voted={voted === 1 ? "true" : undefined}
        className={`${styles.voteBtn} ${styles.voteBtnUp}`}
        style={{
          background: voted === 1 ? "var(--success-s)" : undefined,
          color: voted === 1 ? "var(--success)" : undefined,
        }}
      >
        <VoteArrow direction="up" active={voted === 1} size={12} />
      </button>

      <span
        className={scoreClass}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${score} votes`}
        style={{ color: voted === 1 ? "var(--success)" : voted === -1 ? "var(--danger)" : "var(--ink-2)" }}
      >
        {score}
      </span>

      <button
        onClick={() => vote(-1)}
        aria-label="Downvote"
        aria-pressed={voted === -1}
        data-voted={voted === -1 ? "true" : undefined}
        className={`${styles.voteBtn} ${styles.voteBtnDown}`}
        style={{
          background: voted === -1 ? "var(--danger-s)" : undefined,
          color: voted === -1 ? "var(--danger)" : undefined,
        }}
      >
        <VoteArrow direction="down" active={voted === -1} size={12} />
      </button>
    </div>
  );
}