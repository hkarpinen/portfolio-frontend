"use client";

import { useCommunityMembership, useJoinCommunity } from "@/hooks/use-community";
import { ApiError } from "@/lib/api-client";
import { Btn } from "@/components/editorial";

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
    <Btn
      variant="outline"
      size="sm"
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
      loading={joinMutation.isPending}
    >
      {joinMutation.isPending ? "…" : "Join"}
    </Btn>
  );
}
