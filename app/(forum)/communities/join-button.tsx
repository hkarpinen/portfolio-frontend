"use client";

import { useCommunityMembership, useJoinCommunity } from "@/hooks/use-community";
import { ApiError } from "@/lib/api-client";

interface JoinButtonProps {
  communityId: string;
}

export function JoinButton({ communityId }: JoinButtonProps) {
  const { data: membership, isLoading } = useCommunityMembership(communityId);
  const joinMutation = useJoinCommunity(communityId);

  const joined = membership?.isMember ?? false;

  if (isLoading) {
    return (
      <div style={{
        width: "58px", height: "30px", borderRadius: "var(--r-md)",
        background: "var(--surface-3)", flexShrink: 0,
      }} />
    );
  }

  if (joined) {
    return (
      <span style={{
        padding: "5px 12px", borderRadius: "var(--r-md)", fontSize: "var(--ts-label)",
        fontWeight: 600, color: "var(--text-3)", border: "1px solid var(--border)",
        background: "var(--surface-2)", flexShrink: 0,
      }}>
        Joined
      </span>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        joinMutation.mutate(undefined, {
          onError: (err) => {
            if (err instanceof ApiError && err.status === 401) {
              window.location.href = "/login";
            }
          },
        });
      }}
      disabled={joinMutation.isPending}
      style={{
        padding: "5px 12px", borderRadius: "var(--r-md)", fontSize: "var(--ts-label)",
        fontWeight: 600, color: "var(--accent)", border: "1px solid var(--accent)",
        background: "var(--accent-subtle)", cursor: joinMutation.isPending ? "not-allowed" : "pointer",
        opacity: joinMutation.isPending ? 0.6 : 1,
        flexShrink: 0,
      }}
    >
      {joinMutation.isPending ? "…" : "Join"}
    </button>
  );
}
