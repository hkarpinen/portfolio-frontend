"use client";

import { useState } from "react";
import { useRemoveMember, useChangeMemberRole, useTransferOwnership } from "@/hooks/use-household";
import type { MembershipResponse } from "@/types/finance";

interface MemberActionsProps {
  householdId: string;
  members: MembershipResponse[];
  myUserId: string;
  isOwner: boolean;
  isPrivileged: boolean;
}

export function MemberActions({ householdId, members, myUserId, isOwner, isPrivileged }: MemberActionsProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);

  const removeMemberMutation = useRemoveMember(householdId);
  const changeMemberRoleMutation = useChangeMemberRole(householdId);
  const transferOwnership = useTransferOwnership(householdId);

  const onRemoveMember = (membershipId: string) => {
    setRemovingId(membershipId);
    removeMemberMutation.mutate(membershipId, { onSettled: () => setRemovingId(null) });
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--paper-2)",
    border: "1.5px solid var(--ink)",
    
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  return (
    <section style={cardStyle}>
      <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
        Members
      </p>
      {members.filter((m) => m.isActive).length === 0 ? (
        <p className="text-ink-3 text-base">No active members.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {members.filter((m) => m.isActive).map((m) => {
            const isSelf = m.userId.toLowerCase() === myUserId.toLowerCase();
            const canRemove = isOwner && !isSelf;
            const canChangeRole = isOwner && !isSelf && m.role !== "Owner";
            return (
              <div key={m.membershipId} className="flex items-center justify-between bg-paper-2 py-6 px-8" style={{ border: "1.5px solid var(--ink)" }}>
                <div>
                  <p className="font-semibold text-base text-ink flex items-center gap-3">
                    {m.displayName || `${m.userId.slice(0, 8)}…`}
                    {isSelf && (
                      <span className="bg-[rgba(178,42,26,0.10)] text-red py-1 px-4 text-sm font-mono">you</span>
                    )}
                  </p>
                  <p className="text-base text-ink-3 mt-1 capitalize">{m.role}</p>
                </div>
                <div className="flex gap-4 items-center">
                  {canChangeRole && (
                    <select
                      value={m.role}
                      disabled={changeMemberRoleMutation.isPending}
                      onChange={(e) => changeMemberRoleMutation.mutate({ membershipId: m.membershipId, role: e.target.value })}
                      className="h-[30px] p-[0_8px] bg-paper text-base text-ink-2 cursor-pointer font-body" style={{ border: "1.5px solid var(--ink)" }}
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  )}
                  {canRemove && (
                    <div className="flex gap-3 flex-col items-end">
                      {transferTargetId === m.membershipId ? (
                        <div className="flex gap-3 items-center">
                          <span className="text-base text-ink-2">Transfer to {m.displayName || m.userId.slice(0, 8)}?</span>
                          <button
                            onClick={() => transferOwnership.mutate(m.userId, { onSuccess: () => setTransferTargetId(null) })}
                            disabled={transferOwnership.isPending}
                            className="bg-red text-white py-2 px-5 text-base font-semibold font-body" style={{ border: "none", cursor: transferOwnership.isPending ? "not-allowed" : "pointer" }}
                          >
                            {transferOwnership.isPending ? "Transferring…" : "Confirm"}
                          </button>
                          <button onClick={() => setTransferTargetId(null)} className="bg-transparent text-base text-ink-3 cursor-pointer font-body" style={{ border: "none" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setTransferTargetId(m.membershipId)}
                          className="bg-paper-2 text-ink-2 py-2 px-6 text-base font-medium cursor-pointer font-body" style={{ border: "1.5px solid var(--ink)" }}
                        >
                          Transfer Ownership
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveMember(m.membershipId)}
                        disabled={removingId === m.membershipId}
                        className="bg-[rgba(178,42,26,0.10)] text-red py-2 px-6 text-base font-medium font-body" style={{ border: "1px solid var(--danger)", cursor: removingId === m.membershipId ? "not-allowed" : "pointer", opacity: removingId === m.membershipId ? 0.5 : 1 }}
                      >
                        {removingId === m.membershipId ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {isPrivileged && members.some((m) => !m.isActive && m.invitationCode) && (
        <div>
          <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em] mb-4">
            Pending Invites
          </p>
          <div className="flex flex-col gap-3">
            {members.filter((m) => !m.isActive && m.invitationCode).map((m) => (
              <div key={m.membershipId} className="flex items-center justify-between bg-paper-2 py-[10px] px-[14px]" style={{ border: "1.5px dashed var(--ink-3)" }}>
                <div>
                  <p className="font-mono text-base text-ink-2">{m.invitationCode}</p>
                  <p className="text-sm text-ink-3 mt-1">Awaiting acceptance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
