import Link from "next/link";
import { ForumFeed } from "./forum-feed";
import { CommunityStrip } from "./community-strip";
import { fetchCommunitiesServer } from "@/lib/api/communities";
import { fetchThreadsServer } from "@/lib/api/forum";
import type { CommunitySummaryResponse } from "@/types/forum";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { DepartmentHead } from "@/components/editorial/department-head";
import { forumHeadline, forumDeck } from "@/lib/forum/editorial-copy";

export const dynamic = 'force-dynamic';

export default async function CommunitiesPage() {
  // Only seed the default ("hot") sort server-side. The "new" and "top"
  // tabs are fetched lazily by ForumFeed when the user actually clicks them.
  const [commPage, hotPage] = await Promise.all([
    fetchCommunitiesServer(),
    fetchThreadsServer({ sort: "hot", pageSize: 30 }),
  ]);

  const communities: CommunitySummaryResponse[] = commPage?.items ?? [];
  const hot = hotPage?.items ?? [];

  const slugMap: Record<string, string> = {};
  for (const c of communities) slugMap[c.communityId] = c.slug;

  // Up to three communities surface in the marquee strip; the rest live on
  // /forum/communities. Ordering matches the API default (which is by member
  // count desc for now — when we have signals, switch to "trending").
  const trending = communities.slice(0, 3);

  return (
    <div className="page-enter flex flex-col gap-8">
      <EditorialPageHead
        kicker="Letters · Community"
        title={forumHeadline({ communityCount: communities.length })}
        deck={forumDeck({ communityCount: communities.length })}
      />

      {/* Communities marquee — discovery + join in one editorial pass, no rail */}
      <section aria-labelledby="communities-strip-heading" className="flex flex-col gap-5">
        <DepartmentHead
          id="communities-strip-heading"
          kicker="Discover"
          count={`${communities.length} on file`}
          title="Communities"
        />
        {communities.length === 0 ? (
          <p className="ed-hint">
            No communities yet.{" "}
            <Link href="/forum/new" className="text-red no-underline font-semibold">Create the first →</Link>
          </p>
        ) : (
          <>
            <CommunityStrip communities={trending} />
            {communities.length > 3 && (
              <div className="flex justify-end">
                <Link
                  href="/forum/communities"
                  className="font-mono text-xs uppercase tracking-wide text-ink-3 hover:text-red no-underline"
                >
                  Browse all ({communities.length}) <span aria-hidden>→</span>
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* Thread feed — single editorial column, no rail */}
      <ForumFeed initialHot={hot} slugMap={slugMap} />
    </div>
  );
}
