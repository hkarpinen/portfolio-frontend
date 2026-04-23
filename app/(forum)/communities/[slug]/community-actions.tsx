"use client";

import Link from "next/link";
import { useCommunityMembership, useJoinCommunity } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";

interface CommunityActionsProps {
  communityId: string;
  slug: string;
}

export function CommunityActions({ communityId, slug }: CommunityActionsProps) {
  const { data: membership, isLoading } = useCommunityMembership(communityId);
  const joinMutation = useJoinCommunity(communityId);

  const joined = membership?.isMember ?? false;

  if (isLoading) {
    return (
      <div style={{
        width: "96px", height: "36px", borderRadius: "10px",
        background: "var(--surface-3)",
        animation: "shimmer 1.6s ease-in-out infinite",
        backgroundImage: "linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)",
        backgroundSize: "200% 100%",
      }} />
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
      {joinMutation.isError && (
        <span style={{ fontSize: "12px", color: "var(--danger)" }}>
          {joinMutation.error instanceof ApiError ? joinMutation.error.message : "Failed to join."}
        </span>
      )}
      {joined ? (
        <Link
          href={`/communities/${slug}/threads/new`}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "10px",
            background: "var(--accent)", color: "#fff",
            fontSize: "13px", fontWeight: "600", textDecoration: "none",
            transition: "background 110ms",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--accent-hi)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--accent)"}
        >
          + New thread
        </Link>
      ) : (
        <button
          onClick={() => joinMutation.mutate(undefined, {
            onError: (err) => {
              if (err instanceof ApiError && err.status === 401) {
                window.location.href = "/login";
              }
            },
          })}
          disabled={joinMutation.isPending}
          style={{
            padding: "8px 16px", borderRadius: "10px",
            background: "var(--surface-2)", color: "var(--text)",
            border: "1px solid var(--border)",
            fontSize: "13px", fontWeight: "500", cursor: joinMutation.isPending ? "not-allowed" : "pointer",
            transition: "background 110ms",
            opacity: joinMutation.isPending ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!joinMutation.isPending) (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
          onMouseLeave={e => { if (!joinMutation.isPending) (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
        >
          {joinMutation.isPending ? "Joining…" : "Join community"}
        </button>
      )}
    </div>
  );
}
