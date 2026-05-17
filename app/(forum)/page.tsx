import Link from "next/link";
import { VoteButtons } from "./forum/[slug]/threads/[threadId]/vote-buttons";
import { ThreadActions } from "./forum/[slug]/threads/[threadId]/thread-actions";
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
    <div className="page-enter flex flex-col gap-12" >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div>
          <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink m-0">
            Forum
          </h1>
          <p className="text-ink-3 mt-2 text-base">
            Discussions, communities, and ideas
          </p>
        </div>
        <Link
          href="/forum/new"
          className="bg-red text-white py-4 px-8 text-base font-semibold no-underline"
        >
          + New Community
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/forum?tab=${t.key}`}
            className="py-5 px-8 text-base mb-[-1px] no-underline" style={{ fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? "var(--text)" : "var(--text-3)", borderBottom: tab === t.key ? "3px solid var(--red)" : "2px solid transparent", transition: "color 110ms" }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="sidebar-grid gap-12" >
        {/* Main content */}
        <div className="flex flex-col gap-4">
          {tab === "communities" ? (
            <>
              {communities.length === 0 ? (
                <div className="bg-paper py-24 px-12 text-center flex flex-col items-center gap-6" style={{ border: "1.5px solid var(--ink)" }}>
                  <div className="w-[56px] h-[56px] bg-[rgba(178,42,26,0.10)] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                  </div>
                  <p className="font-serif font-bold text-md text-ink">No communities yet</p>
                  <p className="text-base text-ink-3">Be the first to create one</p>
                  <Link href="/forum/new" className="bg-red text-white py-4 px-10 text-base font-semibold no-underline">
                    Create Community
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                  {communities.map((c) => (
                    <Link
                      key={c.communityId}
                      href={`/forum/${c.slug ?? c.name}`}
                      className="no-underline"
                    >
                      <div className="card-hover bg-paper p-8 shadow-card cursor-pointer" style={{ border: "1.5px solid var(--ink)" }}>
                        <div className="flex items-center gap-5 mb-4">
                          <div className="w-[36px] h-[36px] bg-[rgba(178,42,26,0.10)] flex items-center justify-center text-md shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-serif font-bold text-md text-ink">
                              {c.name}
                            </p>
                            <p className="text-sm text-ink-3">
                              {c.description ?? ""}
                            </p>
                          </div>
                        </div>
                        {c.description && (
                          <p className="text-base text-ink-2 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
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
            <div className="bg-paper py-24 px-12 text-center flex flex-col items-center gap-6" style={{ border: "1.5px solid var(--ink)" }}>
              <div className="w-[56px] h-[56px] bg-[rgba(178,42,26,0.10)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <p className="font-serif font-bold text-md text-ink">No threads yet</p>
              <p className="text-base text-ink-3">Join a community and start a discussion</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.threadId}
                className="bg-paper py-[14px] px-[16px] shadow-card flex gap-6 items-start" style={{ border: "1.5px solid var(--ink)" }}
              >
                {/* Vote column */}
                <VoteButtons
                  threadId={thread.threadId}
                  targetType={0}
                  targetId={thread.threadId}
                  initialScore={thread.voteScore ?? 0}
                />

                {/* Thread content */}
                <div className="flex-1 min-w-0">
                  {/* Meta row */}
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="text-sm text-ink-3">
                      {thread.authorDisplayName ?? "Anonymous"}
                    </span>
                    <span className="text-sm text-ink-3">·</span>
                    <span className="text-sm text-ink-3">
                      {timeAgo(thread.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/forum/${thread.communityId}/threads/${thread.threadId}`}
                    className="no-underline"
                  >
                    <p 
                      className="row-hover font-serif font-bold text-md text-ink leading-[1.4] mb-4"
                    >
                      {thread.title}
                    </p>
                  </Link>

                  {/* Actions row */}
                  <div className="flex gap-2 items-center">
                    <Link
                      href={`/forum/${thread.communityId}/threads/${thread.threadId}`}
                      
                      className="row-hover flex items-center gap-2 py-2 px-5 text-base text-ink-3 no-underline font-medium"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                      {thread.commentCount ?? 0} comments
                    </Link>
                    <ThreadActions
                      threadId={thread.threadId}
                      threadUrl={`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/communities/${thread.communitySlug ?? thread.communityId}/threads/${thread.threadId}`}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
          {/* Your communities */}
          <div className="bg-paper p-8 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
            <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em] mb-6">
              Your Communities
            </p>
            {myCommunities.length === 0 ? (
              <p className="text-base text-ink-3">
                Join communities to see them here.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {myCommunities.map((c) => (
                  <Link
                    key={c.communityId}
                    href={`/forum/${c.slug ?? c.name}`}
                    
                    className="row-hover flex items-center gap-4 no-underline py-3 px-4"
                  >
                    <div className="w-12 h-12 bg-[rgba(178,42,26,0.10)] flex items-center justify-center text-sm font-bold text-red shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-base text-ink-2 font-medium">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/forum"
              className="block text-base text-red no-underline mt-6"
            >
              Browse all communities →
            </Link>
          </div>

          {/* Forum rules */}
          <div className="bg-paper p-8 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
            <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em] mb-6">
              Forum Rules
            </p>
            <ol className="p-[0_0_0_16px] m-0 flex flex-col gap-3">
              {FORUM_RULES.map((rule) => (
                <li key={rule} className="text-base text-ink-2 leading-[1.5]">
                  {rule}
                </li>
              ))}
            </ol>
          </div>

          {/* Create community CTA */}
          <Link
            href="/forum/new"
            className="flex items-center justify-center gap-3 bg-[rgba(178,42,26,0.10)] py-5 px-8 text-base font-semibold text-red no-underline" style={{ border: "1.5px solid var(--red)", transition: "background 110ms" }}
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
