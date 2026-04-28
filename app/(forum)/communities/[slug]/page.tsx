import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchCommunityBySlugServer, fetchThreadsServer } from "@/lib/api/forum";
import { getSession } from "@/lib/auth/session";
import { CommunityActions } from "./community-actions";
import { timeAgo } from "@/lib/utils";
import type { CommunityDetailResponse, ThreadSummaryResponse } from "@/types/api";

export const dynamic = 'force-dynamic';

async function getThreads(communityId: string): Promise<ThreadSummaryResponse[]> {
  const page = await fetchThreadsServer({ communityId, pageSize: 30 });
  return page?.items ?? [];
}

export default async function CommunityPage({
  params,
}: {
  params: { slug: string };
}) {
  const community = await fetchCommunityBySlugServer(params.slug);
  if (!community) notFound();
  // getThreads depends on community.communityId; getSession is independent —
  // run them in parallel to cut ~one round-trip from the waterfall.
  const [threads, session] = await Promise.all([
    getThreads(community.communityId),
    getSession(),
  ]);
  const isAuthed = !!session;

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
            </div>
          </div>
          <CommunityActions communityId={community.communityId} slug={params.slug} isAuthed={isAuthed} />
        </div>
      </div>

      {/* Threads header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Threads
        </span>
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
            const authorName = thread.authorDisplayName;
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
  thread: ThreadSummaryResponse;
  authorName: string | undefined;
  slug: string;
  isLast: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "0",
      borderBottom: isLast ? "none" : "1px solid var(--border)",
    }}>
      {/* Vote score column */}
      <Link
        href={`/communities/${slug}/threads/${thread.threadId}`}
        style={{
          width: "48px", flexShrink: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "16px 8px", gap: "2px",
          borderRight: "1px solid var(--border)",
          textDecoration: "none",
          alignSelf: "stretch",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{thread.voteScore ?? 0}</span>
        <span style={{ fontSize: "10px", color: "var(--text-3)" }}>pts</span>
      </Link>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, padding: "14px 16px" }}>
        <Link
          href={`/communities/${slug}/threads/${thread.threadId}`}
          style={{ textDecoration: "none" }}
        >
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: "14px", color: "var(--text)", margin: 0 }}>
            {thread.title}
          </p>
        </Link>
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
              {thread.authorId ? (
                <Link
                  href={`/profile/${thread.authorId}`}
                  style={{ fontSize: "12px", color: "var(--text-3)", textDecoration: "none" }}
                >{authorName}</Link>
              ) : (
                <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{authorName}</span>
              )}
            </span>
          )}
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>·</span>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{timeAgo(thread.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
