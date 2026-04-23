"use client";

import { useState } from "react";
import { useCastVote } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";

interface VoteButtonsProps {
  targetType: 0 | 1;
  targetId: string;
  initialScore: number;
}

export function VoteButtons({ targetType, targetId, initialScore }: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [voted, setVoted] = useState<1 | -1 | null>(null);

  const { mutate: castVote, isPending } = useCastVote();

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
        style={{
          width: "28px", height: "28px", borderRadius: "8px",
          border: "none", cursor: "pointer",
          background: voted === 1 ? "var(--success-s)" : "transparent",
          color: voted === 1 ? "var(--success)" : "var(--text-3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 110ms, color 110ms",
          fontSize: "12px",
        }}
        onMouseEnter={e => {
          if (voted !== 1) {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
            (e.currentTarget as HTMLElement).style.color = "var(--success)";
          }
        }}
        onMouseLeave={e => {
          if (voted !== 1) {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
          }
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
        style={{
          width: "28px", height: "28px", borderRadius: "8px",
          border: "none", cursor: "pointer",
          background: voted === -1 ? "var(--danger-s)" : "transparent",
          color: voted === -1 ? "var(--danger)" : "var(--text-3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 110ms, color 110ms",
          fontSize: "12px",
        }}
        onMouseEnter={e => {
          if (voted !== -1) {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
            (e.currentTarget as HTMLElement).style.color = "var(--danger)";
          }
        }}
        onMouseLeave={e => {
          if (voted !== -1) {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
          }
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill={voted === -1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 20l-8-8h16l-8 8z" />
        </svg>
      </button>
    </div>
  );
}
