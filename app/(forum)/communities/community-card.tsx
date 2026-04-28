"use client";

import Link from "next/link";
import { ApiError } from "@/lib/api-client";
import { useCommunityMembership, useJoinCommunity } from "@/hooks/use-forum";
import type { CommunityActivitySnapshot } from "@/types/api";
import styles from "./community-card.module.css";

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
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ActivityAvatar({ avatarUrl, name }: { avatarUrl?: string; name?: string }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt="" style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    );
  }
  const initial = (name ?? "?")[0].toUpperCase();
  return (
    <div style={{
      width: 18, height: 18, borderRadius: "50%", background: "var(--accent-subtle)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "10px", fontWeight: 700, color: "var(--accent)", flexShrink: 0,
    }}>{initial}</div>
  );
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
      className={styles.card}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "var(--shadow-sm)",
        transition: "box-shadow 180ms ease, transform 180ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <Link href={`/communities/${slug}`} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }}
            />
          ) : (
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: "var(--accent-subtle)", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", fontWeight: 700, color: "var(--accent)",
              fontFamily: "var(--ff-display)",
            }}>
              {name[0].toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: "15px", color: "var(--text)", margin: 0 }}>{name}</h2>
            {description && (
              <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "2px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{description}</p>
            )}
            <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
              {memberCount !== undefined && memberCount > 0 && (
                <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-3)" }}>{memberCount.toLocaleString()} {memberCount === 1 ? "member" : "members"}</span>
              )}
              {threadCount !== undefined && threadCount > 0 && (
                <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-3)" }}>{threadCount.toLocaleString()} {threadCount === 1 ? "thread" : "threads"}</span>
              )}
              {commentCount !== undefined && commentCount > 0 && (
                <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-3)" }}>{commentCount.toLocaleString()} {commentCount === 1 ? "reply" : "replies"}</span>
              )}
            </div>
          </div>
        </Link>

        <div style={{ flexShrink: 0 }}>
          {joined === null ? (
            <div style={{ width: "64px", height: "28px", borderRadius: "9999px", background: "var(--surface-3)" }} className="skeleton" />
          ) : joined ? (
            <span style={{
              fontSize: "11px", fontWeight: 500, color: "var(--text-3)",
              border: "1px solid var(--border)", padding: "2px 8px",
              borderRadius: "9999px", background: "var(--surface-3)",
            }}>
              Joined
            </span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              style={{
                fontSize: "12px", fontWeight: 500,
                background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: "12px",
                padding: "4px 14px", cursor: joining ? "not-allowed" : "pointer",
                opacity: joining ? 0.5 : 1,
              }}
            >
              {joining ? "…" : "Join"}
            </button>
          )}
        </div>
      </div>

      {latestActivity && (
        <Link
          href={`/communities/${slug}/threads/${latestActivity.threadId}`}
          style={{ textDecoration: "none" }}
        >
          <div style={{
            marginTop: "12px",
            paddingTop: "10px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}>
            <ActivityAvatar
              avatarUrl={hasReply ? latestActivity.latestReplyAuthorAvatarUrl : latestActivity.authorAvatarUrl}
              name={hasReply ? latestActivity.latestReplyAuthorDisplayName : latestActivity.authorDisplayName}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: "12px", color: "var(--text-2)", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                <span style={{ fontWeight: 500, color: "var(--text)" }}>
                  {hasReply ? latestActivity.latestReplyAuthorDisplayName ?? "Someone" : latestActivity.authorDisplayName ?? "Someone"}
                </span>
                {" "}
                {hasReply ? "replied in" : "posted"}
                {" "}
                <span style={{ fontWeight: 500, color: "var(--accent)" }}>{latestActivity.threadTitle}</span>
              </p>
            </div>
            {activityTime && (
              <span style={{ fontSize: "11px", color: "var(--text-3)", flexShrink: 0 }}>
                {formatRelative(activityTime)}
              </span>
            )}
          </div>
        </Link>
      )}
    </div>
  );
}
