/**
 * Editorial copy helpers for the (forum) route group. Returned headlines
 * may contain inline `<em>` for the red italic accent.
 */

const num = (n: number) => n.toLocaleString("en-US");

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
  const counts = `${num(memberCount)} member${memberCount === 1 ? "" : "s"} · ${num(threadCount)} thread${threadCount === 1 ? "" : "s"} posted`;
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
