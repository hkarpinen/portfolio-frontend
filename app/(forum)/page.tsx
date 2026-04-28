import Link from "next/link";
import { VoteButtons } from "./communities/[slug]/threads/[threadId]/vote-buttons";
import { fetchThreadsServer } from "@/lib/api/forum";
import { fetchCommunitiesServer, fetchMyMembershipsServer } from "@/lib/api/communities";
import { getCookieHeader } from "@/lib/server-cookies";
import { timeAgo } from "@/lib/utils";
import type { ThreadSummaryResponse, CommunitySummaryResponse } from "@/types/forum";

export const dynamic = "force-dynamic";

const FORUM_RULES = [
  "Be respectful and constructive",
  "No spam or self-promotion",
  "Use descriptive titles",
  "Stay on topic",
  "Search before posting",
];

export default async function ForumFeedPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab ?? "feed";

  const sortMap: Record<string, string> = {
    feed: "new",
    hot: "hot",
    communities: "new",
  };

  const cookieHeader = await getCookieHeader();
  const [threadsPage, communitiesPage, membershipsData] = await Promise.all([
    tab !== "communities" ? fetchThreadsServer({ sort: sortMap[tab] ?? "new", pageSize: 30 }) : Promise.resolve(null),
    fetchCommunitiesServer(undefined, 1, 10),
    fetchMyMembershipsServer(cookieHeader),
  ]);

  const threads: ThreadSummaryResponse[] = threadsPage?.items ?? [];
  const communities: CommunitySummaryResponse[] = communitiesPage?.items ?? [];
  const myMembershipIds = (membershipsData?.items ?? []).map((m) => m.communityId ?? "").filter(Boolean);

  const myCommunities = communities.filter((c) => myMembershipIds.includes(c.communityId));

  const tabs = [
    { key: "feed", label: "Feed" },
    { key: "hot", label: "Hot" },
    { key: "communities", label: "Communities" },
  ];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", margin: 0 }}>
            Forum
          </h1>
          <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
            Discussions, communities, and ideas
          </p>
        </div>
        <Link
          href="/communities/new"
          style={{
            background: "var(--accent)", color: "#fff",
            padding: "8px 16px", borderRadius: "12px",
            fontSize: "13px", fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + New Community
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: "0" }}>
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/forum?tab=${t.key}`}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "var(--text)" : "var(--text-3)",
              borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: "-1px",
              textDecoration: "none",
              transition: "color 110ms",
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="sidebar-grid" style={{ gap: "24px" }}>
        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tab === "communities" ? (
            <>
              {communities.length === 0 ? (
                <div style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "16px", padding: "48px 24px",
                  textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
                }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                  </div>
                  <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>No communities yet</p>
                  <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Be the first to create one</p>
                  <Link href="/communities/new" style={{ background: "var(--accent)", color: "#fff", padding: "8px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                    Create Community
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
                  {communities.map((c) => (
                    <Link
                      key={c.communityId}
                      href={`/communities/${c.slug ?? c.name}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div className="card-hover" style={{
                        background: "var(--surface)", border: "1px solid var(--border)",
                        borderRadius: "14px", padding: "16px",
                        boxShadow: "var(--shadow-sm)", cursor: "pointer",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "10px",
                            background: "var(--accent-subtle)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "16px", flexShrink: 0,
                          }}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
                              {c.name}
                            </p>
                            <p style={{ fontSize: "11px", color: "var(--text-3)" }}>
                              {c.description ?? ""}
                            </p>
                          </div>
                        </div>
                        {c.description && (
                          <p style={{ fontSize: "12px", color: "var(--text-2)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {c.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : threads.length === 0 ? (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "16px", padding: "48px 24px",
              textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
            }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>No threads yet</p>
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Join a community and start a discussion</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.threadId}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "14px", padding: "14px 16px",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex", gap: "12px", alignItems: "flex-start",
                }}
              >
                {/* Vote column */}
                <VoteButtons
                  threadId={thread.threadId}
                  targetType={0}
                  targetId={thread.threadId}
                  initialScore={thread.voteScore ?? 0}
                />

                {/* Thread content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Meta row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                      {thread.authorDisplayName ?? "Anonymous"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-3)" }}>·</span>
                    <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                      {timeAgo(thread.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/communities/${thread.communityId}/threads/${thread.threadId}`}
                    style={{ textDecoration: "none" }}
                  >
                    <p style={{
                      fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "14px",
                      color: "var(--text)", lineHeight: "1.4", marginBottom: "8px",
                    }}
                      className="row-hover"
                    >
                      {thread.title}
                    </p>
                  </Link>

                  {/* Actions row */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <Link
                      href={`/communities/${thread.communityId}/threads/${thread.threadId}`}
                      style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-3)", textDecoration: "none" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                      View
                    </Link>
                    <Link
                      href={`/communities/${thread.communityId}/threads/new`}
                      style={{ fontSize: "12px", color: "var(--text-3)", textDecoration: "none" }}
                    >
                      Post here
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Your communities */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "14px", padding: "16px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Your Communities
            </p>
            {myCommunities.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
                Join communities to see them here.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {myCommunities.map((c) => (
                  <Link
                    key={c.communityId}
                    href={`/communities/${c.slug ?? c.name}`}
                    style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", padding: "6px 8px", borderRadius: "8px" }}
                    className="row-hover"
                  >
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "6px",
                      background: "var(--accent-subtle)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 700, color: "var(--accent)",
                      flexShrink: 0,
                    }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: "13px", color: "var(--text-2)", fontWeight: 500 }}>
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/communities"
              style={{ display: "block", fontSize: "12px", color: "var(--accent)", textDecoration: "none", marginTop: "12px" }}
            >
              Browse all communities →
            </Link>
          </div>

          {/* Forum rules */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "14px", padding: "16px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Forum Rules
            </p>
            <ol style={{ padding: "0 0 0 16px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {FORUM_RULES.map((rule) => (
                <li key={rule} style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: "1.5" }}>
                  {rule}
                </li>
              ))}
            </ol>
          </div>

          {/* Create community CTA */}
          <Link
            href="/communities/new"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "6px",
              background: "var(--accent-subtle)", border: "1px solid var(--accent)",
              borderRadius: "12px", padding: "10px 16px",
              fontSize: "13px", fontWeight: 600, color: "var(--accent)",
              textDecoration: "none",
              transition: "background 110ms",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create a Community
          </Link>
        </div>
      </div>
    </div>
  );
}
