"use client";

import { Icon, ListWithLoadingAndEmpty } from "@/components/editorial";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ThreadRow } from "./thread-row";
import { fetchThreads } from "@/lib/api/forum";
import { forumKeys } from "@/lib/query-keys";
import type { ThreadSummaryResponse } from "@/types/forum";

type Sort = "hot" | "new" | "top";

const SORTS: { key: Sort; label: string }[] = [
  { key: "hot", label: "Hot" },
  { key: "new", label: "New" },
  { key: "top", label: "Top" },
];

// Section heading mirrors the active feed (prototype shows `// HOT_THREADS`).
const SECTION_LABEL: Record<Sort, string> = {
  hot: "// HOT_THREADS",
  new: "// NEW_THREADS",
  top: "// TOP_THREADS",
};

export function ForumFeed({
  initialHot,
  slugMap,
}: {
  /** Server-seeded "hot" sort. Other sorts are fetched lazily on click. */
  initialHot: ThreadSummaryResponse[];
  slugMap: Record<string, string>;
}) {
  const [sort, setSort] = useState<Sort>("hot");

  // Only the active sort is fetched. "hot" is hydrated from server-rendered
  // initialData so the first paint is free; switching to "new" or "top"
  // triggers a fetch the first time, then caches per react-query.
  const { data, isLoading } = useQuery({
    queryKey: forumKeys.threads(undefined, sort),
    queryFn: () => fetchThreads({ sort, pageSize: 30 }),
    initialData: sort === "hot" ? { items: initialHot, totalCount: initialHot.length } : undefined,
    staleTime: 60_000,
  });

  const threads: ThreadSummaryResponse[] = data?.items ?? [];

  return (
    <section aria-labelledby="forum-feed-heading" className="flex flex-col">
      {/* Feed tabs — Terminus `.tabs`. Stateful sort buttons; `.tabs button` +
          `.tabs button[aria-selected]` in globals.css supply the styling and
          active amber underline. "Saved" is omitted: no saved-threads endpoint. */}
      <nav className="tabs" role="tablist" aria-label="Feed tabs">
        {SORTS.map(({ key, label }) => {
          const isActive = key === sort;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setSort(key)}
            >
              {label}
            </button>
          );
        })}
      </nav>

      <div className="section-h" style={{ marginBottom: 0 }}>
        <h2 id="forum-feed-heading">{SECTION_LABEL[sort]}</h2>
      </div>

      <ListWithLoadingAndEmpty
        items={threads}
        isLoading={isLoading}
        loadingHint="Loading…"
        empty={{
          glyph: <Icon name="forum" size={24} strokeWidth={1.5} />,
          title: "No threads yet",
          body: "Join a community and start the first thread.",
          cta: { label: "+ New thread", href: "/forum/new" },
        }}
        className="stack"
      >
        {(t) => (
          <ThreadRow
            key={t.threadId}
            thread={t}
            slug={slugMap[t.communityId] ?? t.communitySlug ?? ""}
          />
        )}
      </ListWithLoadingAndEmpty>
    </section>
  );
}
