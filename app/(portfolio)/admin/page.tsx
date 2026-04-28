"use client";

import { useState } from "react";
import { useMe, useAdminUsers, useBanUser, useChangeUserRole } from "@/hooks/use-identity";

export default function AdminPage() {
  // Authorization is enforced by `(portfolio)/admin/layout.tsx` via
  // `requireRole("Admin")`, which redirects/notFounds non-admins server-side.
  // `useMe()` here is UX-only: we use it to identify "you" in the table and
  // to disable self-actions. NEVER trust it for gating.
  const { data: me } = useMe();
  const [page, setPage] = useState(1);
  const { data: usersData, isLoading } = useAdminUsers(page);
  const banUser = useBanUser();
  const changeRole = useChangeUserRole();

  const users = usersData ?? [];
  const totalPages = 1; // server handles pageSize

  return (
    <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "24px" }} className="page-enter">
      <div>
        <h1 style={{
          fontFamily: "var(--ff-display)", fontWeight: "800",
          fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)",
        }}>
          Admin Panel
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-3)", marginTop: "4px" }}>
          Manage users, roles, and access.
        </p>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", overflow: "hidden",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 120px 100px 160px",
          gap: "12px",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
        }}>
          {["User", "Email", "Role", "Status", "Actions"].map((col) => (
            <span key={col} style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {col}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "9999px",
              border: "2px solid var(--border-2)", borderTopColor: "var(--accent)",
              animation: "spin 0.8s linear infinite",
            }} />
          </div>
        ) : users.length === 0 ? (
          <p style={{ padding: "32px", textAlign: "center", fontSize: "13px", color: "var(--text-3)" }}>No users found.</p>
        ) : (
          users.map((user, i) => {
            const isSelf = me?.id === user.id;
            const isBanning = banUser.isPending && banUser.variables === user.id;
            const isChangingRole = changeRole.isPending && (changeRole.variables as { userId: string })?.userId === user.id;

            return (
              <div
                key={user.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 120px 100px 160px",
                  gap: "12px",
                  padding: "12px 16px",
                  alignItems: "center",
                  borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                  background: user.isBanned ? "oklch(62% 0.21 22 / 0.04)" : "transparent",
                }}
              >
                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <span style={{
                    width: "28px", height: "28px", flexShrink: 0, borderRadius: "9999px",
                    background: "var(--accent-subtle)", color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: "700",
                  }}>
                    {(user.displayName ?? "?").slice(0, 2).toUpperCase()}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.displayName}
                    {isSelf && <span style={{ fontSize: "10px", color: "var(--accent)", marginLeft: "6px" }}>you</span>}
                  </span>
                </div>

                {/* Email */}
                <span style={{ fontSize: "12px", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </span>

                {/* Role select */}
                <select
                  value={user.role}
                  disabled={isSelf || isChangingRole}
                  onChange={(e) => changeRole.mutate({ userId: user.id, role: e.target.value })}
                  style={{
                    height: "30px", background: "var(--surface-2)",
                    border: "1px solid var(--border)", borderRadius: "8px",
                    padding: "0 8px", fontSize: "12px", color: "var(--text)", outline: "none",
                    cursor: isSelf ? "not-allowed" : "pointer",
                    opacity: isSelf ? 0.5 : 1,
                  }}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>

                {/* Status */}
                <span style={{
                  padding: "2px 8px", borderRadius: "9999px", display: "inline-block",
                  fontSize: "11px", fontWeight: "600",
                  background: user.isBanned ? "var(--danger-s)" : "var(--success-s)",
                  color: user.isBanned ? "var(--danger)" : "var(--success)",
                }}>
                  {user.isBanned ? "Banned" : "Active"}
                </span>

                {/* Actions */}
                <div>
                  {!isSelf && (
                    <button
                      disabled={isBanning}
                      onClick={() => banUser.mutate(user.id)}
                      style={{
                        padding: "4px 12px", borderRadius: "8px",
                        background: user.isBanned ? "var(--surface-3)" : "var(--danger-s)",
                        color: user.isBanned ? "var(--text-3)" : "var(--danger)",
                        border: `1px solid ${user.isBanned ? "var(--border)" : "oklch(62% 0.21 22 / 0.25)"}`,
                        fontSize: "11px", fontWeight: "500",
                        cursor: isBanning ? "not-allowed" : "pointer",
                        opacity: isBanning ? 0.5 : 1,
                      }}
                    >
                      {isBanning ? "…" : user.isBanned ? "Unban" : "Ban"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              padding: "6px 16px", borderRadius: "10px",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              fontSize: "12px", fontWeight: "500", color: "var(--text-2)",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            ← Prev
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "var(--text-3)" }}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "6px 16px", borderRadius: "10px",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              fontSize: "12px", fontWeight: "500", color: "var(--text-2)",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
