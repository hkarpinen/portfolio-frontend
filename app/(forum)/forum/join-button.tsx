"use client";

import { Btn } from "@/components/editorial";
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
    return <div className="h-[30px] w-[58px] shrink-0 bg-paper-3" />;
  }

  if (joined) {
    return (
      <span className="shrink-0 border-ink bg-paper-2 px-6 py-[5px] text-base font-semibold text-ink-3">
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
