"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommunityMembership, useJoinCommunity } from "@/hooks/use-community";
import { Icon } from "@/components/editorial/icon";
import { getErrorMessage } from "@/lib/error-messages";

interface CommunityActionsProps {
  communityId: string;
  slug: string;
  isAuthed: boolean;
}

/**
 * <CommunityActions> — membership + management links for the community page
 * tab strip's right-hand aux slot.
 *
 * Renders compact `.ed-tab-aux` links so the row reads as one continuous strip
 * with the THREADS · RULES · MEMBERS tabs to its left. The masthead already
 * carries the primary "+ New thread" CTA — this slot's job is membership
 * (Join) for non-members and management (Mod queue / Settings) for mods.
 */

// Unauthenticated — pitch sign-in as the join path. No membership queries.
function AnonActions() {
  const pathname = usePathname();
  return (
    <Link href={`/login?from=${encodeURIComponent(pathname)}`} className="ed-tab-aux text-red">
      Join community <span aria-hidden="true">→</span>
    </Link>
  );
}

// Authenticated — query membership and render the appropriate aux links.
function AuthedActions({ communityId, slug }: { communityId: string; slug: string }) {
  const { data: membership, isLoading } = useCommunityMembership(communityId);
  const joinMutation = useJoinCommunity(communityId);

  const joined = membership?.isMember ?? false;
  const canManage = membership?.role === "Owner" || membership?.role === "Moderator";

  if (isLoading) {
    // Reserve roughly the width of "Join community" so the tabs row doesn't
    // shift when membership resolves.
    return <span className="ed-tab-aux opacity-40">…</span>;
  }

  if (!joined) {
    return (
      <>
        {joinMutation.isError && (
          <span className="self-center font-mono text-xs uppercase tracking-wide text-red">
            {getErrorMessage(joinMutation.error, "Failed to join")}
          </span>
        )}
        <button
          type="button"
          onClick={() => joinMutation.mutate()}
          disabled={joinMutation.isPending}
          className="ed-tab-aux cursor-pointer border-0 bg-transparent text-red disabled:cursor-not-allowed disabled:opacity-60"
        >
          {joinMutation.isPending ? "Joining…" : "Join community"} <span aria-hidden="true">→</span>
        </button>
      </>
    );
  }

  // Joined — show management entries for mods, plus a quiet "Joined" badge
  // so the slot isn't blank for regular members.
  return (
    <>
      {canManage && (
        <>
          <Link href={`/forum/g/${slug}/mod-queue`} className="ed-tab-aux">
            Mod queue <span aria-hidden="true">↗</span>
          </Link>
          <Link href={`/forum/g/${slug}/settings`} className="ed-tab-aux">
            <Icon name="settings" size={13} strokeWidth={2} aria-hidden /> Settings
          </Link>
        </>
      )}
      {!canManage && (
        <span className="ed-tab-aux cursor-default text-ink-3">
          <Icon name="check" size={13} strokeWidth={2} aria-hidden /> Joined
        </span>
      )}
    </>
  );
}

export function CommunityActions({ communityId, slug, isAuthed }: CommunityActionsProps) {
  if (!isAuthed) return <AnonActions />;
  return <AuthedActions communityId={communityId} slug={slug} />;
}
