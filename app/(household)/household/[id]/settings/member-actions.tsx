"use client";

import { useState } from "react";
import { useRemoveMember, useChangeMemberRole, useTransferOwnership } from "@/hooks/use-household";
import type { MembershipResponse } from "@/types/finance";
import { Btn } from "@/components/editorial/button";

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

  return (
    <section className="border-ink bg-paper-2 p-[24px] shadow-sm flex flex-col gap-[16px]">
      <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
        Members
      </p>
      {members.length === 0 ? (
        <p className="text-ink-3 text-base">No active members.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {members.map((m) => {
            const isSelf = m.userId.toLowerCase() === myUserId.toLowerCase();
            const canRemove = isOwner && !isSelf;
            const canChangeRole = isOwner && !isSelf && m.role !== "Owner";
            return (
              <div key={m.membershipId} className="flex items-center justify-between bg-paper-2 py-6 px-8 border-ink">
                <div>
                  <p className="font-semibold text-base text-ink flex items-center gap-3">
                    {m.displayName || `${m.userId.slice(0, 8)}…`}
                    {isSelf && (
                      <span className="bg-red-soft text-red py-1 px-4 text-sm font-mono">you</span>
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
                      className="h-[30px] p-[0_8px] bg-paper text-base text-ink-2 cursor-pointer font-body border-ink"
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
                          <Btn
                            variant="primary"
                            size="sm"
                            onClick={() => transferOwnership.mutate(m.userId, { onSuccess: () => setTransferTargetId(null) })}
                            disabled={transferOwnership.isPending}
                          >
                            {transferOwnership.isPending ? "Transferring…" : "Confirm"}
                          </Btn>
                          <Btn variant="ghost" size="sm" onClick={() => setTransferTargetId(null)}>
                            Cancel
                          </Btn>
                        </div>
                      ) : (
                        <Btn
                          variant="secondary"
                          size="sm"
                          onClick={() => setTransferTargetId(m.membershipId)}
                        >
                          Transfer Ownership
                        </Btn>
                      )}
                      <Btn
                        variant="danger"
                        size="sm"
                        onClick={() => onRemoveMember(m.membershipId)}
                        disabled={removingId === m.membershipId}
                      >
                        {removingId === m.membershipId ? "Removing…" : "Remove"}
                      </Btn>
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
              <div key={m.membershipId} className="flex items-center justify-between bg-paper-2 py-[10px] px-[14px] border-ink-dashed">
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
