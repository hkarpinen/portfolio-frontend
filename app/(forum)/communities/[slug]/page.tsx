import Link from "next/link";
import { notFound } from "next/navigation";

import { SERVER_API } from "@/lib/api-url";
import { CommunityActions } from "./community-actions";

export const dynamic = 'force-dynamic';

const API_BASE = SERVER_API;

interface Community {
  communityId: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount?: number;
}

interface Thread {
  threadId: string;
  title: string;
  authorUsername?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  voteScore?: number;
  commentCount?: number;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

async function getCommunity(slug: string): Promise<Community | null> {
  try {
    const res = await fetch(`${API_BASE}/api/forum/communities/by-name/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getThreads(communityId: string): Promise<Thread[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/forum/threads?communityId=${communityId}&page=1&pageSize=30`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.items ?? data ?? [];
  } catch {
    return [];
  }
}

export default async function CommunityPage({
  params,
}: {
  params: { slug: string };
}) {
  const community = await getCommunity(params.slug);
  if (!community) notFound();
  const threads = await getThreads(community.communityId);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Community header */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", minWidth: 0 }}>
            {community.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={community.imageUrl}
                alt=""
                style={{ width: "64px", height: "64px", borderRadius: "14px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }}
              />
            ) : (
              <div style={{
                width: "64px", height: "64px", borderRadius: "14px",
                background: "var(--accent-subtle)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px", fontWeight: 700, color: "var(--accent)",
                fontFamily: "var(--ff-display)",
              }}>
                {community.name[0].toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "24px", color: "var(--text)", margin: 0 }}>
                {community.name}
              </h1>
              {community.description && (
                <p style={{ color: "var(--text-2)", marginTop: "4px", fontSize: "14px" }}>{community.description}</p>
              )}
              {community.memberCount !== undefined && (
                <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
                  {community.memberCount.toLocaleString()} members
                </p>
              )}
            </div>
          </div>
          <CommunityActions communityId={community.communityId} slug={params.slug} />
        </div>
      </div>

      {/* Threads header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Threads
        </span>
        <Link
          href={`/communities/${params.slug}/threads/new`}
          style={{
            background: "var(--accent)", color: "#fff",
            padding: "6px 14px", borderRadius: "12px",
            fontSize: "12px", fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + New Thread
        </Link>
      </div>

      {threads.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "56px 24px",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", boxShadow: "var(--shadow-sm)", gap: "12px",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "var(--accent-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px",
          }}>
            💬
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>No threads yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Start the first discussion</p>
          <Link
            href={`/communities/${params.slug}/threads/new`}
            style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}
          >
            Create a thread →
          </Link>
        </div>
      ) : (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)",
        }}>
          {threads.map((thread, i) => {
            const authorName = thread.authorDisplayName ?? thread.authorUsername;
            return (
              <ThreadRow
                key={thread.threadId}
                thread={thread}
                authorName={authorName}
                slug={params.slug}
                isLast={i === threads.length - 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ThreadRow({ thread, authorName, slug, isLast }: {
  thread: Thread;
  authorName: string | undefined;
  slug: string;
  isLast: boolean;
}) {
  function timeAgoLocal(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <Link
      href={`/communities/${slug}/threads/${thread.threadId}`}
      style={{
        display: "flex", alignItems: "flex-start", gap: "0",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        textDecoration: "none",
      }}
    >
      {/* Vote score column */}
      <div style={{
        width: "48px", flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "16px 8px", gap: "2px",
        borderRight: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{thread.voteScore ?? 0}</span>
        <span style={{ fontSize: "10px", color: "var(--text-3)" }}>pts</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, padding: "14px 16px" }}>
        <p style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: "14px", color: "var(--text)", margin: 0 }}>
          {thread.title}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
          {authorName && (
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {thread.authorAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thread.authorAvatarUrl}
                  alt=""
                  style={{ width: "16px", height: "16px", borderRadius: "9999px", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
                />
              ) : (
                <span style={{
                  width: "16px", height: "16px", borderRadius: "9999px",
                  background: "var(--surface-3)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "8px", fontWeight: 600, color: "var(--text-2)", flexShrink: 0,
                }}>
                  {authorName[0].toUpperCase()}
                </span>
              )}
              <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{authorName}</span>
            </span>
          )}
          {thread.commentCount !== undefined && (
            <>
              <span style={{ fontSize: "12px", color: "var(--text-3)" }}>·</span>
              <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{thread.commentCount} comments</span>
            </>
          )}
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>·</span>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{timeAgoLocal(thread.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
