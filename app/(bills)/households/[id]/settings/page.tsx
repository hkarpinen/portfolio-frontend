"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  useHousehold,
  useHouseholdMembers,
  useUpdateHousehold,
  useGenerateInvite,
  useRemoveMember,
  useChangeMemberRole,
  useDeleteHousehold,
  useTransferOwnership,
} from "@/hooks/use-household";
import { useMe } from "@/hooks/use-identity";
import type { Household, HouseholdMember } from "@/types/bills";

const SPLIT_METHODS = ["Equal", "ByIncome", "Custom", "Percentage"] as const;
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK"] as const;

const settingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  currencyCode: z.string().min(1, "Currency is required"),
  defaultSplitMethod: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

function nanoid(len = 10): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const inputStyle: React.CSSProperties = {
  height: "38px",
  padding: "0 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text)",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  fontFamily: "var(--ff-body)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "500" as const,
  color: "var(--text-2)",
  letterSpacing: "0.02em",
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--accent)";
  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--border)";
  e.currentTarget.style.boxShadow = "none";
}

export default function HouseholdSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: household, isLoading: householdLoading, isError: householdIsError } = useHousehold(params.id);
  const { data: membersRaw, isLoading: membersLoading } = useHouseholdMembers(params.id);
  const { data: me, isLoading: meLoading } = useMe();

  const members = (Array.isArray(membersRaw) ? membersRaw : []) as HouseholdMember[];
  const loading = householdLoading || membersLoading || meLoading;

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteHousehold = useDeleteHousehold();
  const transferOwnership = useTransferOwnership(params.id);
  const updateHouseholdMutation = useUpdateHousehold(params.id);
  const generateInviteMutation = useGenerateInvite(params.id);
  const removeMemberMutation = useRemoveMember(params.id);
  const changeMemberRoleMutation = useChangeMemberRole(params.id);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (household) {
      reset({
        name: household.name,
        description: household.description ?? "",
        currencyCode: household.currencyCode ?? "USD",
        defaultSplitMethod: household.defaultSplitMethod ?? "Equal",
      });
    }
  }, [household, reset]);

  const myMembership = members.find(
    (m) => m.userId.toLowerCase() === me?.id?.toLowerCase()
  );
  const isOwner = me?.id?.toLowerCase() === household?.ownerId?.toLowerCase();
  const isPrivileged = isOwner || myMembership?.role === "Admin";

  const onSave = async (data: SettingsForm) => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateHouseholdMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        currencyCode: data.currencyCode,
        defaultSplitMethod: data.defaultSplitMethod || undefined,
      });
      setSaveSuccess(true);
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    }
  };

  const onGenerateInvite = () => {
    if (!me) return;
    const code = nanoid();
    setInviteResult(null);
    setInviteError(null);
    setCopied(false);
    generateInviteMutation.mutate(
      { invitedByUserId: me.id, invitationCode: code },
      {
        onSuccess: () => setInviteResult(code),
        onError: (err) => setInviteError(err instanceof Error ? err.message : "Failed to generate invite."),
      }
    );
  };

  const onCopy = () => {
    if (!inviteResult) return;
    navigator.clipboard.writeText(inviteResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const onRemoveMember = (membershipId: string) => {
    setRemovingId(membershipId);
    removeMemberMutation.mutate(
      { membershipId, removedByUserId: me?.id },
      { onSettled: () => setRemovingId(null) }
    );
  };

  if (loading) return (
    <div style={{ padding: "32px", color: "var(--text-3)", fontSize: "13px" }}>Loading…</div>
  );
  if (householdIsError) return (
    <div style={{ padding: "32px", color: "var(--danger)", fontSize: "13px" }}>Failed to load settings.</div>
  );
  if (!household) return (
    <div style={{ padding: "32px", color: "var(--text-3)", fontSize: "13px" }}>Household not found.</div>
  );

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
    <div className="page-enter" style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <Link
          href={`/households/${params.id}`}
          style={{ color: "var(--text-3)", fontSize: "12px", textDecoration: "none" }}
        >
          ← Back to {household.name}
        </Link>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", marginTop: "6px" }}>
          Settings
        </h1>
      </div>

      {/* Edit form */}
      {isPrivileged && (
        <section style={cardStyle}>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Household Details
          </p>
          <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {saveError && (
              <div style={{ background: "var(--danger-s)", border: "1px solid var(--danger)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--danger)" }}>
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div style={{ background: "var(--success-s)", border: "1px solid var(--success)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--success)" }}>
                Changes saved!
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Name</label>
              <input
                {...register("name")}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {errors.name && <p style={{ color: "var(--danger)", fontSize: "12px" }}>{errors.name.message}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                {...register("description")}
                rows={3}
                style={{
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  color: "var(--text)",
                  fontSize: "14px",
                  outline: "none",
                  width: "100%",
                  resize: "none",
                  fontFamily: "var(--ff-body)",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {errors.description && <p style={{ color: "var(--danger)", fontSize: "12px" }}>{errors.description.message}</p>}
            </div>

            {/* Currency + Default Split row */}
            <div className="form-grid-2">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Currency</label>
                <select
                  {...register("currencyCode")}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.currencyCode && <p style={{ color: "var(--danger)", fontSize: "12px" }}>{errors.currencyCode.message}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Default Split</label>
                <select
                  {...register("defaultSplitMethod")}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  {SPLIT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </section>
      )}

      {/* Members list */}
      <section style={cardStyle}>
        <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Members
        </p>
        {members.filter((m) => m.isActive).length === 0 ? (
          <p style={{ color: "var(--text-3)", fontSize: "13px" }}>No active members.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {members
              .filter((m) => m.isActive)
              .map((m) => {
                const isSelf = m.userId.toLowerCase() === me?.id?.toLowerCase();
                const canRemove = isOwner && !isSelf;
                const canChangeRole = isOwner && !isSelf && m.role !== "Owner";
                return (
                  <div
                    key={m.membershipId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}>
                        {m.displayName || `${m.userId.slice(0, 8)}…`}
                        {isSelf && (
                          <span style={{ background: "var(--accent-subtle)", color: "var(--accent)", borderRadius: "9999px", padding: "2px 8px", fontSize: "11px", fontWeight: "600" }}>
                            you
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px", textTransform: "capitalize" }}>{m.role}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {canChangeRole && (
                        <select
                          value={m.role}
                          disabled={changeMemberRoleMutation.isPending}
                          onChange={(e) =>
                            changeMemberRoleMutation.mutate({ membershipId: m.membershipId, role: e.target.value })
                          }
                          style={{
                            height: "30px",
                            padding: "0 8px",
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "var(--text-2)",
                            cursor: "pointer",
                            fontFamily: "var(--ff-body)",
                          }}
                        >
                          <option value="Member">Member</option>
                          <option value="Admin">Admin</option>
                        </select>
                      )}
                      {canRemove && (
                        <div style={{ display: "flex", gap: "6px", flexDirection: "column", alignItems: "flex-end" }}>
                        {transferTargetId === m.membershipId ? (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-2)" }}>Transfer to {m.displayName || m.userId.slice(0, 8)}?</span>
                            <button
                              onClick={() => {
                                transferOwnership.mutate(m.userId, { onSuccess: () => setTransferTargetId(null) });
                              }}
                              disabled={transferOwnership.isPending}
                              style={{
                                background: "var(--accent)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "4px 10px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: transferOwnership.isPending ? "not-allowed" : "pointer",
                                fontFamily: "var(--ff-body)",
                              }}
                            >
                              {transferOwnership.isPending ? "Transferring…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setTransferTargetId(null)}
                              style={{ background: "none", border: "none", fontSize: "12px", color: "var(--text-3)", cursor: "pointer", fontFamily: "var(--ff-body)" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setTransferTargetId(m.membershipId)}
                            style={{
                              background: "var(--surface-2)",
                              color: "var(--text-2)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              padding: "4px 12px",
                              fontSize: "12px",
                              fontWeight: "500",
                              cursor: "pointer",
                              fontFamily: "var(--ff-body)",
                            }}
                          >
                            Transfer Ownership
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveMember(m.membershipId)}
                          disabled={removingId === m.membershipId}
                          style={{
                            background: "var(--danger-s)",
                            color: "var(--danger)",
                            border: "1px solid var(--danger)",
                            borderRadius: "8px",
                            padding: "4px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: removingId === m.membershipId ? "not-allowed" : "pointer",
                            opacity: removingId === m.membershipId ? 0.5 : 1,
                            fontFamily: "var(--ff-body)",
                          }}
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

        {/* Pending invites */}
        {isPrivileged && members.some((m) => !m.isActive && m.invitationCode) && (
          <div>
            <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Pending Invites
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {members
                .filter((m) => !m.isActive && m.invitationCode)
                .map((m) => (
                  <div key={m.membershipId} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--surface-2)",
                    border: "1px dashed var(--border)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                  }}>
                    <div>
                      <p style={{ fontFamily: "monospace", fontSize: "13px", color: "var(--text-2)" }}>{m.invitationCode}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>Awaiting acceptance</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* Invite section */}
      {isPrivileged && (
        <section style={cardStyle}>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Invite Someone
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
            Generate a one-time invite code and share it. The recipient can use it at{" "}
            <Link href="/households/join" style={{ color: "var(--accent)", textDecoration: "none", fontFamily: "monospace", fontSize: "12px" }}>
              /households/join
            </Link>
            .
          </p>
          {inviteError && (
            <div style={{ background: "var(--danger-s)", border: "1px solid var(--danger)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--danger)" }}>
              {inviteError}
            </div>
          )}
          {inviteResult ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <code style={{
                  flex: 1,
                  fontFamily: "monospace",
                  fontSize: "14px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  color: "var(--text)",
                  wordBreak: "break-all",
                }}>
                  {inviteResult}
                </code>
                <button
                  onClick={onCopy}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: copied ? "var(--success)" : "var(--text-2)",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--ff-body)",
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => setInviteResult(null)}
                style={{ fontSize: "13px", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "var(--ff-body)" }}
              >
                Generate another
              </button>
            </div>
          ) : (
            <Button
              onClick={onGenerateInvite}
              disabled={generateInviteMutation.isPending}
              variant="primary"
            >
              {generateInviteMutation.isPending ? "Generating…" : "Generate Invite Code"}
            </Button>
          )}
        </section>
      )}

      {/* Danger zone */}
      {isOwner && (
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
          {(() => {
            const activeMemberCount = members.filter((m) => m.isActive).length;
            const canDelete = activeMemberCount <= 1;
            if (!canDelete) {
              return (
                <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
                  To delete this household, first remove all other members or transfer ownership to someone else.
                </p>
              );
            }
            if (showDeleteConfirm) {
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <p style={{ fontSize: "13px", color: "var(--danger)", fontWeight: "600" }}>
                    Are you sure? This cannot be undone.
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        deleteHousehold.mutate(params.id, {
                          onSuccess: () => router.push("/households"),
                        });
                      }}
                      disabled={deleteHousehold.isPending}
                      style={{
                        background: "var(--danger)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        padding: "8px 20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: deleteHousehold.isPending ? "not-allowed" : "pointer",
                        opacity: deleteHousehold.isPending ? 0.6 : 1,
                        fontFamily: "var(--ff-body)",
                      }}
                    >
                      {deleteHousehold.isPending ? "Deleting…" : "Yes, Delete Household"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        background: "none",
                        border: "1px solid var(--border)",
                        color: "var(--text-2)",
                        borderRadius: "12px",
                        padding: "8px 20px",
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "pointer",
                        fontFamily: "var(--ff-body)",
                      }}
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
              );
            }
            return (
              <>
                <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
                  You are the only member. Deleting this household is permanent and cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    background: "var(--danger-s)",
                    color: "var(--danger)",
                    border: "1px solid var(--danger)",
                    borderRadius: "12px",
                    padding: "8px 20px",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                    fontFamily: "var(--ff-body)",
                  }}
                >
                  Delete Household
                </button>
              </>
            );
          })()}
        </section>
      )}
    </div>
  );
}
