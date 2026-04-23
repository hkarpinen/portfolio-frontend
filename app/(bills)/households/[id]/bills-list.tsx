"use client";

import { useState } from "react";
import Link from "next/link";
import { useDeleteBill } from "@/hooks/use-bills";
import type { Bill } from "@/types/api";

interface BillsListProps {
  householdId: string;
  initialBills: Bill[];
  canDelete: boolean;
}

export function BillsList({ householdId, initialBills, canDelete }: BillsListProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const deleteMutation = useDeleteBill(householdId);

  const onDelete = (e: React.MouseEvent, billId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this bill? This cannot be undone.")) return;
    deleteMutation.mutate(billId, {
      onSuccess: () => setBills((prev) => prev.filter((b) => b.billId !== billId)),
    });
  };

  if (bills.length === 0) {
    return (
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "40px 24px", textAlign: "center",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "var(--accent-subtle)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.75}>
            <path d="M17 9V7a5 5 0 0 0-10 0v2M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p style={{ fontSize: "14px", fontWeight: "600", fontFamily: "var(--ff-display)", color: "var(--text)", marginBottom: "4px" }}>
          No bills yet
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "16px" }}>
          Add your first bill to start tracking expenses.
        </p>
        <Link
          href={`/households/${householdId}/bills/new`}
          style={{
            display: "inline-flex", alignItems: "center",
            padding: "7px 16px", borderRadius: "10px",
            background: "var(--accent)", color: "#fff",
            fontSize: "13px", fontWeight: "600", textDecoration: "none",
            transition: "background 110ms",
          }}
        >
          Add first bill
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {bills.map((bill) => {
        const dueDate = new Date(bill.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntilDue < 0;
        const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;

        return (
          <div key={bill.billId} style={{ position: "relative" }} className="bills-list-item">
            <Link
              href={`/households/${householdId}/bills/${bill.billId}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "16px", padding: "14px 16px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "12px", textDecoration: "none",
                transition: "border-color 110ms, box-shadow 110ms",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border-2)";
                el.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Left: icon + info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: isOverdue ? "var(--danger-s)" : isDueSoon ? "var(--warning-s)" : "var(--accent-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={isOverdue ? "var(--danger)" : isDueSoon ? "var(--warning)" : "var(--accent)"}
                    strokeWidth={1.75}>
                    <path d="M17 9V7a5 5 0 0 0-10 0v2M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{bill.title}</span>
                    {bill.recurrenceFrequency && (
                      <span style={{
                        padding: "1px 7px", borderRadius: "9999px",
                        background: "var(--accent-subtle)", color: "var(--accent)",
                        fontSize: "10px", fontWeight: "500",
                      }}>{bill.recurrenceFrequency}</span>
                    )}
                    {bill.category && (
                      <span style={{
                        padding: "1px 7px", borderRadius: "9999px",
                        background: "var(--surface-3)", color: "var(--text-2)",
                        border: "1px solid var(--border)",
                        fontSize: "10px", fontWeight: "500",
                      }}>{String(bill.category)}</span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>
                    Due {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    {isOverdue && (
                      <span style={{ color: "var(--danger)", fontWeight: "500" }}> · Overdue</span>
                    )}
                    {isDueSoon && !isOverdue && (
                      <span style={{ color: "var(--warning)", fontWeight: "500" }}> · Due soon</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: amount + delete */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <span style={{
                  fontFamily: "var(--ff-display)", fontWeight: "700",
                  fontSize: "15px", color: "var(--text)",
                }}>
                  {bill.currency} {Number(bill.amount).toFixed(2)}
                </span>
                {canDelete && (
                  <button
                    onClick={(e) => onDelete(e, bill.billId)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === bill.billId}
                    style={{
                      padding: "4px 10px", borderRadius: "8px",
                      background: "var(--danger-s)", color: "var(--danger)",
                      border: "1px solid oklch(62% 0.21 22 / 0.25)",
                      fontSize: "11px", fontWeight: "500", cursor: "pointer",
                      opacity: deleteMutation.isPending && deleteMutation.variables === bill.billId ? 0.5 : 1,
                      transition: "opacity 110ms",
                    }}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === bill.billId ? "…" : "Delete"}
                  </button>
                )}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
