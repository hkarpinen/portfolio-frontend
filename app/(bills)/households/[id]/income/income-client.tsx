"use client";

import { useState } from "react";
import { AddHouseholdIncomeModal } from "./add-income-modal";
import type { IncomeSource } from "@/types/bills";
import { Button } from "@/components/ui/button";

interface IncomeClientProps {
  householdId: string;
  currency: string;
  sources: IncomeSource[];
  monthlyTotal: number;
  annualTotal: number;
  sourceCount: number;
}

function MonthlyAmount(amount: number, frequency: string): number {
  const f = frequency?.toUpperCase();
  if (f === "WEEKLY") return (amount * 52) / 12;
  if (f === "BIWEEKLY") return (amount * 26) / 12;
  if (f === "ANNUALLY") return amount / 12;
  if (f === "QUARTERLY") return amount / 3;
  if (f === "SEMIANNUALLY") return amount / 6;
  return amount;
}

export function IncomeClient({
  householdId,
  currency,
  sources: initialSources,
  monthlyTotal: initialMonthly,
  annualTotal: initialAnnual,
  sourceCount: initialCount,
}: IncomeClientProps) {
  const [showModal, setShowModal] = useState(false);
  const sources = initialSources;
  const monthlyTotal = initialMonthly;

  const isRecurring = (s: IncomeSource) => {
    const f = s.frequency?.toUpperCase();
    return f && f !== "ONCE" && f !== "ONE_TIME" && f !== "ONETIME";
  };
  const recurringTotal = sources.filter(isRecurring).reduce((sum, s) => sum + MonthlyAmount(s.amount, s.frequency), 0);
  const oneTimeTotal = sources.filter((s) => !isRecurring(s)).reduce((sum, s) => sum + MonthlyAmount(s.amount, s.frequency), 0);

  return (
    <>
      {/* Stat row — This month / Recurring / One-time */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>This month</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {currency} {monthlyTotal.toFixed(2)}
          </p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recurring</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--success-s)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {currency} {recurringTotal.toFixed(2)}
          </p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>One-time</span>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--warning-s)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {currency} {oneTimeTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* List header + Add button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Income Sources
        </p>
        <Button
          onClick={() => setShowModal(true)}
          variant="primary"
        >
          + Add Income
        </Button>
      </div>

      {/* Sources list */}
      {sources.length === 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "48px 24px",
          textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>
            No income sources yet
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
            Add income sources to track coverage for this household.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "var(--accent)", color: "#fff",
              border: "none", padding: "8px 20px", borderRadius: "12px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer", marginTop: "4px",
              fontFamily: "var(--ff-body)",
            }}
          >
            Add Income Source
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sources.map((source) => {
            const monthly = MonthlyAmount(source.amount, source.frequency);
            return (
              <div
                key={source.incomeId}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "14px", padding: "14px 18px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>
                    {source.source}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px", textTransform: "capitalize" }}>
                    {source.frequency?.toLowerCase()}{source.currency ? ` · ${source.currency}` : ""}
                    {source.frequency?.toUpperCase() !== "MONTHLY" && (
                      <span style={{ color: "var(--text-3)" }}>
                        {" "}· {source.currency ?? currency} {monthly.toFixed(2)}/mo
                      </span>
                    )}
                  </p>
                </div>
                <span style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)" }}>
                  {source.currency ?? currency} {source.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddHouseholdIncomeModal
          householdId={householdId}
          currency={currency}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
