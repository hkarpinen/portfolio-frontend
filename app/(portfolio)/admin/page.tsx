"use client";

import { useState } from "react";
import { getInitials } from "@/lib/utils";
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
    <div  className="page-enter max-w-[900px] flex flex-col gap-12">
      <div>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink">
          Admin Panel
        </h1>
        <p className="text-base text-ink-3 mt-2">
          Manage users, roles, and access.
        </p>
      </div>

      <div className="bg-paper overflow-hidden border-ink">
        {/* Table header */}
        <div className="grid gap-6 py-5 px-8 bg-paper-2" style={{ gridTemplateColumns: "1fr 1fr 120px 100px 160px", borderBottom: "1.5px solid var(--ink)" }}>
          {["User", "Email", "Role", "Status", "Actions"].map((col) => (
            <span key={col} className="text-sm font-semibold text-ink-3 uppercase tracking-[0.06em]">
              {col}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="w-[28px] h-[28px] "  style={{ border: "2px solid var(--ink-4)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : users.length === 0 ? (
          <p className="p-16 text-center text-base text-ink-3">No users found.</p>
        ) : (
          users.map((user, i) => {
            const isSelf = me?.id === user.id;
            const isBanning = banUser.isPending && banUser.variables === user.id;
            const isChangingRole = changeRole.isPending && (changeRole.variables as { userId: string })?.userId === user.id;

            return (
              <div
                key={user.id}
                className="grid gap-6 py-6 px-8 items-center" style={{ gridTemplateColumns: "1fr 1fr 120px 100px 160px", borderBottom: i < users.length - 1 ? "1.5px solid var(--ink)" : "none", background: user.isBanned ? "oklch(62% 0.21 22 / 0.04)" : "transparent" }}
              >
                {/* User */}
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-[28px] h-[28px] shrink-0 bg-red-soft text-red flex items-center justify-center text-sm font-bold">
                    {getInitials(user.displayName)}
                  </span>
                  <span className="text-base font-medium text-ink overflow-hidden text-ellipsis whitespace-nowrap">
                    {user.displayName}
                    {isSelf && <span className="text-sm text-red ml-3">you</span>}
                  </span>
                </div>

                {/* Email */}
                <span className="text-base text-ink-3 overflow-hidden text-ellipsis whitespace-nowrap">
                  {user.email}
                </span>

                {/* Role select */}
                <select
                  value={user.role}
                  disabled={isSelf || isChangingRole}
                  onChange={(e) => changeRole.mutate({ userId: user.id, role: e.target.value })}
                  className="h-[30px] bg-paper-2 p-[0_8px] text-base text-ink outline-none border-ink" style={{cursor: isSelf ? "not-allowed" : "pointer", opacity: isSelf ? 0.5 : 1 }}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>

                {/* Status */}
                <span className="py-1 px-4 inline-block text-sm font-mono text-[0.594rem] uppercase tracking-wide" style={{ background: user.isBanned ? "var(--danger-s)" : "var(--success-s)", color: user.isBanned ? "var(--danger)" : "var(--success)" }}>
                  {user.isBanned ? "Banned" : "Active"}
                </span>

                {/* Actions */}
                <div>
                  {!isSelf && (
                    <button
                      disabled={isBanning}
                      onClick={() => banUser.mutate(user.id)}
                      className="py-2 px-6 text-sm font-medium" style={{ background: user.isBanned ? "var(--paper-3)" : "var(--danger-s)", color: user.isBanned ? "var(--text-3)" : "var(--danger)", border: `1px solid ${user.isBanned ? "var(--ink-3)" : "oklch(62% 0.21 22 / 0.25)"}`, cursor: isBanning ? "not-allowed" : "pointer", opacity: isBanning ? 0.5 : 1 }}
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
        <div className="flex gap-4 justify-center">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="py-3 px-8 bg-paper-2 text-base font-medium text-ink-2 border-ink" style={{cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}
          >
            ← Prev
          </button>
          <span className="flex items-center text-base text-ink-3">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="py-3 px-8 bg-paper-2 text-base font-medium text-ink-2 border-ink" style={{cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
