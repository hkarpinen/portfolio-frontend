import { Icon, LinkTabs, UserInitials, VoteControl } from "@/components/editorial";
import Link from "next/link";
import { Suspense } from "react";

import { ThreadActions } from "./forum/g/[slug]/threads/[threadId]/thread-actions";
import { fetchThreadsServer } from "@/lib/api/forum";
import { fetchCommunitiesServer } from "@/lib/api/communities";
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

export default async function ForumFeedPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = searchParams.tab ?? "feed";

  const sortMap: Record<string, string> = {
    feed: "new",
    hot: "hot",
    communities: "new",
  };

  const cookieHeader = await getCookieHeader();
  // Two community calls: the discovery list (all) and the "your communities"
  // sidebar (filtered server-side by membership). Previously this needed a
  // third call to /memberships + a client-side intersect.
  const [threadsPage, communitiesPage, myCommunitiesPage] = await Promise.all([
    tab !== "communities"
      ? fetchThreadsServer({ sort: sortMap[tab] ?? "new", pageSize: 30 })
      : Promise.resolve(null),
    fetchCommunitiesServer(cookieHeader, 1, 10),
    fetchCommunitiesServer(cookieHeader, 1, 20, /* mine */ true),
  ]);

  const threads: ThreadSummaryResponse[] = threadsPage?.items ?? [];
  const communities: CommunitySummaryResponse[] = communitiesPage?.items ?? [];
  const myCommunities: CommunitySummaryResponse[] = myCommunitiesPage?.items ?? [];

  const tabItems = [
    { queryValue: "feed", label: "Feed", href: "/forum?tab=feed" },
    { queryValue: "hot", label: "Hot", href: "/forum?tab=hot" },
    { queryValue: "communities", label: "Communities", href: "/forum?tab=communities" },
  ];

  return (
    <div className="page-enter flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="m-0 font-serif text-2xl font-extrabold tracking-[-0.025em] text-ink">
            Forum
          </h1>
          <p className="mt-2 text-base text-ink-3">Discussions, communities, and ideas</p>
        </div>
        <Link
          href="/forum/new"
          className="bg-red px-8 py-4 text-base font-semibold text-white no-underline"
        >
          + New Community
        </Link>
      </div>

      {/* Tabs */}
      <Suspense fallback={<nav className="ed-tabs-list" role="tablist" aria-label="Feed sort" />}>
        <LinkTabs items={tabItems} activeValue={tab} aria-label="Feed sort" />
      </Suspense>

      {/* Two-column layout */}
      <div className="sidebar-grid gap-12">
        {/* Main content */}
        <div className="flex flex-col gap-4">
          {tab === "communities" ? (
            <>
              {communities.length === 0 ? (
                <div className="flex flex-col items-center gap-6 border-ink bg-paper px-12 py-24 text-center">
                  <div aria-hidden="true" className="ed-medallion">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--ink)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <p className="font-serif text-md font-bold text-ink">No communities yet</p>
                  <p className="text-base text-ink-3">Be the first to create one</p>
                  <Link
                    href="/forum/new"
                    className="bg-red px-10 py-4 text-base font-semibold text-white no-underline"
                  >
                    Create Community
                  </Link>
                </div>
              ) : (
                /* gridTemplateColumns is responsive — repeat(auto-fill) has no static Tailwind equivalent */
                <div
                  className="grid gap-6"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
                >
                  {communities.map((c) => (
                    <Link
                      key={c.communityId}
                      href={`/forum/g/${c.slug ?? c.name}`}
                      className="no-underline"
                    >
                      <div className="card-hover cursor-pointer border-ink bg-paper p-8 shadow-card">
                        <div className="mb-4 flex items-center gap-5">
                          <UserInitials name={c.name} size="lg" className="h-18 w-18" />
                          <div>
                            <p className="font-serif text-md font-bold text-ink">{c.name}</p>
                            <p className="text-sm text-ink-3">{c.description ?? ""}</p>
                          </div>
                        </div>
                        {c.description && (
                          <p className="line-clamp-2 text-base text-ink-2">{c.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center gap-6 border-ink bg-paper px-12 py-24 text-center">
              <div className="ed-medallion">
                <span className="text-ink">
                  <Icon name="forum" size={24} strokeWidth={2} />
                </span>
              </div>
              <p className="font-serif text-md font-bold text-ink">No threads yet</p>
              <p className="text-base text-ink-3">Join a community and start a discussion</p>
            </div>
          ) : (
            <ol className="m-0 flex list-none flex-col gap-4 p-0" aria-label="Forum threads">
              {threads.map((thread) => {
                const communityHref = `/forum/g/${thread.communitySlug ?? thread.communityId}`;
                const threadHref = `${communityHref}/threads/${thread.threadId}`;
                return (
                  <li key={thread.threadId}>
                    <article
                      className="flex items-start gap-6 border-ink bg-paper px-8 py-7 shadow-card"
                      aria-label={thread.title}
                    >
                      {/* Vote column */}
                      <VoteControl
                        threadId={thread.threadId}
                        targetType={0}
                        targetId={thread.threadId}
                        initialScore={thread.voteScore ?? 0}
                      />

                      {/* Thread content */}
                      <div className="min-w-0 flex-1">
                        {/* Meta row */}
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          {thread.communityName && (
                            <>
                              <Link
                                href={communityHref}
                                className="text-sm font-medium text-red no-underline hover:underline"
                              >
                                g/{thread.communityName}
                              </Link>
                              <span aria-hidden="true" className="text-sm text-ink-3">
                                ·
                              </span>
                            </>
                          )}
                          <span className="text-sm text-ink-3">
                            {thread.authorDisplayName ?? "Anonymous"}
                          </span>
                          <span aria-hidden="true" className="text-sm text-ink-3">
                            ·
                          </span>
                          <time dateTime={thread.createdAt} className="text-sm text-ink-3">
                            {timeAgo(thread.createdAt)}
                          </time>
                        </div>

                        {/* Title */}
                        <h3 className="m-0 mb-4 font-serif text-md font-bold leading-[1.4] text-ink">
                          <Link href={threadHref} className="row-hover text-ink no-underline">
                            {thread.title}
                          </Link>
                        </h3>

                        {/* Actions row */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={threadHref}
                            aria-label={`${thread.commentCount ?? 0} comments on "${thread.title}"`}
                            className="row-hover flex items-center gap-2 px-5 py-2 text-base font-medium text-ink-3 no-underline"
                          >
                            <Icon name="forum" size={13} strokeWidth={2} aria-hidden />
                            <span aria-hidden="true">{thread.commentCount ?? 0} comments</span>
                          </Link>
                          <ThreadActions
                            threadId={thread.threadId}
                            threadUrl={`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}${threadHref}`}
                            showReply={false}
                          />
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-8" aria-label="Forum sidebar">
          {/* Your communities */}
          <nav aria-label="Your communities" className="border-ink bg-paper p-8 shadow-stamp">
            <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.1em] text-ink-3">
              Your Communities
            </h2>
            {myCommunities.length === 0 ? (
              <p className="text-base text-ink-3">Join communities to see them here.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {myCommunities.map((c) => (
                  <Link
                    key={c.communityId}
                    href={`/forum/g/${c.slug ?? c.name}`}
                    className="row-hover flex items-center gap-4 px-4 py-3 no-underline"
                  >
                    <UserInitials name={c.name} size="lg" />
                    <span className="text-base font-medium text-ink-2">{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/forum" className="mt-6 block text-base text-red no-underline">
              Browse all communities →
            </Link>
          </nav>

          {/* Forum rules */}
          <div className="border-ink bg-paper p-8 shadow-stamp">
            <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.1em] text-ink-3">
              Forum Rules
            </h2>
            <ol className="m-0 flex flex-col gap-3 p-[0_0_0_16px]">
              {FORUM_RULES.map((rule) => (
                <li key={rule} className="text-base leading-[1.5] text-ink-2">
                  {rule}
                </li>
              ))}
            </ol>
          </div>

          {/* Create community CTA */}
          <Link
            href="/forum/new"
            className="flex items-center justify-center gap-3 bg-red-soft px-8 py-5 text-base font-semibold text-red no-underline transition-[background] duration-[110ms] [border:1.5px_solid_var(--red)]"
          >
            <Icon name="plus" size={13} strokeWidth={2.5} aria-hidden />
            Create a Community
          </Link>
        </aside>
      </div>
    </div>
  );
}
