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
      <div className="w-[58px] h-[30px] bg-paper-3 shrink-0" />
    );
  }

  if (joined) {
    return (
      <span className="py-[5px] px-[12px] text-base font-semibold text-ink-3 bg-paper-2 shrink-0 border-ink">
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
      className="py-[5px] px-[12px] text-base font-semibold text-red bg-red-soft shrink-0 [border:1.5px_solid_var(--red)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      {joinMutation.isPending ? "…" : "Join"}
    </button>
  );
}
