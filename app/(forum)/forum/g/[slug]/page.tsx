import { EmptyState, Icon, UserInitials } from "@/components/editorial";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCommunityBySlugServer } from "@/lib/api/communities";
import { fetchThreadsServer } from "@/lib/api/forum";

import { CommunityMembersTab } from "./settings/members-tab";
import { CommunityActions } from "./community-actions";

import { ThreadRow } from "../../thread-row";
import { getSession } from "@/lib/auth/session";
import type { ThreadSummaryResponse } from "@/types/forum";

export const dynamic = "force-dynamic";

const VIEW_TABS = ["threads", "rules", "members"] as const;
type ViewTab = (typeof VIEW_TABS)[number];

function parseTab(raw: string | undefined): ViewTab {
  return (VIEW_TABS as readonly string[]).includes(raw ?? "") ? (raw as ViewTab) : "threads";
}

const num = (n: number) => n.toLocaleString("en-US");

function createdLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { tab?: string };
}) {
  const activeTab = parseTab(searchParams.tab);

  const [community, session] = await Promise.all([
    fetchCommunityBySlugServer(params.slug),
    getSession(),
  ]);
  if (!community) notFound();

  const isAuthed = !!session;

  // Only fetch the data the active panel needs.
  const threadsPage =
    activeTab === "threads"
      ? await fetchThreadsServer({ communityId: community.communityId, pageSize: 30 })
      : null;
  const threads: ThreadSummaryResponse[] = threadsPage?.items ?? [];

  const viewTabLabels: Record<ViewTab, string> = {
    threads: "Threads",
    rules: "Rules",
    members: "Members",
  };

  const created = createdLabel(community.createdAt);

  return (
    <div className="page-enter">
      {/* Back to the forum index — Terminus `.back`. */}
      <Link href="/forum" className="back inline-flex items-center gap-2 no-underline">
        <Icon name="arrowLeft" size={12} strokeWidth={2} aria-hidden /> Forum
      </Link>

      {/* Page head — avatar + `// g/slug` kicker, name, badge row, actions.
          The prototype's `.badge.green` "online" pill has no live signal yet,
          so the badges surface real member/thread counts + created date. */}
      <header className="page-head" style={{ marginBottom: 18 }}>
        <div className="titles">
          <div className="row" style={{ gap: 14, marginBottom: 10 }}>
            <UserInitials name={community.name} avatarUrl={community.imageUrl} size="lg" />
            <div>
              <div className="kicker" style={{ marginBottom: 6 }}>
                // g/{params.slug}
              </div>
              <h1>{community.name}</h1>
            </div>
          </div>
          <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
            <span className="badge">{num(community.memberCount)} members</span>
            <span className="badge">{num(community.threadCount)} threads</span>
            {created && <span className="badge">Created {created}</span>}
          </div>
        </div>
        <div className="actions">
          <CommunityActions
            communityId={community.communityId}
            slug={params.slug}
            isAuthed={isAuthed}
          />
          <Link
            href={`/forum/g/${params.slug}/threads/new`}
            className="btn btn-sm btn-primary no-underline"
          >
            <Icon name="plus" size={12} strokeWidth={2.5} aria-hidden /> Post
          </Link>
        </div>
      </header>

      {/* View tabs — Terminus `.tabs`. These are real navigation (server
          re-renders the matching panel), so anchors are correct. */}
      <nav className="tabs" aria-label="Community sections">
        {VIEW_TABS.map((tab) => {
          const isActive = tab === activeTab;
          const href =
            tab === "threads" ? `/forum/g/${params.slug}` : `/forum/g/${params.slug}?tab=${tab}`;
          return (
            <Link
              key={tab}
              href={href}
              replace
              scroll={false}
              aria-current={isActive ? "page" : undefined}
            >
              {viewTabLabels[tab]}
            </Link>
          );
        })}
      </nav>

      {/* Active panel */}
      {activeTab === "threads" && (
        <section aria-labelledby="panel-threads">
          <div className="section-h" style={{ marginBottom: 0 }}>
            <h2 id="panel-threads">// RECENT_THREADS [{threads.length}]</h2>
          </div>
          {threads.length === 0 ? (
            <EmptyState
              glyph={<Icon name="forum" size={24} strokeWidth={1.5} />}
              title="No threads yet"
              body="Start the first discussion in this community."
              cta={{ label: "+ New thread", href: `/forum/g/${params.slug}/threads/new` }}
            />
          ) : (
            <div className="stack">
              {threads.map((t) => (
                <ThreadRow key={t.threadId} thread={t} slug={params.slug} showCommunity={false} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "rules" && (
        <section aria-labelledby="panel-rules">
          <div className="section-h" style={{ marginBottom: 0 }}>
            <h2 id="panel-rules">// RULES</h2>
          </div>
          {community.rules?.trim() ? (
            <div className="card whitespace-pre-wrap leading-relaxed text-ink-2">
              {community.rules}
            </div>
          ) : (
            <EmptyState
              glyph={<Icon name="shield" size={24} strokeWidth={1.5} />}
              title="No rules yet"
              body="Moderators set the ground rules for this community in Settings."
              cta={{ label: "Open settings", href: `/forum/g/${params.slug}/settings` }}
            />
          )}
        </section>
      )}

      {activeTab === "members" && (
        <section aria-labelledby="panel-members">
          <div className="section-h" style={{ marginBottom: 0 }}>
            <h2 id="panel-members">// MEMBERS [{community.memberCount.toLocaleString()}]</h2>
          </div>
          <CommunityMembersTab communityId={community.communityId} />
        </section>
      )}
    </div>
  );
}
