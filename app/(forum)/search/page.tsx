"use client";

import { useState } from "react";
import Link from "next/link";
import { useForumSearch } from "@/hooks/use-forum";
import type { SearchResult } from "@/types/forum";

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { data, isPending } = useForumSearch(query);
  const results: SearchResult[] = data ? (Array.isArray(data) ? data : (data.items ?? [])) : [];
  const loading = isPending && query.trim().length > 0;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-h2)", lineHeight: "var(--lh-display)", letterSpacing: "-0.02em", color: "var(--text)", margin: 0 }}>
          Search
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "var(--ts-body)" }}>Find threads and communities</p>
      </div>

      {/* Search input */}
      <div style={{ position: "relative" }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Search threads…"
          style={{
            width: "100%", padding: "12px 16px",
            paddingLeft: "40px",
            paddingRight: loading ? "44px" : "16px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "12px", color: "var(--text)", fontSize: "var(--ts-body)",
            outline: "none", boxSizing: "border-box",
            boxShadow: "var(--shadow-sm)",
          }}
        />
        {loading && (
          <div style={{
            position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
            width: "16px", height: "16px", borderRadius: "9999px",
            border: "2px solid var(--border)", borderTopColor: "var(--accent)",
            animation: "spin 0.7s linear infinite",
          }} />
        )}
      </div>

      {!query.trim() && (
        <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>Start typing to search…</p>
      )}

      {query.trim() && !loading && results.length > 0 && (
        <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
        </p>
      )}

      {query.trim() && !loading && results.length === 0 && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "48px 24px",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", boxShadow: "var(--shadow-sm)", gap: "8px",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "var(--accent-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "var(--ts-sub)",
          }}>
            🔍
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-body)", color: "var(--text)" }}>No results</p>
          <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)" }}>Nothing found for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {results.length > 0 && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)",
        }}>
          {results.map((result, i) => {
            const href =
              result.type === "community" && result.slug
                ? `/communities/${result.slug}`
                : result.communitySlug && result.id
                ? `/communities/${result.communitySlug}/threads/${result.id}`
                : "#";
            return (
              <SearchResultRow key={result.id} result={result} href={href} isLast={i === results.length - 1} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function SearchResultRow({ result, href, isLast }: { result: SearchResult; href: string; isLast: boolean }) {

  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "flex-start", gap: "12px",
        padding: "14px 18px",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        textDecoration: "none",
      }}
    >
      <span style={{
        flexShrink: 0, marginTop: "2px",
        fontSize: "var(--ts-meta)", fontWeight: 500,
        background: result.type === "community" ? "var(--accent-subtle)" : "var(--surface-3)",
        color: result.type === "community" ? "var(--accent)" : "var(--text-2)",
        padding: "2px 8px", borderRadius: "9999px",
        textTransform: "uppercase" as const, letterSpacing: "0.04em",
      }}>
        {result.type}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: "var(--ts-body)", color: "var(--text)", margin: 0 }}>
          {result.title ?? result.name}
        </p>
        {result.excerpt && (
          <p style={{
            fontSize: "var(--ts-body-sm)", color: "var(--text-3)", marginTop: "4px",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {result.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
