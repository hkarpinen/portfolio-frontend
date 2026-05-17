import Link from "next/link";
import { ForumTabs } from "./forum-tabs";
import { fetchCommunitiesServer } from "@/lib/api/communities";
import { fetchThreadsServer } from "@/lib/api/forum";
import type { CommunitySummaryResponse } from "@/types/forum";
import { SectionHeader } from "@/components/editorial/section-header";
import { Btn } from "@/components/editorial/button";

export const dynamic = 'force-dynamic';

const HOUSE_RULES = [
  "Be respectful.",
  "No spam or self-promotion.",
  "Stay on topic.",
  "Write descriptive titles.",
];

export default async function CommunitiesPage() {
  const [commPage, feedPage, hotPage] = await Promise.all([
    fetchCommunitiesServer(),
    fetchThreadsServer({ sort: "new", pageSize: 30 }),
    fetchThreadsServer({ sort: "hot", pageSize: 30 }),
  ]);

  const communities: CommunitySummaryResponse[] = commPage?.items ?? [];
  const feedThreads = feedPage?.items ?? [];
  const hotThreads = hotPage?.items ?? [];

  // Build communityId → slug map for ThreadCard navigation
  const communitySlugMap: Record<string, string> = {};
  for (const c of communities) {
    communitySlugMap[c.communityId] = c.slug;
  }

  return (
    <div className="page-enter flex flex-col gap-12">
      {/* Section header */}
      <SectionHeader
        kicker="Letters · Community pages"
        title="Letters to the editor."
        subtitle="Threads, communities, and the occasional argument."
        action={
          <>
            <Btn href="/search" variant="secondary" size="sm">Search</Btn>
            <Btn href="/forum/new" variant="primary" size="sm">Write a letter</Btn>
          </>
        }
      />

      {/* Two-column layout */}
      <div className="forum-grid grid gap-12" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>
        {/* Left — tabs + content */}
        <ForumTabs
          communities={communities}
          feedThreads={feedThreads}
          hotThreads={hotThreads}
          communitySlugMap={communitySlugMap}
        />

        {/* Right sidebar */}
        <div className="forum-sidebar flex flex-col gap-8">
          {/* Your desks card */}
          <div className="bg-paper" style={{ border: "1.5px solid var(--ink)", padding: "16px 18px" }}>
            <p className="font-mono uppercase text-red m-0 mb-[8px]" style={{ fontSize: "0.594rem", letterSpacing: "0.26em" }}>
              — Your desks —
            </p>
            <h4 className="font-serif italic font-normal text-ink m-0 mb-[16px]" style={{ fontSize: "1.0625rem" }}>
              What you read.
            </h4>
            <div className="flex flex-col gap-[10px]">
              {communities.slice(0, 5).map((c) => (
                <Link key={c.communityId} href={`/forum/${c.slug}`} className="flex items-center gap-[10px] no-underline">
                  {/* Community avatar */}
                  <div
                    className="flex items-center justify-center shrink-0 font-serif italic text-ink"
                    style={{ width: 26, height: 26, background: "var(--paper-2)", border: "1.5px solid var(--ink)", fontSize: "0.8125rem" }}
                  >
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <span className="font-serif italic text-ink flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: "1.0625rem" }}>
                    {c.name}
                  </span>
                  <span className="font-mono text-ink-3 shrink-0" style={{ fontSize: "0.625rem", letterSpacing: "0.1em" }}>
                    {(c.memberCount ?? 0).toLocaleString()}
                  </span>
                </Link>
              ))}
              {communities.length === 0 && (
                <p className="font-body text-ink-3 m-0" style={{ fontSize: "0.875rem" }}>No desks yet.</p>
              )}
            </div>
            <div className="mt-[16px]" style={{ borderTop: "1px solid var(--ink-3)", paddingTop: 14 }}>
              <Btn href="/forum/new" variant="secondary" size="sm" fullWidth>Start a desk</Btn>
            </div>
          </div>

          {/* House rules card */}
          <div className="bg-paper" style={{ border: "1.5px solid var(--ink)", padding: "16px 18px" }}>
            <p className="font-mono uppercase text-red m-0 mb-[8px]" style={{ fontSize: "0.594rem", letterSpacing: "0.26em" }}>
              — House rules —
            </p>
            <h4 className="font-serif italic font-normal text-ink m-0 mb-[16px]" style={{ fontSize: "1.0625rem" }}>
              The four.
            </h4>
            <ol className="list-none p-0 m-0 flex flex-col gap-[12px]">
              {HOUSE_RULES.map((rule, i) => (
                <li key={i} className="flex gap-[10px] font-body text-ink-2" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                  <span className="font-mono font-bold text-red shrink-0" style={{ fontSize: "0.6875rem" }}>
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .forum-grid { grid-template-columns: 1fr !important; }
          .forum-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
