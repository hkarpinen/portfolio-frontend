"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForumSearch } from "@/hooks/use-forum";
import { timeAgo } from "@/lib/utils";
import { Icon } from "@/components/editorial/icon";
import type { SearchResult } from "@/types/forum";

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  // Debounce: wait 350ms after last keystroke before firing the query
  useEffect(() => {
    const timer = setTimeout(() => setQuery(input.trim()), 350);
    return () => clearTimeout(timer);
  }, [input]);

  const { data, isPending } = useForumSearch(query);
  const results: SearchResult[] = data?.items ?? [];
  const loading = isPending && query.length > 0;

  return (
    <div className="page-enter flex flex-col gap-12">
      <div>
        <h1 className="font-serif font-bold text-4xl leading-none tracking-snug text-ink m-0">
          Search
        </h1>
        <p className="text-ink-3 mt-2 text-md">Find threads and communities</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <span className="absolute left-[14px] top-[50%] pointer-events-none shrink-0" style={{ transform: "translateY(-50%)", color: "var(--text-3)", display: "inline-flex" }}>
          <Icon name="search" size={16} strokeWidth={2} />
        </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          placeholder="Search threads and communities…"
          className="w-full py-6 px-8 pl-20 bg-paper text-ink text-md outline-none shadow-card border-ink"
          style={{ paddingRight: loading ? "44px" : "16px", boxSizing: "border-box" }}
        />
        {loading && (
          <div className="absolute right-[14px] top-[50%] w-8 h-8 rounded-full" style={{ transform: "translateY(-50%)", border: "2px solid var(--ink-4)", borderTopColor: "var(--red)", animation: "spin 0.7s linear infinite" }} />
        )}
      </div>

      {!input.trim() && (
        <p className="text-base text-ink-3">Start typing to search…</p>
      )}

      {query && !loading && results.length > 0 && (
        <p className="text-base text-ink-3">
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
        </p>
      )}

      {query && !loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-12 bg-paper shadow-card gap-4 border-ink">
          <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center">
            <Icon name="search" size={24} strokeWidth={1.75} />
          </div>
          <p className="font-serif font-bold text-md text-ink">No results</p>
          <p className="text-base text-ink-3">Nothing found for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-paper overflow-hidden shadow-stamp border-ink">
          {results.map((result, i) => {
            const href =
              result.itemType === "community"
                ? `/forum/${result.slug}`
                : `/forum/${result.communitySlug}/threads/${result.itemId}`;
            return (
              <SearchResultRow key={result.itemId} result={result} href={href} isLast={i === results.length - 1} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function SearchResultRow({ result, href, isLast }: { result: SearchResult; href: string; isLast: boolean }) {
  const isCommunity = result.itemType === "community";

  return (
    <Link
      href={href}
      className="flex items-start gap-6 py-[14px] px-[18px] no-underline hover:bg-paper-2 transition-colors"
      style={{ borderBottom: isLast ? "none" : "1.5px solid var(--ink)" }}
    >
      <span
        className="shrink-0 mt-1 text-sm font-mono py-1 px-4 tracking-[0.04em]"
        style={{
          background: isCommunity ? "rgba(178,42,26,0.08)" : "var(--paper-3)",
          color: isCommunity ? "var(--red)" : "var(--text-2)",
          textTransform: "uppercase" as const,
        }}
      >
        {result.itemType}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-serif font-semibold text-md text-ink m-0 leading-snug">
          {result.title}
        </p>
        {result.snippet && (
          <p
            className="text-base text-ink-3 mt-[6px] overflow-hidden"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {result.snippet}
          </p>
        )}
        <div className="flex items-center gap-4 mt-[6px] flex-wrap">
          {!isCommunity && result.communityName && (
            <span className="text-sm font-mono text-ink-3">
              f/{result.communityName}
            </span>
          )}
          {result.createdAt && (
            <span className="text-sm text-ink-4">{timeAgo(result.createdAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

