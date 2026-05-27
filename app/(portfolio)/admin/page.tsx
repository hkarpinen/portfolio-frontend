"use client";

import { useState } from "react";
import { useMe, useAdminUsers, useBanUser, useChangeUserRole } from "@/hooks/use-identity";
import { UserInitials } from "@/components/editorial/user-initials";
import { EditorialPageHead } from "@/components/editorial/editorial-page-head";
import { LedeStat } from "@/components/editorial/lede-stat";
import { DepartmentHead } from "@/components/editorial/department-head";
import { Btn } from "@/components/editorial/button";

/**
 * Admin panel — visible only to users with the Admin role.
 * Authorization is enforced by `(portfolio)/admin/layout.tsx` via
 * `requireRole("Admin")`, which redirects/notFounds non-admins server-side.
 * `useMe()` here is UX-only — to mark "you" and disable self-actions.
 * NEVER trust client-side role checks for gating.
 */
export default function AdminPage() {
  const { data: me } = useMe();
  const [page, setPage] = useState(1);
  const { data: usersData, isLoading } = useAdminUsers(page);
  const banUser = useBanUser();
  const changeRole = useChangeUserRole();

  const users = usersData ?? [];
  const totalPages = 1; // server handles pageSize

  return (
    <div className="page-enter flex flex-col gap-6">
      <EditorialPageHead
        kicker="Admin · Identity"
        title={users.length > 0
          ? `<em>${users.length}</em> member${users.length === 1 ? "" : "s"} on file`
          : `<em>No</em> members on file yet`
        }
        deck="Roster, roles, and ban status across the identity service. Changes take effect immediately."
      />

      <LedeStat
        label="Identity · Roster"
        value={String(users.length)}
        deck="Total users surfaced for the current page of the admin roster. Lookups, role changes, and bans operate on this set."
        aside={[
          { label: "Admins",  value: String(users.filter((u) => u.role === "Admin").length) },
          { label: "Members", value: String(users.filter((u) => u.role !== "Admin").length) },
          { label: "Banned",  value: String(users.filter((u) => u.isBanned).length) },
          { label: "Page",    value: String(page) },
        ]}
      />

      <section className="flex flex-col gap-5" aria-label="User management">
        <DepartmentHead
          kicker="Roster · Page"
          count={`${users.length} on this page`}
          title="The <em>roster</em>"
          deck="Sortable by signup order. Click a row to inspect or act."
        />
        <div className="bg-paper overflow-hidden border-ink">
          {isLoading ? (
            <div className="flex justify-center items-center p-20" role="status" aria-label="Loading users">
              <div className="w-[28px] h-[28px] border-2 border-ink-4 border-t-ink animate-spin" aria-hidden="true" />
              <span className="sr-only">Loading users…</span>
            </div>
          ) : users.length === 0 ? (
            <p className="p-16 text-center text-base text-ink-3">No users found.</p>
          ) : (
            <table className="w-full" aria-label="Users table">
              <thead>
                <tr className="bg-paper-2 border-ink-b">
                  <th scope="col" className="ed-label-muted text-left py-5 px-6">User</th>
                  <th scope="col" className="ed-label-muted text-left py-5 px-4">Email</th>
                  <th scope="col" className="ed-label-muted text-left py-5 px-4">Role</th>
                  <th scope="col" className="ed-label-muted text-left py-5 px-4">Status</th>
                  <th scope="col" className="ed-label-muted text-left py-5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const isSelf = me?.id === user.id;
                  const isBanning = banUser.isPending && banUser.variables === user.id;
                  const isChangingRole = changeRole.isPending && (changeRole.variables as { userId: string })?.userId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="row-hover"
                      style={{
                        borderBottom: i < users.length - 1 ? "1.5px solid var(--ink)" : "none",
                        background: user.isBanned ? "oklch(62% 0.21 22 / 0.04)" : undefined,
                      }}
                    >
                      {/* User */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserInitials name={user.displayName} size="sm" className="w-[28px] h-[28px]" />
                          <span className="text-base font-medium text-ink overflow-hidden text-ellipsis whitespace-nowrap">
                            {user.displayName}
                            {isSelf && <span className="text-sm text-red ml-3" aria-label="(this is you)">(you)</span>}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-5 px-4">
                        <span className="text-base text-ink-3 overflow-hidden text-ellipsis whitespace-nowrap block max-w-[180px]">
                          {user.email}
                        </span>
                      </td>

                      {/* Role select */}
                      <td className="py-5 px-4">
                        <label htmlFor={`role-${user.id}`} className="sr-only">
                          Role for {user.displayName}
                        </label>
                        <select
                          id={`role-${user.id}`}
                          value={user.role}
                          disabled={isSelf || isChangingRole}
                          onChange={(e) => changeRole.mutate({ userId: user.id, role: e.target.value })}
                          className="h-[36px] bg-paper-2 px-2 text-base text-ink outline-none border-ink cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Change role for ${user.displayName}`}
                        >
                          <option value="Member">Member</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="py-5 px-4">
                        <span
                          className="py-1 px-3 inline-block text-[0.66rem] font-mono font-600 uppercase tracking-wide"
                          style={{
                            background: user.isBanned ? "var(--danger-s)" : "var(--success-s)",
                            color: user.isBanned ? "var(--danger)" : "var(--success)",
                          }}
                          aria-label={user.isBanned ? "Banned" : "Active"}
                        >
                          {user.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-4">
                        {!isSelf ? (
                          <Btn
                            variant={user.isBanned ? "secondary" : "danger"}
                            size="xs"
                            disabled={isBanning}
                            onClick={() => banUser.mutate(user.id)}
                            aria-label={user.isBanned ? `Unban ${user.displayName}` : `Ban ${user.displayName}`}
                          >
                            {isBanning ? "…" : user.isBanned ? "Unban" : "Ban"}
                          </Btn>
                        ) : (
                          <span className="text-xs text-ink-4 font-mono uppercase tracking-wide">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex gap-4 justify-center mt-8" aria-label="User list pagination">
            <Btn
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              ← Prev
            </Btn>
            <span className="flex items-center text-base text-ink-3" aria-live="polite" aria-atomic="true">
              Page {page} of {totalPages}
            </span>
            <Btn
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              Next →
            </Btn>
          </nav>
        )}
      </section>
    </div>
  );
}
