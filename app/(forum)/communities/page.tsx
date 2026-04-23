import Link from "next/link";
import { SERVER_API } from "@/lib/api-url";
import { CommunityCard } from "./community-card";

export const dynamic = 'force-dynamic';

const API_BASE = SERVER_API;

interface Community {
  communityId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount?: number;
  threadCount?: number;
}

async function getCommunities(): Promise<Community[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/forum/communities?page=1&pageSize=20`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.items ?? data ?? [];
  } catch {
    return [];
  }
}

export default async function CommunitiesPage() {
  const communities = await getCommunities();

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "28px", color: "var(--text)", margin: 0 }}>
            Communities
          </h1>
          <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "14px" }}>Browse and join communities</p>
        </div>
        <Link
          href="/communities/new"
          style={{
            background: "var(--accent)", color: "#fff",
            padding: "8px 16px", borderRadius: "12px",
            fontSize: "13px", fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + New Community
        </Link>
      </div>

      {communities.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "64px 24px",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", boxShadow: "var(--shadow-sm)",
          gap: "12px",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "var(--accent-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px",
          }}>
            🏘️
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>No communities yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Be the first to create one</p>
          <Link
            href="/communities/new"
            style={{
              fontSize: "13px", fontWeight: 600,
              color: "var(--accent)", textDecoration: "none",
            }}
          >
            Create the first one →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {communities.map((community) => (
            <CommunityCard
              key={community.communityId}
              communityId={community.communityId}
              name={community.name}
              description={community.description}
              imageUrl={community.imageUrl}
              memberCount={community.memberCount}
              threadCount={community.threadCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
