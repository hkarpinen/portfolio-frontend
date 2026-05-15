"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { ThreadCard } from "@/components/ui/thread-card";
import { CommunityAvatar } from "@/components/ui/community-avatar";
import { JoinButton } from "./join-button";
import type { CommunitySummaryResponse, ThreadSummaryResponse } from "@/types/forum";

interface ForumTabsProps {
  communities: CommunitySummaryResponse[];
  feedThreads: ThreadSummaryResponse[];
  hotThreads: ThreadSummaryResponse[];
  communitySlugMap: Record<string, string>; // communityId -> slug
}

const tabTriggerStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: "var(--ts-label)",
  fontWeight: 400,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--text-3)",
  borderBottom: "2px solid transparent",
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
  marginBottom: "-1px",
  background: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontFamily: "var(--ff-mono)",
  transition: "color 110ms, border-color 110ms",
};

export function ForumTabs({
  communities,
  feedThreads,
  hotThreads,
  communitySlugMap,
}: ForumTabsProps) {
  return (
    <RadixTabs.Root defaultValue="Feed" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Tab bar */}
      <RadixTabs.List style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: "0" }}>
        {(["Feed", "Hot", "Communities"] as const).map((label) => (
          <RadixTabs.Trigger
            key={label}
            value={label}
            style={tabTriggerStyle}
          >
            {label}
            {label === "Communities" && (
              <span style={{ fontSize: "var(--ts-meta)", background: "var(--surface-2)", borderRadius: "9999px", padding: "1px 6px", color: "var(--text-3)" }}>
                {communities.length}
              </span>
            )}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {/* Communities tab */}
      <RadixTabs.Content value="Communities">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {communities.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--ts-card-h)" }}>🏘️</div>
              <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-body)", color: "var(--text)" }}>No communities yet</p>
              <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>Be the first to create one</p>
              <Link href="/communities/new" style={{ fontSize: "var(--ts-body-sm)", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>Create the first one →</Link>
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
                    <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-body)", color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {community.name}
                    </p>
                    {community.description && (
                      <p style={{ fontSize: "var(--ts-label)", color: "var(--text-2)", marginTop: "2px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                        {community.description}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "var(--ts-body-sm)", fontWeight: 700, color: "var(--text)", margin: 0 }}>{community.memberCount.toLocaleString()}</p>
                    <p style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)", marginTop: "2px" }}>members</p>
                  </div>
                  <JoinButton communityId={community.communityId} />
                </div>
              </Link>
            ))
          )}
        </div>
      </RadixTabs.Content>

      {/* Feed tab */}
      <RadixTabs.Content value="Feed">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {feedThreads.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--ts-card-h)" }}>📰</div>
              <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-body)", color: "var(--text)" }}>No threads yet</p>
              <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>Join a community to see threads here</p>
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
      </RadixTabs.Content>

      {/* Hot tab */}
      <RadixTabs.Content value="Hot">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {hotThreads.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--ts-card-h)" }}>🔥</div>
              <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-body)", color: "var(--text)" }}>Nothing trending yet</p>
              <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>Hot threads will appear here</p>
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
      </RadixTabs.Content>

      <style>{`
        .community-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        [role="tab"][data-state="active"] {
          color: var(--text) !important;
          font-weight: 600 !important;
          border-bottom: 2px solid var(--accent) !important;
        }
        [role="tab"]:hover {
          color: var(--text) !important;
        }
      `}</style>
    </RadixTabs.Root>
  );
}

