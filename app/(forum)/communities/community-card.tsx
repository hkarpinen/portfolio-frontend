"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { api, ApiError } from "@/lib/api-client";

interface CommunityCardProps {
  communityId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount?: number;
  threadCount?: number;
}

export function CommunityCard({ communityId, name, description, imageUrl, memberCount, threadCount }: CommunityCardProps) {
  const [joined, setJoined] = useState<boolean | null>(null);
  const [joining, setJoining] = useState(false);
  const [hovered, setHovered] = useState(false);
  const slug = encodeURIComponent(name);

  useEffect(() => {
    api.get<{ isMember?: boolean }>(`/api/forum/communities/${communityId}/membership`)
      .then((data) => setJoined(data?.isMember ?? false))
      .catch(() => setJoined(false));
  }, [communityId]);

  async function handleJoin(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (joining) return;
    setJoining(true);
    try {
      await api.post(`/api/forum/communities/${communityId}/join`);
      setJoined(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) window.location.href = "/login";
    } finally {
      setJoining(false);
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "box-shadow 180ms ease, transform 180ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <Link href={`/communities/${slug}`} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }}
            />
          ) : (
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: "var(--accent-subtle)", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", fontWeight: 700, color: "var(--accent)",
              fontFamily: "var(--ff-display)",
            }}>
              {name[0].toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: "15px", color: "var(--text)", margin: 0 }}>{name}</h2>
            {description && (
              <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "2px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{description}</p>
            )}
            <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
              {memberCount !== undefined && (
                <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-3)" }}>{memberCount.toLocaleString()} members</span>
              )}
              {threadCount !== undefined && (
                <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-3)" }}>{threadCount.toLocaleString()} threads</span>
              )}
            </div>
          </div>
        </Link>

        <div style={{ flexShrink: 0 }}>
          {joined === null ? (
            <div style={{ width: "64px", height: "28px", borderRadius: "9999px", background: "var(--surface-3)" }} className="skeleton" />
          ) : joined ? (
            <span style={{
              fontSize: "11px", fontWeight: 500, color: "var(--text-3)",
              border: "1px solid var(--border)", padding: "2px 8px",
              borderRadius: "9999px", background: "var(--surface-3)",
            }}>
              Joined
            </span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              style={{
                fontSize: "12px", fontWeight: 500,
                background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: "12px",
                padding: "4px 14px", cursor: joining ? "not-allowed" : "pointer",
                opacity: joining ? 0.5 : 1,
              }}
            >
              {joining ? "…" : "Join"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
