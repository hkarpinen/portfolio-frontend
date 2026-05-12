"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/lib/api-client";
import { useHouseholdExpenseDetail, useAddExpenseSplit, useRemoveExpenseSplit, useUpdateHouseholdExpense } from "@/hooks/use-expenses";
import { useMe } from "@/hooks/use-identity";
import { Button } from "@/components/ui/button";
import type { HouseholdExpenseDetailResponse } from "@/types/finance";

const splitSchema = z.object({
  membershipId: z.string().optional(),
  amount: z.string().min(1).refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
});

type FormData = z.infer<typeof splitSchema>;

const editBillSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().min(1).refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
  currency: z.string().min(1),
  category: z.string().min(1),
  dueDate: z.string().min(1),
  recurrenceFrequency: z.string().optional(),
  description: z.string().optional(),
});

type EditBillData = z.infer<typeof editBillSchema>;

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: color ? `oklch(from ${color} l c h / 0.06)` : "var(--surface)",
      border: `1px solid ${color ? `oklch(from ${color} l c h / 0.3)` : "var(--border)"}`,
      borderRadius: "16px", padding: "16px 20px",
    } as React.CSSProperties}>
      <p style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "500" }}>{label}</p>
      <p style={{
        fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "24px",
        letterSpacing: "-0.025em", color: color ?? "var(--text)", marginTop: "4px",
      }}>{value}</p>
    </div>
  );
}

