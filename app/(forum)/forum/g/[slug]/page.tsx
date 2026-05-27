import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCommunityBySlugServer } from "@/lib/api/communities";
import { fetchThreadsServer } from "@/lib/api/forum";
import { EmptyState } from "@/components/editorial/empty-state";
import { Icon } from "@/components/editorial/icon";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { DepartmentHead } from "@/components/editorial/department-head";
import { CommunityMembersTab } from "./settings/members-tab";
import { CommunityActions } from "./community-actions";
import { communityHeadline, communityDeck } from "@/lib/forum/editorial-copy";

import { ThreadRow } from "../../thread-row";
import { getSession } from "@/lib/auth/session";
import type { ThreadSummaryResponse } from "@/types/forum";

export const dynamic = "force-dynamic";

const VIEW_TABS = ["threads", "rules", "members"] as const;
type ViewTab = (typeof VIEW_TABS)[number];

function parseTab(raw: string | undefined): ViewTab {
  return (VIEW_TABS as readonly string[]).includes(raw ?? "")
    ? (raw as ViewTab)
    : "threads";
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

  return (
    <div className="page-enter flex flex-col gap-6">
      <EditorialPageHead
        kicker="Community"
        title={communityHeadline({ slug: params.slug })}
        deck={communityDeck({
          description: community.description,
          memberCount: community.memberCount,
          threadCount: community.threadCount,
        })}
      />

      {/* Tab strip — view tabs on the left, membership/management on the right.
          CommunityActions decides what fits in the aux slot based on auth +
          membership: Join for non-members, New thread (+ Settings if mod) for
          members. The standalone Join row above the tabs is gone. */}
      <div className="ed-tabs-row">
        <nav aria-label="Community sections" className="ed-tabs-list flex-1">
          {VIEW_TABS.map((tab) => {
            const isActive = tab === activeTab;
            const href = tab === "threads"
              ? `/forum/g/${params.slug}`
              : `/forum/g/${params.slug}?tab=${tab}`;
            return (
              <Link
                key={tab}
                href={href}
                replace
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className="ed-tab"
              >
                {viewTabLabels[tab]}
              </Link>
            );
          })}
        </nav>
        <div className="ed-tabs-aux">
          <CommunityActions
            communityId={community.communityId}
            slug={params.slug}
            isAuthed={isAuthed}
          />
        </div>
      </div>

      {/* Active panel */}
      {activeTab === "threads" && (
        <section aria-labelledby="panel-threads" className="flex flex-col gap-5">
          <DepartmentHead
            kicker="Threads · Posted"
            count={`${threads.length} thread${threads.length === 1 ? "" : "s"}`}
            title="The <em>feed</em>"
          />
          {threads.length === 0 ? (
            <EmptyState
              glyph={<Icon name="forum" size={24} strokeWidth={1.5} />}
              title="No threads yet"
              body="Start the first discussion in this community."
              cta={{ label: "+ New thread", href: `/forum/g/${params.slug}/threads/new` }}
            />
          ) : (
            <div className="flex flex-col">
              {threads.map((t) => (
                <ThreadRow key={t.threadId} thread={t} slug={params.slug} showCommunity={false} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "rules" && (
        <section aria-labelledby="panel-rules" className="flex flex-col gap-5">
          <DepartmentHead
            kicker="Community · Ground rules"
            title="Community <em>rules</em>"
            deck="Moderators set the ground rules here."
          />
          {/* TODO(handoff8): render community.rules markdown when the backend exposes a rules field
              on CommunityDetailResponse. For now show a placeholder. */}
          <EmptyState
            glyph={<Icon name="shield" size={24} strokeWidth={1.5} />}
            title="No rules yet"
            body="Moderators set the ground rules for this community in Settings."
            cta={{ label: "Open settings", href: `/forum/g/${params.slug}/settings` }}
          />
        </section>
      )}

      {activeTab === "members" && (
        <section aria-labelledby="panel-members" className="flex flex-col gap-5">
          <DepartmentHead
            kicker="Community · Roster"
            count={`${community.memberCount.toLocaleString()} on file`}
            title="Community <em>members</em>"
          />
          <CommunityMembersTab communityId={community.communityId} />
        </section>
      )}
    </div>
  );
}
