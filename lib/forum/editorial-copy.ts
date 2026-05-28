/**
 * Editorial copy helpers for the (forum) route group. Returned headlines
 * may contain inline `<em>` for the red italic accent.
 */

import { pluralize } from "@/lib/utils";

const num = (n: number) => n.toLocaleString("en-US");

// ── Community tile meta ──────────────────────────────────────────────────────
// The `<CommunityStrip>` on the landing page and the full /forum/communities
// browse page used to hand-roll the same "memberLabel · threadLabel" line.
// Both now call this helper so the wording stays in lockstep.

export function communityTileMeta({
  memberCount,
  threadCount,
}: {
  memberCount: number;
  threadCount: number;
}): { memberLabel: string; threadLabel: string } {
  const memberLabel = `${num(memberCount)} ${pluralize("member", memberCount)}`;
  const threadLabel =
    threadCount > 0 ? ` · ${num(threadCount)} ${pluralize("thread", threadCount)}` : "";
  return { memberLabel, threadLabel };
}

// /forum (list) ──────────────────────────────────────────────────────────────

export function forumHeadline({ communityCount }: { communityCount: number }): string {
  if (communityCount === 0) return `<em>Start</em> the first community`;
  if (communityCount === 1) return `<em>One</em> community on file`;
  return `<em>${num(communityCount)}</em> communities posting`;
}

export function forumDeck({ communityCount }: { communityCount: number }): string {
  if (communityCount === 0) {
    return "Spin up a community to host threads and discussions for any topic the network cares about.";
  }
  return "Threaded discussions across the network. Public to read, account to post.";
}

// /forum/g/[slug] (community) ────────────────────────────────────────────────

export function communityHeadline({ slug }: { slug: string }): string {
  return `g/<em>${slug.replace(/[<>&]/g, "")}</em>`;
}

export function communityDeck({
  description,
  memberCount,
  threadCount,
}: {
  description?: string;
  memberCount: number;
  threadCount: number;
}): string {
  const counts = `${num(memberCount)} ${pluralize("member", memberCount)} · ${num(threadCount)} ${pluralize("thread", threadCount)} posted`;
  if (description && description.trim()) {
    return `${description.trim()} — ${counts}.`;
  }
  return `${counts}.`;
}

// /forum/.../report (moderation) ─────────────────────────────────────────────

/**
 * Confirmation shown after a thread/comment report submits. Previously
 * lived inline at both `report-button.tsx` and `thread-actions.tsx`
 * (audit §5.7) — keeping it centralised means a copy edit lands in one
 * place and the two surfaces can never disagree on tone.
 */
export const REPORT_SUBMITTED_COPY =
  "Thanks for the report. Our moderators will review it shortly.";
