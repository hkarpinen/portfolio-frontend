import { DepartmentHead, EditorialPageHead, EmptyState, Icon } from "@/components/editorial";
import Link from "next/link";

import { fetchCommunitiesServer } from "@/lib/api/communities";
import { JoinButton } from "../join-button";
import { communityTileMeta } from "@/lib/forum/editorial-copy";
import type { CommunitySummaryResponse } from "@/types/forum";

export const dynamic = "force-dynamic";

/**
 * /forum/communities — full browse page.
 *
 * Linked from the "Browse all" action on the landing marquee. Uses the
 * shared `.ed-module` tile pattern so the catalogue reads the same as
 * the household / finance listings.
 */
export default async function CommunitiesBrowsePage() {
  const page = await fetchCommunitiesServer();
  const communities: CommunitySummaryResponse[] = page?.items ?? [];

  return (
    <div className="page-enter flex flex-col gap-8">
      <EditorialPageHead
        kicker="Letters · Community"
        title="Browse <em>communities</em>"
        deck="Every public community on the network. Join one to start posting threads, or spin up your own."
      />

      <section aria-labelledby="all-communities" className="flex flex-col gap-5">
        <DepartmentHead
          id="all-communities"
          kicker="Catalogue"
          count={`${communities.length} on file`}
          title="All <em>communities</em>"
        />

        {communities.length === 0 ? (
          <EmptyState
            glyph={<Icon name="community" size={24} strokeWidth={1.5} />}
            title="No communities yet"
            body="Be the first to start a community on the network."
            cta={{ label: "+ New community", href: "/forum/new" }}
          />
        ) : (
          <ul
            className="m-0 grid list-none gap-4 p-0"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {communities.map((c) => {
              const { memberLabel, threadLabel } = communityTileMeta({
                memberCount: c.memberCount ?? 0,
                threadCount: c.threadCount,
              });

              return (
                <li key={c.communityId} className="ed-module">
                  <span className="ed-module-kicker" aria-hidden>
                    Community
                  </span>
                  <Link
                    href={`/forum/g/${c.slug}`}
                    className="ed-module-title no-underline hover:text-red"
                  >
                    g/<em>{c.slug}</em>
                  </Link>
                  {c.description ? (
                    <p className="ed-module-desc line-clamp-3">{c.description}</p>
                  ) : (
                    <p className="ed-module-desc italic text-ink-3">No description yet.</p>
                  )}
                  <p className="ed-module-meta">
                    {memberLabel}
                    {threadLabel}
                  </p>
                  <div className="ed-module-foot">
                    <JoinButton communityId={c.communityId} />
                    <Link
                      href={`/forum/g/${c.slug}`}
                      className="ed-module-arrow no-underline hover:text-red"
                      aria-label={`Open ${c.name}`}
                    >
                      Open →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
