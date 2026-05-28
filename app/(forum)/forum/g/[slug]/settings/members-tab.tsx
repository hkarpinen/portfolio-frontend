"use client";

import {
  useCommunityMembers,
  useAppointModerator,
  useRemoveModerator,
} from "@/hooks/use-community";
import { UserInitials } from "@/components/editorial/user-initials";
import { Btn } from "@/components/editorial";

interface Props {
  communityId: string;
}

export function CommunityMembersTab({ communityId }: Props) {
  const { data: members, isLoading } = useCommunityMembers(communityId);
  const appointModerator = useAppointModerator(communityId);
  const removeModerator = useRemoveModerator(communityId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="h-[28px] w-[28px] animate-spin border-2 border-ink-4 border-t-ink" />
      </div>
    );
  }

  if (!members?.length) {
    return <p className="p-[32px_0] text-center text-base text-ink-3">No members found.</p>;
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, [string, string]> = {
      Owner: ["var(--warning)", "var(--warning-s)"],
      Moderator: ["var(--red)", "rgba(178,42,26,0.08)"],
      Member: ["var(--text-3)", "var(--paper-3)"],
    };
    const [fg, bg] = colors[role] ?? ["var(--text-3)", "var(--paper-3)"];
    return (
      /* background/color are runtime values from role lookup — kept as inline style */
      <span className="px-4 py-1 text-sm font-semibold" style={{ background: bg, color: fg }}>
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

        return (
          <div
            key={m.membershipId}
            className={`flex items-center justify-between border-ink bg-paper-2 px-[14px] py-[10px] transition-opacity duration-150${isPending ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-5">
              <UserInitials name={m.displayName} size="lg" />
              <div>
                <p className="text-base font-medium text-ink">
                  {m.displayName ?? `${m.userId.slice(0, 8)}…`}
                </p>
                <p className="text-sm text-ink-3">
                  Joined{" "}
                  {new Date(m.joinedAt).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {roleBadge(m.role)}
              {!isOwner &&
                (isModerator ? (
                  <Btn
                    variant="danger"
                    size="sm"
                    disabled={isPending}
                    onClick={() => removeModerator.mutate(m.membershipId)}
                    aria-label={`Remove moderator role from ${m.displayName ?? "this member"}`}
                  >
                    Remove Mod
                  </Btn>
                ) : (
                  <Btn
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => appointModerator.mutate(m.membershipId)}
                    aria-label={`Make ${m.displayName ?? "this member"} a moderator`}
                  >
                    Make Mod
                  </Btn>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
