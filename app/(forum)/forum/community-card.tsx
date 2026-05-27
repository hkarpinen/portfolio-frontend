"use client";

import Link from "next/link";
import { ApiError } from "@/lib/api-client";
import { useCommunityMembership, useJoinCommunity } from "@/hooks/use-community";
import type { CommunityActivitySnapshot } from "@/types/forum";
import { formatShortDate } from "@/lib/formatting";
import { UserInitials } from "@/components/editorial/user-initials";


interface CommunityCardProps {
  communityId: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount?: number;
  threadCount?: number;
  commentCount?: number;
  latestActivity?: CommunityActivitySnapshot;
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(dateStr);
}

function ActivityAvatar({ avatarUrl, name }: { avatarUrl?: string; name?: string }) {
  return <UserInitials name={name} avatarUrl={avatarUrl} size="sm" />;
}

export function CommunityCard({ communityId, slug, name, description, imageUrl, memberCount, threadCount, commentCount, latestActivity }: CommunityCardProps) {
  const { data: membership } = useCommunityMembership(communityId);
  const joinMutation = useJoinCommunity(communityId);

  const joined = membership === undefined ? null : (membership?.isMember ?? false);
  const joining = joinMutation.isPending;

  function handleJoin(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    joinMutation.mutate(undefined, {
      onError: (err) => {
        if (err instanceof ApiError && err.status === 401) window.location.href = "/login";
      },
    });
  }

  const hasReply = !!latestActivity?.latestReplyAt;
  const activityTime = latestActivity
    ? hasReply
      ? latestActivity.latestReplyAt!
      : latestActivity.threadCreatedAt
    : null;

  return (
    <div
      className="bg-paper p-10 shadow-card transition-[box-shadow,transform] duration-[180ms] ease-out hover:shadow-stamp border-ink"
    >
      <div className="flex items-start justify-between gap-8">
        <Link href={`/forum/g/${slug}`} className="flex-1 min-w-0 flex items-center gap-6 no-underline">
          <UserInitials name={name} avatarUrl={imageUrl} size="lg" className="w-24 h-24 text-lg border-ink" />
          <div className="min-w-0">
            <h2 className="font-serif font-semibold text-xl text-ink m-0">{name}</h2>
            {description && (
              <p className="text-base text-ink-2 mt-1 line-clamp-2">{description}</p>
            )}
            <div className="flex gap-8 mt-2">
              {memberCount !== undefined && memberCount > 0 && (
                <span className="text-sm font-medium text-ink-3">{memberCount.toLocaleString()} {memberCount === 1 ? "member" : "members"}</span>
              )}
              {threadCount !== undefined && threadCount > 0 && (
                <span className="text-sm font-medium text-ink-3">{threadCount.toLocaleString()} {threadCount === 1 ? "thread" : "threads"}</span>
              )}
              {commentCount !== undefined && commentCount > 0 && (
                <span className="text-sm font-medium text-ink-3">{commentCount.toLocaleString()} {commentCount === 1 ? "reply" : "replies"}</span>
              )}
            </div>
          </div>
        </Link>

        <div className="shrink-0">
          {joined === null ? (
            <div  className="skeleton w-32 h-[28px] bg-paper-3" />
          ) : joined ? (
            <span className="text-sm font-medium text-ink-3 py-1 px-4 bg-paper-3 border-ink">
              Joined
            </span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="text-base font-medium bg-red text-white py-[4px] px-[14px] border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {joining ? "…" : "Join"}
            </button>
          )}
        </div>
      </div>

      {latestActivity && (
        <Link
          href={`/forum/g/${slug}/threads/${latestActivity.threadId}`}
          className="no-underline"
        >
          <div className="mt-6 pt-5 flex items-center gap-4 min-w-0 border-ink-t">
            <ActivityAvatar
              avatarUrl={hasReply ? latestActivity.latestReplyAuthorAvatarUrl : latestActivity.authorAvatarUrl}
              name={hasReply ? latestActivity.latestReplyAuthorDisplayName : latestActivity.authorDisplayName}
            />
            <div className="min-w-0 flex-1">
              <p className="text-base text-ink-2 m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="font-medium text-ink">
                  {hasReply ? latestActivity.latestReplyAuthorDisplayName ?? "Someone" : latestActivity.authorDisplayName ?? "Someone"}
                </span>
                {" "}
                {hasReply ? "replied in" : "posted"}
                {" "}
                <span className="font-medium text-red">{latestActivity.threadTitle}</span>
              </p>
            </div>
            {activityTime && (
              <span className="text-sm text-ink-3 shrink-0">
                {formatRelative(activityTime)}
              </span>
            )}
          </div>
        </Link>
      )}
    </div>
  );
}
