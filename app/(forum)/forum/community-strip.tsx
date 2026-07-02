import Link from "next/link";
import { JoinButton } from "./join-button";
import type { CommunitySummaryResponse } from "@/types/forum";

interface CommunityStripProps {
  communities: CommunitySummaryResponse[];
}

/**
 * <CommunityStrip> — Terminus community grid for the /forum landing.
 *
 * Mirrors the prototype's `.grid-2` of `.module` tiles: `.num` carries the
 * g/slug, a short description, then a `.badge` member count. The prototype's
 * `.badge.green` "online" pill has no live signal in the API yet, so the
 * second badge surfaces the real thread count instead. `<JoinButton>` is a
 * standalone action below the tile body — no interactive controls nested
 * inside the title link.
 */
export function CommunityStrip({ communities }: CommunityStripProps) {
  return (
    <div
      className="grid-2"
      style={{
        gap: "1px",
        background: "var(--border)",
        border: "1px solid var(--border)",
      }}
    >
      {communities.map((c) => {
        const members = (c.memberCount ?? 0).toLocaleString();
        const threads = (c.threadCount ?? 0).toLocaleString();
        return (
          <div key={c.communityId} className="module" style={{ minHeight: 0, padding: 14 }}>
            <Link
              href={`/forum/g/${c.slug}`}
              className="num no-underline hover:text-accent"
            >
              g/{c.slug}
            </Link>
            <p style={{ fontSize: "0.72rem", margin: 0 }}>
              {c.description?.trim() || "No description yet."}
            </p>
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <span className="badge">{members} members</span>
              <span className="badge">{threads} threads</span>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <JoinButton communityId={c.communityId} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
