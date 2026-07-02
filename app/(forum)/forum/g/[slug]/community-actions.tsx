"use client";

import { Icon } from "@/components/editorial";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommunityMembership, useJoinCommunity } from "@/hooks/use-community";

import { getErrorMessage } from "@/lib/error-messages";

interface CommunityActionsProps {
  communityId: string;
  slug: string;
  isAuthed: boolean;
}

/**
 * <CommunityActions> — membership + management controls for the community
 * page head's `.actions` slot.
 *
 * Renders Terminus `.btn` controls so they sit inline with the `Post` CTA:
 * Join for non-members, Mod queue / Settings for moderators, and a quiet
 * "Joined" badge for regular members. The masthead carries no membership
 * action, so this is the single Join surface.
 */

// Unauthenticated — pitch sign-in as the join path. No membership queries.
function AnonActions() {
  const pathname = usePathname();
  return (
    <Link
      href={`/identity/login?from=${encodeURIComponent(pathname)}`}
      className="btn btn-sm btn-primary no-underline"
    >
      $ join
    </Link>
  );
}

// Authenticated — query membership and render the appropriate controls.
function AuthedActions({ communityId, slug }: { communityId: string; slug: string }) {
  const { data: membership, isLoading } = useCommunityMembership(communityId);
  const joinMutation = useJoinCommunity(communityId);

  const joined = membership?.isMember ?? false;
  const canManage = membership?.role === "Owner" || membership?.role === "Moderator";

  if (isLoading) {
    return <span className="badge opacity-40">…</span>;
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
          className="btn btn-sm btn-primary"
        >
          {joinMutation.isPending ? "Joining…" : "$ join"}
        </button>
      </>
    );
  }

  // Joined — show management entries for mods, plus a quiet "Joined" badge.
  return (
    <>
      {canManage && (
        <>
          <Link href={`/forum/g/${slug}/mod-queue`} className="btn btn-sm no-underline">
            Mod queue
          </Link>
          <Link href={`/forum/g/${slug}/settings`} className="btn btn-sm no-underline">
            <Icon name="settings" size={12} strokeWidth={2} aria-hidden /> Settings
          </Link>
        </>
      )}
      <span className="badge green">
        <Icon name="check" size={11} strokeWidth={2.5} aria-hidden /> Joined
      </span>
    </>
  );
}

export function CommunityActions({ communityId, slug, isAuthed }: CommunityActionsProps) {
  if (!isAuthed) return <AnonActions />;
  return <AuthedActions communityId={communityId} slug={slug} />;
}
