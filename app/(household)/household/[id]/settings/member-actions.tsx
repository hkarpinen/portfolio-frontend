"use client";

import { Btn } from "@/components/editorial";
import { useState } from "react";
import { useRemoveMember, useChangeMemberRole, useTransferOwnership } from "@/hooks/use-household";
import type { MembershipResponse } from "@/types/membership";

interface MemberActionsProps {
  householdId: string;
  members: MembershipResponse[];
  myUserId: string;
  isOwner: boolean;
  isPrivileged: boolean;
}

export function MemberActions({
  householdId,
  members,
  myUserId,
  isOwner,
  isPrivileged,
}: MemberActionsProps) {
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
    <section className="flex flex-col gap-8 border-ink bg-paper-2 p-12 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.1em] text-ink-3">Members</p>
      {members.length === 0 ? (
        <p className="text-base text-ink-3">No active members.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {members.map((m) => {
            const isSelf = m.userId.toLowerCase() === myUserId.toLowerCase();
            const canRemove = isOwner && !isSelf;
            const canChangeRole = isOwner && !isSelf && m.role !== "Owner";
            return (
              <div
                key={m.membershipId}
                className="flex items-center justify-between border-ink bg-paper-2 px-8 py-6"
              >
                <div>
                  <p className="flex items-center gap-3 text-base font-semibold text-ink">
                    {m.displayName || `${m.userId.slice(0, 8)}…`}
                    {isSelf && (
                      <span className="bg-red-soft px-4 py-1 font-mono text-sm text-red">you</span>
                    )}
                  </p>
                  <p className="mt-1 text-base capitalize text-ink-3">{m.role}</p>
                </div>
                <div className="flex items-center gap-4">
                  {canChangeRole && (
                    <select
                      value={m.role}
                      disabled={changeMemberRoleMutation.isPending}
                      onChange={(e) =>
                        changeMemberRoleMutation.mutate({
                          membershipId: m.membershipId,
                          role: e.target.value,
                        })
                      }
                      className="h-[30px] cursor-pointer border-ink bg-paper p-[0_8px] font-body text-base text-ink-2"
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  )}
                  {canRemove && (
                    <div className="flex flex-col items-end gap-3">
                      {transferTargetId === m.membershipId ? (
                        <div className="flex items-center gap-3">
                          <span className="text-base text-ink-2">
                            Transfer to {m.displayName || m.userId.slice(0, 8)}?
                          </span>
                          <Btn
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              transferOwnership.mutate(m.userId, {
                                onSuccess: () => setTransferTargetId(null),
                              })
                            }
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
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-ink-3">
            Pending Invites
          </p>
          <div className="flex flex-col gap-3">
            {members
              .filter((m) => !m.isActive && m.invitationCode)
              .map((m) => (
                <div
                  key={m.membershipId}
                  className="border-ink-dashed flex items-center justify-between bg-paper-2 px-7 py-5"
                >
                  <div>
                    <p className="font-mono text-base text-ink-2">{m.invitationCode}</p>
                    <p className="mt-1 text-sm text-ink-3">Awaiting acceptance</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
