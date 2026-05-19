"use client";

import { useEffect, useState } from "react";
import { useCastVote } from "@/hooks/use-forum";
import { VoteArrow } from "@/components/editorial/vote-arrow";
import styles from "./comment-tree.module.css";

interface CommentVoteProps {
  threadId: string;
  commentId: string;
  initialScore: number;
}

export function CommentVote({ threadId, commentId, initialScore }: CommentVoteProps) {
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
    <div className="flex items-center gap-1 shrink-0">
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
        <VoteArrow direction="up" active={voted === 1} size={10} />
      </button>
      <span
        className="text-sm font-bold min-w-[16px] text-center font-serif"
        style={{ color: voted === 1 ? "var(--success)" : voted === -1 ? "var(--danger)" : "var(--text-3)" }}
      >
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
        <VoteArrow direction="down" active={voted === -1} size={10} />
      </button>
    </div>
  );
}
