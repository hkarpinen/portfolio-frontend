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
    initialData: sort === "hot" ? { items: initialHot, total: initialHot.length } : undefined,
    staleTime: 60_000,
  });

  const threads: ThreadSummaryResponse[] = data?.items ?? [];

  return (
    <section aria-labelledby="forum-feed-heading" className="flex flex-col gap-4">
      {/* Sort tabs — same visual language as the community page section tabs */}
      <div className="ed-tabs-row">
        <h2 id="forum-feed-heading" className="sr-only">
          Threads
        </h2>
        <nav aria-label="Sort threads" className="ed-tabs-list flex-1" role="tablist">
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
                className="ed-tab"
              >
                {label}
              </button>
            );
          })}
        </nav>
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
        className="flex flex-col"
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
