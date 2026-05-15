import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchCommunityBySlugServer } from "@/lib/api/communities";
import { fetchThreadsServer } from "@/lib/api/forum";
import { getSession } from "@/lib/auth/session";
import { CommunityAvatar } from "@/components/ui/community-avatar";
import { ThreadCard } from "@/components/ui/thread-card";
import type { CommunityDetailResponse, ThreadSummaryResponse } from "@/types/forum";

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
  const [threads, session] = await Promise.all([
    getThreads(community.communityId),
    getSession(),
  ]);
  const isAuthed = !!session;

  // bannerColor removed — editorial design uses flat paper backgrounds

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Banner card */}
      <div style={{
        border: "1.5px solid var(--ink)",
        background: "var(--paper-2)",
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 4vw, 36px) 24px",
        boxShadow: "var(--shadow-card)",
      }}>
        {/* Breadcrumb */}
        <div style={{ position: "relative", display: "flex", gap: "5px", alignItems: "center", marginBottom: "18px", fontSize: "var(--ts-label)", color: "var(--text-3)" }}>
          <Link href="/communities" style={{ color: "var(--accent)", fontSize: "var(--ts-label)", textDecoration: "none", fontFamily: "var(--ff-body)" }}>Forum</Link>
          <span>/</span>
          <span style={{ color: "var(--text-2)", fontWeight: 500 }}>{community.name}</span>
        </div>

        {/* Identity row */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <CommunityAvatar community={community} size={60} radius="var(--r-xl)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "var(--ts-h2)", letterSpacing: "-0.02em", lineHeight: "var(--lh-display)", color: "var(--text)", margin: 0 }}>
                {community.name}
              </h1>
              {community.description && (
                <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-2)", marginTop: "4px", lineHeight: 1.4 }}>{community.description}</p>
              )}
              <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                <span style={{ fontSize: "var(--ts-label)", color: "var(--text-3)" }}>
                  <strong style={{ color: "var(--text)", fontWeight: 700 }}>{community.memberCount.toLocaleString()}</strong> members
                </span>
                <span style={{ fontSize: "var(--ts-label)", color: "var(--text-3)" }}>
                  <strong style={{ color: "var(--text)", fontWeight: 700 }}>{community.threadCount.toLocaleString()}</strong> posts
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href={`/communities/${params.slug}/settings`}
              style={{ background: "var(--surface-2)", color: "var(--text-2)", padding: "7px 14px", borderRadius: "var(--r-md)", fontSize: "var(--ts-label)", fontWeight: 600, textDecoration: "none", border: "1px solid var(--border)" }}
            >
              Mod tools
            </Link>
            <Link
              href={`/communities/${params.slug}/threads/new`}
              style={{ background: "var(--accent)", color: "#fff", padding: "7px 14px", borderRadius: "var(--r-md)", fontSize: "var(--ts-label)", fontWeight: 600, textDecoration: "none" }}
            >
              + Post here
            </Link>
          </div>
        </div>
      </div>

      {/* Thread list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <span style={{ fontSize: "var(--ts-meta)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Threads</span>
        {threads.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "56px 24px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-sm)", gap: "12px",
          }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "var(--r-lg)", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--ts-sub)" }}>
              💬
            </div>
            <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-body)", color: "var(--text)" }}>No threads yet</p>
            <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>Start the first discussion</p>
            <Link href={`/communities/${params.slug}/threads/new`} style={{ fontSize: "var(--ts-body-sm)", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
              Create a thread →
            </Link>
          </div>
        ) : (
          threads.map((thread) => (
            <ThreadCard
              key={thread.threadId}
              thread={thread}
              slug={params.slug}
              showCommunity={false}
            />
          ))
        )}
      </div>
    </div>
  );
}
