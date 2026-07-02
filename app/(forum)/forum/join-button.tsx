"use client";

import { useCommunityMembership, useJoinCommunity } from "@/hooks/use-community";
import { ApiError } from "@/lib/api-client";

interface JoinButtonProps {
  communityId: string;
}

/**
 * <JoinButton> — Terminus `.btn` join control used in community tiles.
 * Stops propagation so it stays a standalone action even when a tile's
 * title links elsewhere.
 */
export function JoinButton({ communityId }: JoinButtonProps) {
  const { data: membership, isLoading } = useCommunityMembership(communityId);
  const joinMutation = useJoinCommunity(communityId);

  const joined = membership?.isMember ?? false;

  if (isLoading) {
    return (
      <span
        className="badge shrink-0 opacity-40"
        style={{ height: 28 }}
        aria-hidden="true"
      >
        …
      </span>
    );
  }

  if (joined) {
    return <span className="badge green shrink-0">Joined</span>;
  }

  return (
    <button
      type="button"
      className="btn btn-sm shrink-0"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        joinMutation.mutate(undefined, {
          onError: (err) => {
            if (err instanceof ApiError && err.status === 401) {
              window.location.href = "/identity/login";
            }
          },
        });
      }}
      disabled={joinMutation.isPending}
    >
      {joinMutation.isPending ? "…" : "$ join"}
    </button>
  );
}
