"use client";
import { useEffect, useState } from "react";
import { useCastVote } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";

/**
 * Shared optimistic-update logic for thread and comment voting.
 *
 * Mirrors the behaviour of the original vote-buttons.tsx and comment-vote.tsx:
 * - No toggle (clicking the active direction is a no-op)
 * - Flip: switching directions adjusts score by ±2
 * - isPending guard prevents double-fires mid-flight
 * - Roll back on error; redirect to /login on 401 (thread votes only)
 */
export function useVoteOptimistic({
  threadId,
  targetType,
  targetId,
  initialScore,
  redirectOn401 = false,
}: {
  threadId: string;
  /** 0 = thread, 1 = comment — matches the castVote API numeric enum */
  targetType: 0 | 1;
  targetId: string;
  initialScore: number;
  /** When true, redirects to /login on a 401 error (used for thread votes). */
  redirectOn401?: boolean;
}) {
  const [score, setScore] = useState(initialScore);
  const [voted, setVoted] = useState<1 | -1 | null>(null);

  // Sync score when the server re-renders the parent (e.g. after router.refresh())
  useEffect(() => {
    setScore(initialScore);
  }, [initialScore]);

  const { mutate: castVote, isPending } = useCastVote(threadId);

  function vote(direction: 1 | -1) {
    if (voted === direction || isPending) return;
    const delta = voted === null ? direction : direction * 2;
    const previous = voted;
    setScore((s) => s + delta);
    setVoted(direction);
    castVote(
      { targetType, targetId, direction },
      {
        onError: (err) => {
          setScore((s) => s - delta);
          setVoted(previous);
          if (redirectOn401 && err instanceof ApiError && err.status === 401) {
            window.location.href = "/identity/login";
          }
        },
      },
    );
  }

  return { score, voted, vote, isPending };
}
