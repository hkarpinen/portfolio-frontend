"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteHousehold } from "@/hooks/use-household";
import type { MembershipResponse } from "@/types/finance";

interface DangerZoneProps {
  householdId: string;
  members: MembershipResponse[];
}

export function DangerZone({ householdId, members }: DangerZoneProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteHousehold = useDeleteHousehold();

  const activeMemberCount = members.filter((m) => m.isActive).length;
  const canDelete = activeMemberCount <= 1;

  return (
    <section style={{
      background: "var(--surface)",
      border: "1px solid var(--danger)",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Danger Zone
      </p>
      {!canDelete ? (
        <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
          To delete this household, first remove all other members or transfer ownership to someone else.
        </p>
      ) : showDeleteConfirm ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: "13px", color: "var(--danger)", fontWeight: "600" }}>
            Are you sure? This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => deleteHousehold.mutate(householdId, { onSuccess: () => router.push("/households") })}
              disabled={deleteHousehold.isPending}
              style={{ background: "var(--danger)", color: "#fff", border: "none", borderRadius: "12px", padding: "8px 20px", fontSize: "13px", fontWeight: "600", cursor: deleteHousehold.isPending ? "not-allowed" : "pointer", opacity: deleteHousehold.isPending ? 0.6 : 1, fontFamily: "var(--ff-body)" }}
            >
              {deleteHousehold.isPending ? "Deleting…" : "Yes, Delete Household"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: "12px", padding: "8px 20px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "var(--ff-body)" }}
            >
              Cancel
            </button>
          </div>
          {deleteHousehold.isError && (
            <p style={{ fontSize: "13px", color: "var(--danger)" }}>
              {deleteHousehold.error instanceof Error ? deleteHousehold.error.message : "Failed to delete household."}
            </p>
          )}
        </div>
      ) : (
        <>
          <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
            You are the only member. Deleting this household is permanent and cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background: "var(--danger-s)", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: "12px", padding: "8px 20px", fontSize: "13px", fontWeight: "500", cursor: "pointer", alignSelf: "flex-start", fontFamily: "var(--ff-body)" }}
          >
            Delete Household
          </button>
        </>
      )}
    </section>
  );
}
