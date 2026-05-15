"use client";

import { useCommunityMembers, useAppointModerator, useRemoveModerator } from "@/hooks/use-community";
import { ApiError } from "@/lib/api-client";

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
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "9999px",
          border: "2px solid var(--border-2)", borderTopColor: "var(--accent)",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  if (!members?.length) {
    return (
      <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", textAlign: "center", padding: "32px 0" }}>
        No members found.
      </p>
    );
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, [string, string]> = {
      Owner: ["var(--warning)", "var(--warning-s)"],
      Moderator: ["var(--accent)", "var(--accent-subtle)"],
      Member: ["var(--text-3)", "var(--surface-3)"],
    };
    const [fg, bg] = colors[role] ?? ["var(--text-3)", "var(--surface-3)"];
    return (
      <span style={{
        padding: "2px 8px", borderRadius: "9999px",
        background: bg, color: fg,
        fontSize: "var(--ts-meta)", fontWeight: "600",
      }}>
        {role}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {members.map((m) => {
        const isOwner = m.role === "Owner";
        const isModerator = m.role === "Moderator";
        const isPending =
          (appointModerator.isPending && appointModerator.variables === m.membershipId) ||
          (removeModerator.isPending && removeModerator.variables === m.membershipId);

        const initials = (m.displayName ?? "?").slice(0, 2).toUpperCase();

        return (
          <div
            key={m.membershipId}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: "12px",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              opacity: isPending ? 0.5 : 1, transition: "opacity 150ms",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                width: "32px", height: "32px", borderRadius: "9999px",
                background: "var(--accent-subtle)", color: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--ts-meta)", fontWeight: "700",
              }}>
                {initials}
              </span>
              <div>
                <p style={{ fontSize: "var(--ts-body-sm)", fontWeight: "500", color: "var(--text)" }}>
                  {m.displayName ?? `${m.userId.slice(0, 8)}…`}
                </p>
                <p style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)" }}>
                  Joined {new Date(m.joinedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {roleBadge(m.role)}
              {!isOwner && (
                isModerator ? (
                  <button
                    disabled={isPending}
                    onClick={() => removeModerator.mutate(m.membershipId)}
                    style={{
                      padding: "4px 10px", borderRadius: "8px",
                      background: "var(--danger-s)", color: "var(--danger)",
                      border: "1px solid oklch(62% 0.21 22 / 0.25)",
                      fontSize: "var(--ts-meta)", fontWeight: "500",
                      cursor: isPending ? "not-allowed" : "pointer",
                    }}
                  >
                    Remove Mod
                  </button>
                ) : (
                  <button
                    disabled={isPending}
                    onClick={() => appointModerator.mutate(m.membershipId)}
                    style={{
                      padding: "4px 10px", borderRadius: "8px",
                      background: "var(--accent-subtle)", color: "var(--accent)",
                      border: "1px solid oklch(from var(--accent) l c h / 0.25)",
                      fontSize: "var(--ts-meta)", fontWeight: "500",
                      cursor: isPending ? "not-allowed" : "pointer",
                    }}
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
