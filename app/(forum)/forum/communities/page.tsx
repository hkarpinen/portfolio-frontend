import { EmptyState, Icon } from "@/components/editorial";
import Link from "next/link";

import { fetchCommunitiesServer } from "@/lib/api/communities";
import { JoinButton } from "../join-button";
import type { CommunitySummaryResponse } from "@/types/forum";

export const dynamic = "force-dynamic";

const num = (n: number) => n.toLocaleString("en-US");

/**
 * /forum/communities — full browse page.
 *
 * Linked from the "Browse all" action on the landing grid. Uses the same
 * Terminus `.grid-2` of `.module` tiles as the landing `<CommunityStrip>`.
 */
export default async function CommunitiesBrowsePage() {
  const page = await fetchCommunitiesServer();
  const communities: CommunitySummaryResponse[] = page?.items ?? [];

  return (
    <div className="page-enter">
      <header className="page-head">
        <div className="titles">
          <div className="kicker" style={{ marginBottom: 8 }}>
            // FORUM · COMMUNITIES
          </div>
          <h1>Communities</h1>
          <p className="deck">
            Every public community on the network. Join one to start posting threads, or spin up
            your own.
          </p>
        </div>
        <div className="actions">
          <Link href="/forum/new" className="btn btn-sm btn-primary no-underline">
            <Icon name="plus" size={12} strokeWidth={2.5} aria-hidden /> New community
          </Link>
        </div>
      </header>

      <section aria-labelledby="all-communities">
        <div className="section-h" style={{ marginBottom: 0 }}>
          <h2 id="all-communities">// ALL_COMMUNITIES [{communities.length}]</h2>
        </div>

        {communities.length === 0 ? (
          <EmptyState
            glyph={<Icon name="community" size={24} strokeWidth={1.5} />}
            title="No communities yet"
            body="Be the first to start a community on the network."
            cta={{ label: "+ New community", href: "/forum/new" }}
          />
        ) : (
          <div
            className="grid-2"
            style={{
              gap: "1px",
              background: "var(--border)",
              border: "1px solid var(--border)",
            }}
          >
            {communities.map((c) => (
              <div key={c.communityId} className="module" style={{ minHeight: 0, padding: 14 }}>
                <Link
                  href={`/forum/g/${c.slug}`}
                  className="num no-underline hover:text-accent"
                >
                  g/{c.slug}
                </Link>
                <p style={{ fontSize: "0.72rem", margin: 0 }}>
                  {c.description?.trim() || "No description yet."}
                </p>
                <div className="row" style={{ gap: 8, marginTop: 8 }}>
                  <span className="badge">{num(c.memberCount ?? 0)} members</span>
                  <span className="badge">{num(c.threadCount ?? 0)} threads</span>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <JoinButton communityId={c.communityId} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
