import Link from "next/link";
import { ForumTabs } from "./forum-tabs";
import { fetchCommunitiesServer } from "@/lib/api/communities";
import { fetchThreadsServer } from "@/lib/api/forum";
import type { CommunitySummaryResponse } from "@/types/forum";

export const dynamic = 'force-dynamic';

const FORUM_RULES = [
  "Be respectful and constructive in all discussions.",
  "No spam, self-promotion without context, or low-effort posts.",
  "Keep threads on-topic for their community.",
  "Report rule-breaking content rather than engaging with it.",
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

  const trending = [...communities]
    .sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0))
    .slice(0, 6);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "28px", color: "var(--text)", margin: 0 }}>
            Forum
          </h1>
          <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
            {communities.length} communit{communities.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Link href="/communities/new" style={{ background: "var(--accent)", color: "#fff", padding: "8px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
          + New Community
        </Link>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "24px", alignItems: "start" }} className="forum-grid">
        {/* Left — tabs + content */}
        <ForumTabs
          communities={communities}
          feedThreads={feedThreads}
          hotThreads={hotThreads}
          communitySlugMap={communitySlugMap}
        />

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="forum-sidebar">
          {/* Forum rules card */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px 18px", boxShadow: "var(--shadow-sm)" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Community Rules</p>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {FORUM_RULES.map((rule, i) => (
                <li key={i} style={{ display: "flex", gap: "10px", fontSize: "12px", color: "var(--text-2)", lineHeight: "1.5" }}>
                  <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "var(--accent-subtle)", color: "var(--accent)", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{i + 1}</span>
                  {rule}
                </li>
              ))}
            </ol>
          </div>

          {/* Popular communities */}
          {trending.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px 18px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Popular</p>
                <Link href="/communities/new" style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>+ Create</Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                {trending.map((c) => (
                  <Link key={c.communityId} href={`/communities/${c.slug}`} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", padding: "6px", borderRadius: "var(--r-md)" }}>
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.imageUrl} alt="" style={{ width: "36px", height: "36px", borderRadius: "var(--r-md)", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: "36px", height: "36px", borderRadius: "var(--r-md)", background: c.color ? `${c.color}1a` : "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: c.color ?? "var(--accent)", fontFamily: "var(--ff-display)", flexShrink: 0 }}>{c.name[0]?.toUpperCase()}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>{c.memberCount ?? 0} members</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