export default function ExpensePage({ params }: { params: { id: string; expenseId: string } }) {
  const { data: page, isLoading, error: fetchError } = useHouseholdExpenseDetail(params.id, params.expenseId);
  const { data: me } = useMe();
  const [editOpen, setEditOpen] = useState(false);

  const expense = page?.expense;
  const splits = page?.splits ?? [];
  const members = page?.members ?? [];
  const currentMembership = members.find(
    (m) => me?.id && m.userId.toLowerCase() === me.id.toLowerCase()
  ) ?? null;
  const isPrivileged = currentMembership?.role === "Owner" || currentMembership?.role === "Admin";

  const addExpenseSplitMutation = useAddExpenseSplit(params.id, params.expenseId);
  const removeSplitMutation = useRemoveExpenseSplit(params.id, params.expenseId);
  const updateExpenseMutation = useUpdateHouseholdExpense(params.id, params.expenseId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(splitSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
  } = useForm<EditBillData>({
    resolver: zodResolver(editBillSchema),
    values: expense ? {
      title: expense.title,
      amount: String(expense.amount),
      currency: expense.currency,
      category: String(expense.category),
      dueDate: expense.dueDate ? new Date(expense.dueDate).toISOString().slice(0, 10) : "",
      recurrenceFrequency: expense.recurrenceFrequency ?? "",
      description: expense.description ?? "",
    } : undefined,
  });

  const onEditBill = (data: EditBillData) => {
    updateExpenseMutation.mutate(
      {
        title: data.title,
        amount: Number(data.amount),
        currency: data.currency,
        category: data.category,
        dueDate: data.dueDate,
        recurrenceFrequency: data.recurrenceFrequency || undefined,
        description: data.description || undefined,
      },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  const onAddSplit = (data: FormData) => {
    const membershipId = isPrivileged ? data.membershipId : currentMembership?.membershipId;
    if (!membershipId) return;
    addExpenseSplitMutation.mutate(
      { membershipId, amount: Number(data.amount), currency: expense?.currency ?? "USD" },
      { onSuccess: () => reset() }
    );
  };

  const splitTotal = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  const remaining = expense ? Number(expense.amount) - splitTotal : 0;

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "9999px",
        border: "2px solid var(--border-2)", borderTopColor: "var(--accent)",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );

  if (fetchError) return (
    <div style={{
      background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)",
      borderRadius: "16px", padding: "16px", color: "var(--danger)", fontSize: "14px",
    }}>{fetchError instanceof ApiError ? fetchError.message : "Failed to load expense."}</div>
  );

  if (!expense) return null;

  return (
    <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "24px" }} className="page-enter">
      {/* Header */}
      <div>
        <Link href={`/households/${params.id}`} style={{
          fontSize: "12px", color: "var(--text-3)", textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: "4px",
        }}>
          ← Household
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: "4px" }}>
          <div>
            <h1 style={{
              fontFamily: "var(--ff-display)", fontWeight: "800",
              fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)",
              marginBottom: "4px",
            }}>{expense.title}</h1>
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
              Due {new Date(expense.dueDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              {expense.recurrenceFrequency && ` · ${expense.recurrenceFrequency}`}
              {expense.category != null && ` · ${String(expense.category)}`}
            </p>
            {expense.description && <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "6px", lineHeight: "1.6" }}>{expense.description}</p>}
          </div>
          {isPrivileged && (
            <button
              onClick={() => setEditOpen((v) => !v)}
              style={{
                padding: "6px 14px", borderRadius: "10px", flexShrink: 0,
                background: editOpen ? "var(--surface-3)" : "var(--surface-2)",
                border: "1px solid var(--border)", fontSize: "12px", fontWeight: "600",
                color: "var(--text-2)", cursor: "pointer", marginTop: "4px",
              }}
            >
              {editOpen ? "Cancel" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editOpen && isPrivileged && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "24px",
        }}>
          <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: "700", fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>
            Edit Expense
          </h2>
          <form onSubmit={handleSubmitEdit(onEditBill)} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {updateExpenseMutation.isError && (
              <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)", fontSize: "13px", color: "var(--danger)" }}>
                {updateExpenseMutation.error instanceof ApiError ? updateExpenseMutation.error.message : "Something went wrong."}
              </div>
            )}
            <div className="form-grid-2">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)" }}>Title</label>
                <input {...registerEdit("title")} style={{ height: "38px", background: "var(--surface-2)", border: `1px solid ${editErrors.title ? "var(--danger)" : "var(--border)"}`, borderRadius: "12px", padding: "0 12px", fontSize: "13px", color: "var(--text)", outline: "none" }} />
                {editErrors.title && <span style={{ fontSize: "11px", color: "var(--danger)" }}>{editErrors.title.message}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)" }}>Amount</label>
                <input type="number" step="0.01" {...registerEdit("amount")} style={{ height: "38px", background: "var(--surface-2)", border: `1px solid ${editErrors.amount ? "var(--danger)" : "var(--border)"}`, borderRadius: "12px", padding: "0 12px", fontSize: "13px", color: "var(--text)", outline: "none" }} />
                {editErrors.amount && <span style={{ fontSize: "11px", color: "var(--danger)" }}>{editErrors.amount.message}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)" }}>Currency</label>
                <input {...registerEdit("currency")} placeholder="USD" style={{ height: "38px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0 12px", fontSize: "13px", color: "var(--text)", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)" }}>Category</label>
                <select {...registerEdit("category")} style={{ height: "38px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0 12px", fontSize: "13px", color: "var(--text)", outline: "none" }}>
                  {["Rent","Utilities","Groceries","Transportation","Entertainment","Healthcare","Insurance","Subscriptions","Internet","Phone","Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)" }}>Due Date</label>
                <input type="date" {...registerEdit("dueDate")} style={{ height: "38px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0 12px", fontSize: "13px", color: "var(--text)", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)" }}>Recurrence</label>
                <select {...registerEdit("recurrenceFrequency")} style={{ height: "38px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0 12px", fontSize: "13px", color: "var(--text)", outline: "none" }}>
                  <option value="">None</option>
                  {["Daily","Weekly","Biweekly","Monthly","Quarterly","Yearly"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)" }}>Description</label>
                <textarea {...registerEdit("description")} rows={2} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "8px 12px", fontSize: "13px", color: "var(--text)", outline: "none", resize: "vertical" }} />
              </div>
            </div>
            <button
              type="submit"
              disabled={updateExpenseMutation.isPending}
              style={{ alignSelf: "flex-end", padding: "8px 20px", borderRadius: "12px", background: updateExpenseMutation.isPending ? "var(--surface-3)" : "var(--accent)", color: updateExpenseMutation.isPending ? "var(--text-3)" : "#fff", border: "none", cursor: updateExpenseMutation.isPending ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "600", fontFamily: "var(--ff-display)" }}
            >
              {updateExpenseMutation.isPending ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid-3">
        <StatCard label="Total" value={`${expense.currency} ${Number(expense.amount).toFixed(2)}`} />
        <StatCard label="Allocated" value={`${expense.currency} ${splitTotal.toFixed(2)}`} color={splitTotal > 0 ? "var(--success)" : undefined} />
        <StatCard
          label="Unallocated"
          value={`${expense.currency} ${remaining.toFixed(2)}`}
          color={remaining > 0.001 ? "var(--warning)" : "var(--success)"}
        />
      </div>

      {/* Progress bar */}
      {expense.amount > 0 && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "16px 20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Allocation progress</span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>
              {((splitTotal / Number(expense.amount)) * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ height: "6px", background: "var(--surface-3)", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "9999px",
              background: remaining > 0.001 ? "var(--warning)" : "var(--success)",
              width: `${Math.min((splitTotal / Number(expense.amount)) * 100, 100)}%`,
              transition: "width 500ms cubic-bezier(0.16,1,0.3,1)",
            }} />
          </div>
        </div>
      )}

      {/* Splits */}
      <div>
        <h2 style={{
          fontFamily: "var(--ff-display)", fontWeight: "700",
          fontSize: "18px", color: "var(--text)", marginBottom: "12px",
        }}>Splits</h2>

        {splits.length === 0 ? (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "32px", textAlign: "center", marginBottom: "16px",
          }}>
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>No splits yet — the full amount is unallocated.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            {splits.map((split) => {
              const initials = (split.displayName ?? "?").slice(0, 2).toUpperCase();
              const isRemoving = removeSplitMutation.isPending && removeSplitMutation.variables === split.splitId;
              return (
                <div key={split.splitId} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "12px", padding: "12px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  opacity: isRemoving ? 0.5 : 1, transition: "opacity 150ms",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      width: "32px", height: "32px", borderRadius: "9999px",
                      background: "var(--accent-subtle)", color: "var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "700", fontFamily: "var(--ff-display)",
                    }}>{initials}</span>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)" }}>
                        {split.displayName || `${split.membershipId.slice(0, 8)}…`}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-3)" }}>
                        {split.role}{split.isClaimed ? " · Claimed" : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{
                      fontFamily: "var(--ff-display)", fontWeight: "700",
                      fontSize: "14px", color: "var(--text)",
                    }}>{split.currency} {Number(split.amount).toFixed(2)}</span>
                    {split.isClaimed ? (
                      <span style={{
                        padding: "2px 8px", borderRadius: "9999px",
                        background: "var(--success-s)", color: "var(--success)",
                        fontSize: "11px", fontWeight: "500",
                      }}>Claimed</span>
                    ) : (
                      <button
                        onClick={() => removeSplitMutation.mutate(split.splitId)}
                        disabled={isRemoving}
                        style={{
                          padding: "4px 10px", borderRadius: "8px",
                          background: "var(--danger-s)", color: "var(--danger)",
                          border: "1px solid oklch(62% 0.21 22 / 0.25)",
                          fontSize: "11px", fontWeight: "500",
                          cursor: isRemoving ? "not-allowed" : "pointer",
                          transition: "background 110ms",
                        }}
                      >
                        {isRemoving ? "Removing…" : "Remove"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add split form */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "20px",
        }}>
          <h3 style={{
            fontFamily: "var(--ff-display)", fontWeight: "700",
            fontSize: "14px", color: "var(--text)", marginBottom: "16px",
          }}>Add Split</h3>

          {!currentMembership ? (
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>You are not a member of this household.</p>
          ) : (
            <form onSubmit={handleSubmit(onAddSplit)} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {addExpenseSplitMutation.isError && (
                <div style={{
                  padding: "10px 14px", borderRadius: "10px",
                  background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)",
                  fontSize: "13px", color: "var(--danger)",
                }}>
                  {addExpenseSplitMutation.error instanceof ApiError
                    ? addExpenseSplitMutation.error.message
                    : "Something went wrong."}
                </div>
              )}

              {isPrivileged && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
                    Member
                  </label>
                  <select
                    {...register("membershipId")}
                    style={{
                      height: "38px", background: "var(--surface-2)",
                      border: "1px solid var(--border)", borderRadius: "12px",
                      padding: "0 12px", fontSize: "13px", color: "var(--text)", outline: "none",
                    }}
                  >
                    <option value="">Select member</option>
                    {members.map((m) => (
                      <option key={m.membershipId} value={m.membershipId}>
                        {m.displayName || `${m.userId.slice(0, 8)}…`} ({m.role})
                      </option>
                    ))}
                  </select>
                  {errors.membershipId && <span style={{ fontSize: "11px", color: "var(--danger)" }}>{errors.membershipId.message}</span>}
                </div>
              )}

              {!isPrivileged && (
                <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
                  Split will be added for you ({currentMembership.role}).
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
                  Amount ({expense.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount")}
                  placeholder={remaining > 0 ? remaining.toFixed(2) : "0.00"}
                  style={{
                    height: "38px", background: "var(--surface-2)",
                    border: `1px solid ${errors.amount ? "var(--danger)" : "var(--border)"}`,
                    borderRadius: "12px", padding: "0 12px",
                    fontSize: "13px", color: "var(--text)", outline: "none",
                  }}
                />
                {errors.amount && <span style={{ fontSize: "11px", color: "var(--danger)" }}>{errors.amount.message}</span>}
              </div>

              <Button
                type="submit"
                disabled={addExpenseSplitMutation.isPending}
                variant="primary"
              >
                {addExpenseSplitMutation.isPending ? "Adding…" : "Add Split"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
