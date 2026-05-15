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
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  return (
    <section style={cardStyle}>
      <p style={{ fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Members
      </p>
      {members.filter((m) => m.isActive).length === 0 ? (
        <p style={{ color: "var(--text-3)", fontSize: "var(--ts-body-sm)" }}>No active members.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {members.filter((m) => m.isActive).map((m) => {
            const isSelf = m.userId.toLowerCase() === myUserId.toLowerCase();
            const canRemove = isOwner && !isSelf;
            const canChangeRole = isOwner && !isSelf && m.role !== "Owner";
            return (
              <div key={m.membershipId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 16px" }}>
                <div>
                  <p style={{ fontWeight: "600", fontSize: "var(--ts-body-sm)", color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}>
                    {m.displayName || `${m.userId.slice(0, 8)}…`}
                    {isSelf && (
                      <span style={{ background: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "9999px", padding: "2px 8px", fontSize: "var(--ts-meta)", fontWeight: "600" }}>you</span>
                    )}
                  </p>
                  <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", marginTop: "2px", textTransform: "capitalize" }}>{m.role}</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {canChangeRole && (
                    <select
                      value={m.role}
                      disabled={changeMemberRoleMutation.isPending}
                      onChange={(e) => changeMemberRoleMutation.mutate({ membershipId: m.membershipId, role: e.target.value })}
                      style={{ height: "30px", padding: "0 8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "var(--ts-label)", color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--ff-body)" }}
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  )}
                  {canRemove && (
                    <div style={{ display: "flex", gap: "6px", flexDirection: "column", alignItems: "flex-end" }}>
                      {transferTargetId === m.membershipId ? (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ fontSize: "var(--ts-label)", color: "var(--text-2)" }}>Transfer to {m.displayName || m.userId.slice(0, 8)}?</span>
                          <button
                            onClick={() => transferOwnership.mutate(m.userId, { onSuccess: () => setTransferTargetId(null) })}
                            disabled={transferOwnership.isPending}
                            style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", padding: "4px 10px", fontSize: "var(--ts-label)", fontWeight: "600", cursor: transferOwnership.isPending ? "not-allowed" : "pointer", fontFamily: "var(--ff-body)" }}
                          >
                            {transferOwnership.isPending ? "Transferring…" : "Confirm"}
                          </button>
                          <button onClick={() => setTransferTargetId(null)} style={{ background: "none", border: "none", fontSize: "var(--ts-label)", color: "var(--text-3)", cursor: "pointer", fontFamily: "var(--ff-body)" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setTransferTargetId(m.membershipId)}
                          style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "4px 12px", fontSize: "var(--ts-label)", fontWeight: "500", cursor: "pointer", fontFamily: "var(--ff-body)" }}
                        >
                          Transfer Ownership
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveMember(m.membershipId)}
                        disabled={removingId === m.membershipId}
                        style={{ background: "var(--danger-s)", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: "8px", padding: "4px 12px", fontSize: "var(--ts-label)", fontWeight: "500", cursor: removingId === m.membershipId ? "not-allowed" : "pointer", opacity: removingId === m.membershipId ? 0.5 : 1, fontFamily: "var(--ff-body)" }}
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
          <p style={{ fontSize: "var(--ts-meta)", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            Pending Invites
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {members.filter((m) => !m.isActive && m.invitationCode).map((m) => (
              <div key={m.membershipId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", border: "1px dashed var(--border)", borderRadius: "10px", padding: "10px 14px" }}>
                <div>
                  <p style={{ fontFamily: "monospace", fontSize: "var(--ts-body-sm)", color: "var(--text-2)" }}>{m.invitationCode}</p>
                  <p style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)", marginTop: "2px" }}>Awaiting acceptance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
