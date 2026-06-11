"use client";

import { Icon, Spinner } from "@/components/editorial";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useForumSearch } from "@/hooks/use-forum";
import { pluralize, timeAgo } from "@/lib/utils";

import type { SearchResult } from "@/types/forum";

/**
 * Audit §3.3 — the entire interactive search experience (debounced input
 * + results list) lives here so the page shell above can stay server-
 * rendered. Splitting the file keeps the heading + subtitle off the JS
 * bundle on every visit.
 */
export function SearchClient() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  // Debounce: wait 350ms after last keystroke before firing the query.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(input.trim()), 350);
    return () => clearTimeout(timer);
  }, [input]);

  const { data, isPending } = useForumSearch(query);
  const results: SearchResult[] = data?.items ?? [];
  const loading = isPending && query.length > 0;

  return (
    <>
      {/* Search input */}
      <div className="relative">
        <label htmlFor="forum-search" className="sr-only">
          Search threads and communities
        </label>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-7 top-[50%] inline-flex shrink-0 -translate-y-1/2 text-ink-3"
        >
          <Icon name="search" size={16} strokeWidth={2} />
        </span>
        <input
          id="forum-search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          aria-busy={loading}
          placeholder="Search threads and communities…"
          className={`box-border w-full border-ink bg-paper px-8 py-6 pl-20 text-md text-ink shadow-card outline-none ${loading ? "pr-11" : "pr-4"}`}
        />
        {loading && (
          <Spinner size={20} className="absolute right-7 top-[50%] -translate-y-1/2 text-red" />
        )}
      </div>

      {/* Live region announces result count to screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {loading && "Searching…"}
        {!loading &&
          query &&
          results.length > 0 &&
          `${results.length} ${pluralize("result", results.length)} for ${query}`}
        {!loading && query && results.length === 0 && `No results for ${query}`}
      </div>

      {!input.trim() && <p className="text-base text-ink-3">Start typing to search…</p>}

      {query && !loading && results.length > 0 && (
        <p className="text-base text-ink-3" aria-hidden="true">
          {results.length} {pluralize("result", results.length)} for &ldquo;{query}&rdquo;
        </p>
      )}

      {query && !loading && results.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-4 border-ink bg-paper px-12 py-24 shadow-card"
          role="status"
        >
          <div aria-hidden="true" className="ed-medallion">
            <Icon name="search" size={24} strokeWidth={1.75} />
          </div>
          <p className="font-serif text-md font-bold text-ink">No results</p>
          <p className="text-base text-ink-3">Nothing found for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="overflow-hidden border-ink bg-paper shadow-stamp">
          {results.map((result, i) => {
            const href =
              result.itemType === "community"
                ? `/forum/g/${result.slug}`
                : `/forum/g/${result.communitySlug}/threads/${result.itemId}`;
            return (
              <SearchResultRow
                key={result.itemId}
                result={result}
                href={href}
                isLast={i === results.length - 1}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function SearchResultRow({
  result,
  href,
  isLast,
}: {
  result: SearchResult;
  href: string;
  isLast: boolean;
}) {
  const isCommunity = result.itemType === "community";

  return (
    <Link
      href={href}
      className={`flex items-start gap-6 px-9 py-7 no-underline hover:bg-paper-2 transition-colors${isLast ? "" : "border-ink-b"}`}
    >
      <span
        className={`mt-1 shrink-0 px-4 py-1 font-mono text-sm uppercase tracking-[0.04em] ${isCommunity ? "bg-red-soft text-red" : "bg-paper-3 text-ink-2"}`}
      >
        {result.itemType}
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 font-serif text-md font-semibold leading-snug text-ink">{result.title}</p>
        {result.snippet && (
          <p className="mt-3 line-clamp-2 text-base text-ink-3">{result.snippet}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {!isCommunity && result.communityName && (
            <span className="font-mono text-sm text-ink-3">f/{result.communityName}</span>
          )}
          {result.createdAt && (
            <span className="text-sm text-ink-4">{timeAgo(result.createdAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
