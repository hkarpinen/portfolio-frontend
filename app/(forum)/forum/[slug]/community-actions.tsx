"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommunityMembership, useJoinCommunity } from "@/hooks/use-community";
import { ApiError } from "@/lib/api-client";
import styles from "./community-actions.module.css";

interface CommunityActionsProps {
  communityId: string;
  slug: string;
  isAuthed: boolean;
}

// Rendered only when unauthenticated — no queries fired
function AnonActions() {
  const pathname = usePathname();
  return (
    <Link
      href={`/login?from=${encodeURIComponent(pathname)}`}
      className={styles.btnSecondary}
    >
      Join community
    </Link>
  );
}

// Rendered only when authenticated — safe to call membership queries
function AuthedActions({ communityId, slug }: { communityId: string; slug: string }) {
  const { data: membership, isLoading } = useCommunityMembership(communityId);
  const joinMutation = useJoinCommunity(communityId);

  const joined = membership?.isMember ?? false;
  const canManage = membership?.role === "Owner" || membership?.role === "Moderator";

  if (isLoading) {
    return (
      <div className="w-48 h-[36px] bg-paper-3" style={{ animation: "shimmer 1.6s ease-in-out infinite", backgroundImage: "linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)", backgroundSize: "200% 100%" }} />
    );
  }

  return (
    <div className="flex items-center gap-5 shrink-0">
      {joinMutation.isError && (
        <span className="text-base text-red">
          {joinMutation.error instanceof ApiError ? joinMutation.error.message : "Failed to join."}
        </span>
      )}
      {joined ? (
        <>
          {canManage && (
            <Link
              href={`/forum/${slug}/settings`}
              className={styles.btnSecondary}
            >
              ⚙ Settings
            </Link>
          )}
          <Link
            href={`/forum/${slug}/threads/new`}
            className={styles.btnPrimary}
          >
            + New thread
          </Link>
        </>
      ) : (
        <button
          onClick={() => joinMutation.mutate()}
          disabled={joinMutation.isPending}
          className={styles.btnSecondary}
        >
          {joinMutation.isPending ? "Joining…" : "Join community"}
        </button>
      )}
    </div>
  );
}

export function CommunityActions({ communityId, slug, isAuthed }: CommunityActionsProps) {
  if (!isAuthed) return <AnonActions />;
  return <AuthedActions communityId={communityId} slug={slug} />;
}