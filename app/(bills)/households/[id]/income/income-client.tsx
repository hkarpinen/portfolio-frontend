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
  const annualTotal = initialAnnual;

  return (
    <>
      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Monthly Income</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {currency} {monthlyTotal.toFixed(2)}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>Per month</p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Annual Income</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {currency} {annualTotal.toFixed(2)}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>Per year</p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sources</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "28px", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1 }}>
            {initialCount}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>Active sources</p>
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
