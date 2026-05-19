"use client";

import { useCommunityMembers, useAppointModerator, useRemoveModerator } from "@/hooks/use-community";
import { ApiError } from "@/lib/api-client";
import { getInitials } from "@/lib/utils";

interface Props {
  communityId: string;
  currentUserId?: string;
}

export function CommunityMembersTab({ communityId, currentUserId }: Props) {
  const { data: members, isLoading } = useCommunityMembers(communityId);
  const appointModerator = useAppointModerator(communityId);
  const removeModerator = useRemoveModerator(communityId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-[28px] h-[28px] "  style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!members?.length) {
    return (
      <p className="text-base text-ink-3 text-center p-[32px_0]">
        No members found.
      </p>
    );
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, [string, string]> = {
      Owner: ["var(--warning)", "var(--warning-s)"],
      Moderator: ["var(--red)", "rgba(178,42,26,0.08)"],
      Member: ["var(--text-3)", "var(--paper-3)"],
    };
    const [fg, bg] = colors[role] ?? ["var(--text-3)", "var(--paper-3)"];
    return (
      <span className="py-1 px-4 text-sm font-semibold" style={{ background: bg, color: fg }}>
        {role}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {members.map((m) => {
        const isOwner = m.role === "Owner";
        const isModerator = m.role === "Moderator";
        const isPending =
          (appointModerator.isPending && appointModerator.variables === m.membershipId) ||
          (removeModerator.isPending && removeModerator.variables === m.membershipId);

        const initials = getInitials(m.displayName);

        return (
          <div
            key={m.membershipId}
            className="flex items-center justify-between py-[10px] px-[14px] bg-paper-2 border-ink" style={{opacity: isPending ? 0.5 : 1, transition: "opacity 150ms" }}
          >
            <div className="flex items-center gap-5">
              <span className="w-16 h-16 bg-red-soft text-red flex items-center justify-center text-sm font-bold">
                {initials}
              </span>
              <div>
                <p className="text-base font-medium text-ink">
                  {m.displayName ?? `${m.userId.slice(0, 8)}…`}
                </p>
                <p className="text-sm text-ink-3">
                  Joined {new Date(m.joinedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {roleBadge(m.role)}
              {!isOwner && (
                isModerator ? (
                  <button
                    disabled={isPending}
                    onClick={() => removeModerator.mutate(m.membershipId)}
                    className="py-2 px-5 bg-red-soft text-red text-sm font-medium" style={{ border: "1px solid oklch(62% 0.21 22 / 0.25)", cursor: isPending ? "not-allowed" : "pointer" }}
                  >
                    Remove Mod
                  </button>
                ) : (
                  <button
                    disabled={isPending}
                    onClick={() => appointModerator.mutate(m.membershipId)}
                    className="py-2 px-5 bg-red-soft text-red text-sm font-medium" style={{ border: "1.5px solid var(--red)", cursor: isPending ? "not-allowed" : "pointer" }}
                  >
                    Make Mod
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
