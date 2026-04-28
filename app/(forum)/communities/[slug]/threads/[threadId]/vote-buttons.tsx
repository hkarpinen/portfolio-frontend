"use client";

import { useEffect, useState } from "react";
import { useCastVote } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";
import styles from "./vote-buttons.module.css";

interface VoteButtonsProps {
  threadId: string;
  targetType: 0 | 1;
  targetId: string;
  initialScore: number;
}

export function VoteButtons({ threadId, targetType, targetId, initialScore }: VoteButtonsProps) {
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

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "4px", flexShrink: 0, width: "40px",
    }}>
      <button
        onClick={() => vote(1)}
        aria-label="Upvote"
        data-voted={voted === 1 ? "true" : undefined}
        className={`${styles.voteBtn} ${styles.voteBtnUp}`}
        style={{
          background: voted === 1 ? "var(--success-s)" : undefined,
          color: voted === 1 ? "var(--success)" : undefined,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill={voted === 1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 4l8 8H4l8-8z" />
        </svg>
      </button>

      <span style={{
        fontSize: "12px", fontWeight: "700",
        color: voted === 1 ? "var(--success)" : voted === -1 ? "var(--danger)" : "var(--text-2)",
        fontFamily: "var(--ff-display)",
        lineHeight: "1",
      }}>
        {score}
      </span>

      <button
        onClick={() => vote(-1)}
        aria-label="Downvote"
        data-voted={voted === -1 ? "true" : undefined}
        className={`${styles.voteBtn} ${styles.voteBtnDown}`}
        style={{
          background: voted === -1 ? "var(--danger-s)" : undefined,
          color: voted === -1 ? "var(--danger)" : undefined,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill={voted === -1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 20l-8-8h16l-8 8z" />
        </svg>
      </button>
    </div>
  );
}