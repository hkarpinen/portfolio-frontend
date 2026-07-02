import { Icon } from "@/components/editorial";
import Link from "next/link";
import { ForumFeed } from "./forum-feed";
import { CommunityStrip } from "./community-strip";
import { fetchCommunitiesServer } from "@/lib/api/communities";
import { fetchThreadsServer } from "@/lib/api/forum";
import type { CommunitySummaryResponse } from "@/types/forum";

import { forumHeadline, forumDeck } from "@/lib/forum/editorial-copy";

export const dynamic = "force-dynamic";

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

  // Up to four communities surface in the landing grid; the rest live on
  // /forum/communities (linked from the section header).
  const trending = communities.slice(0, 4);

  return (
    <div className="page-enter">
      {/* Page head — Terminus `.page-head`: kicker + h1 + deck on the left,
          search + New-thread action on the right. */}
      <header className="page-head">
        <div className="titles">
          <div className="kicker" style={{ marginBottom: 8 }}>
            // WORKSPACE · FORUM
          </div>
          <h1
            dangerouslySetInnerHTML={{
              __html: forumHeadline({ communityCount: communities.length }),
            }}
          />
          <p className="deck">{forumDeck({ communityCount: communities.length })}</p>
        </div>
        <div className="actions">
          {/* Submitting routes to the live search page. */}
          <form action="/forum/search" className="search-wrap" style={{ width: 220 }} role="search">
            <Icon name="search" size={14} strokeWidth={2} aria-hidden />
            <input name="q" placeholder="Search threads…" aria-label="Search threads" />
          </form>
          <Link href="/forum/new" className="btn btn-sm btn-primary no-underline">
            <Icon name="plus" size={12} strokeWidth={2.5} aria-hidden /> New community
          </Link>
        </div>
      </header>

      {/* Communities — Terminus `.grid-2` of `.module` tiles */}
      <section aria-labelledby="communities-strip-heading">
        <div className="section-h">
          <h2 id="communities-strip-heading">// COMMUNITIES</h2>
          {communities.length > 4 && (
            <div className="actions">
              <Link href="/forum/communities" className="btn btn-sm no-underline">
                Browse all ({communities.length})
              </Link>
            </div>
          )}
        </div>
        {communities.length === 0 ? (
          <p className="deck">
            No communities yet.{" "}
            <Link
              href="/forum/new"
              className="inline-flex items-center gap-1 font-semibold text-accent no-underline"
            >
              $ create-first <Icon name="arrowRight" size={13} strokeWidth={2} />
            </Link>
          </p>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <CommunityStrip communities={trending} />
          </div>
        )}
      </section>

      {/* Thread feed — `.tabs` + `.section-h` + `.stack` of `.thread-row`s */}
      <ForumFeed initialHot={hot} slugMap={slugMap} />
    </div>
  );
}
