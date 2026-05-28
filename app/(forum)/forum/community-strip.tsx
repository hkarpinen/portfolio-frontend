import Link from "next/link";
import { JoinButton } from "./join-button";
import { communityTileMeta } from "@/lib/forum/editorial-copy";
import type { CommunitySummaryResponse } from "@/types/forum";

interface CommunityStripProps {
  communities: CommunitySummaryResponse[];
}

/**
 * <CommunityStrip> — horizontal trending strip for the /forum landing.
 *
 * Uses the `.ed-module` tile pattern shared with the household/finance
 * listing grids, so the strip reads as part of the same design system
 * instead of a forum-bespoke card. Title block links to the community;
 * `<JoinButton>` sits in the module foot as a secondary action — two
 * unambiguous click targets, no nested interactives.
 */
export function CommunityStrip({ communities }: CommunityStripProps) {
  return (
    <ul
      className="m-0 grid list-none gap-4 p-0"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
    >
      {communities.map((c) => {
        const { memberLabel, threadLabel } = communityTileMeta({
          memberCount: c.memberCount ?? 0,
          threadCount: c.threadCount,
        });

        return (
          <li key={c.communityId} className="ed-module">
            <span className="ed-module-kicker" aria-hidden>
              Community
            </span>
            <Link
              href={`/forum/g/${c.slug}`}
              className="ed-module-title no-underline hover:text-red"
            >
              g/<em>{c.slug}</em>
            </Link>
            {c.description ? (
              <p className="ed-module-desc line-clamp-2">{c.description}</p>
            ) : (
              <p className="ed-module-desc italic text-ink-3">No description yet.</p>
            )}
            <p className="ed-module-meta">
              {memberLabel}
              {threadLabel}
            </p>
            <div className="ed-module-foot">
              <JoinButton communityId={c.communityId} />
              <Link
                href={`/forum/g/${c.slug}`}
                className="ed-module-arrow no-underline hover:text-red"
                aria-label={`Open ${c.name}`}
              >
                Open →
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
