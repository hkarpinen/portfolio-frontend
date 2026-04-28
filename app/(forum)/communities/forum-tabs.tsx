"use client";

import { useState } from "react";
import Link from "next/link";
import { ThreadCard } from "@/components/ui/thread-card";
import { CommunityAvatar } from "@/components/ui/community-avatar";
import type { CommunitySummaryResponse, ThreadSummaryResponse } from "@/types/forum";

interface ForumTabsProps {
  communities: CommunitySummaryResponse[];
  feedThreads: ThreadSummaryResponse[];
  hotThreads: ThreadSummaryResponse[];
  communitySlugMap: Record<string, string>; // communityId -> slug
}

export function ForumTabs({
  communities,
  feedThreads,
  hotThreads,
  communitySlugMap,
}: ForumTabsProps) {
  const [tab, setTab] = useState<"Communities" | "Feed" | "Hot">("Feed");

  const tabs: Array<{ label: "Communities" | "Feed" | "Hot"; count?: number }> = [
    { label: "Feed" },
    { label: "Hot" },
    { label: "Communities", count: communities.length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Tab bar */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: "0" }}>
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setTab(t.label)}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: tab === t.label ? 600 : 400,
              color: tab === t.label ? "var(--text)" : "var(--text-3)",
              borderBottom: tab === t.label ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: "-1px",
              background: "none",
              border: "none",
              borderBottom: tab === t.label ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span style={{ fontSize: "11px", background: "var(--surface-2)", borderRadius: "9999px", padding: "1px 6px", color: "var(--text-3)" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Communities tab */}
      {tab === "Communities" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {communities.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🏘️</div>
              <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>No communities yet</p>
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Be the first to create one</p>
              <Link href="/communities/new" style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>Create the first one →</Link>
            </div>
          ) : (
            communities.map((community) => (
              <Link
                key={community.communityId}
                href={`/communities/${community.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="community-card"
                  style={{
                    padding: "16px 18px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "transform 200ms var(--ease-spring), box-shadow 200ms",
                  }}
                >
                  <CommunityAvatar community={community} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "14px", color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {community.name}
                    </p>
                    {community.description && (
                      <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                        {community.description}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", margin: 0 }}>{community.memberCount.toLocaleString()}</p>
                    <p style={{ fontSize: "10px", color: "var(--text-3)", marginTop: "2px" }}>members</p>
                  </div>
                  <Link
                    href={`/communities/${community.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ padding: "6px 12px", borderRadius: "var(--r-md)", fontSize: "12px", fontWeight: 600, color: "var(--text-2)", border: "1px solid var(--border)", background: "var(--surface-2)", textDecoration: "none", flexShrink: 0 }}
                  >
                    Join
                  </Link>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Feed tab */}
      {tab === "Feed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {feedThreads.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📰</div>
              <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>No threads yet</p>
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Join a community to see threads here</p>
            </div>
          ) : (
            feedThreads.map((thread) => (
              <ThreadCard
                key={thread.threadId}
                thread={thread}
                slug={communitySlugMap[thread.communityId] ?? ""}
                showCommunity
              />
            ))
          )}
        </div>
      )}

      {/* Hot tab */}
      {tab === "Hot" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {hotThreads.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🔥</div>
              <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>Nothing trending yet</p>
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Hot threads will appear here</p>
            </div>
          ) : (
            hotThreads.map((thread) => (
              <ThreadCard
                key={thread.threadId}
                thread={thread}
                slug={communitySlugMap[thread.communityId] ?? ""}
                showCommunity
              />
            ))
          )}
        </div>
      )}

      <style>{`
        .community-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}
