"use client";

import { useState } from "react";
import { useRecurringStreams, useRefreshRecurring, useAcceptRecurring, usePlaidItems } from "@/hooks/use-connections";
import type { RecurringSuggestion } from "@/lib/api/plaid";

// Frequency label map
const FREQ_LABELS: Record<string, string> = {
  Daily: "Daily",
  Weekly: "Weekly",
  BiWeekly: "Bi-weekly",
  Monthly: "Monthly",
  Quarterly: "Quarterly",
  SemiAnnually: "Semi-annually",
  Annually: "Annually",
};

function StreamCard({ stream, onAccept, accepting }: { stream: RecurringSuggestion; onAccept: () => void; accepting: boolean }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "14px",
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
        {/* Icon */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px",
          background: "var(--success-s)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {stream.merchantName ?? stream.description}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>
            {FREQ_LABELS[stream.frequency] ?? stream.frequency}
            {" · "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {stream.currency} {stream.averageAmount.toFixed(2)} avg
            </span>
            {stream.predictedNextDate ? (
              <> · next {new Date(stream.predictedNextDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</>
            ) : null}
          </p>
        </div>
      </div>

      {/* Action */}
      {stream.isLinked ? (
        <a
          href="/income"
          style={{
            fontSize: "12px", fontWeight: 600, color: "var(--success)",
            textDecoration: "none", padding: "6px 12px", borderRadius: "8px",
            background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.25)",
            flexShrink: 0,
          }}
        >
          ✓ Added
        </a>
      ) : (
        <button
          onClick={onAccept}
          disabled={accepting}
          style={{
            background: "var(--accent)", color: "#fff", border: "none",
            borderRadius: "8px", padding: "7px 16px", fontSize: "13px",
            fontWeight: 600, cursor: accepting ? "not-allowed" : "pointer",
            opacity: accepting ? 0.6 : 1, flexShrink: 0,
            transition: "opacity 150ms",
          }}
        >
          {accepting ? "Adding…" : "Add to income"}
        </button>
      )}
    </div>
  );
}

/**
 * Shows Plaid-detected inflow (deposit) recurring streams so the user can
 * promote them to tracked income sources without leaving the income page.
 *
 * Hidden entirely when no banks are linked or there are no suggestions.
 */
export function PlaidIncomeSuggestions() {
  const itemsQuery = usePlaidItems();
  const streamsQuery = useRecurringStreams();
  const refresh = useRefreshRecurring();
  const accept = useAcceptRecurring();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Only show if at least one bank is linked
  const hasLinkedBanks = (itemsQuery.data?.length ?? 0) > 0;
  if (!hasLinkedBanks && !itemsQuery.isLoading) return null;

  // Only show inflow (deposit) streams
  const inflows: RecurringSuggestion[] = (streamsQuery.data ?? []).filter(s => s.direction === "Inflow");

  // If there are no inflow suggestions at all (and we have items), still render
  // a minimal banner so the user can trigger a detection run.
  const showEmpty = hasLinkedBanks && !streamsQuery.isLoading && inflows.length === 0;

  const handleAccept = (streamId: string) => {
    setAcceptingId(streamId);
    accept.mutate(streamId, { onSettled: () => setAcceptingId(null) });
  };

  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p style={{
            fontSize: "10px", fontWeight: 700, color: "var(--text-3)",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            Detected from bank
          </p>
          {(streamsQuery.isLoading || refresh.isPending) && (
            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>Loading…</span>
          )}
          {inflows.length > 0 && (
            <span style={{
              fontSize: "11px", fontWeight: 700, color: "var(--accent)",
              background: "var(--accent-subtle)", borderRadius: "99px",
              padding: "1px 8px",
            }}>
              {inflows.filter(s => !s.isLinked).length} new
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Refresh / detect button */}
          {itemsQuery.data && itemsQuery.data.length > 0 && (
            <button
              onClick={() => {
                // Refresh all linked connections
                itemsQuery.data!.forEach(item => refresh.mutate(item.connectionId));
              }}
              disabled={refresh.isPending}
              style={{
                background: "none", border: "1px solid var(--border)",
                borderRadius: "8px", padding: "4px 10px", fontSize: "12px",
                color: "var(--text-3)", cursor: "pointer",
                opacity: refresh.isPending ? 0.5 : 1, transition: "opacity 150ms",
              }}
            >
              {refresh.isPending ? "Detecting…" : "↺ Refresh"}
            </button>
          )}

          {/* Collapse toggle */}
          {inflows.length > 0 && (
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                background: "none", border: "none", padding: "4px 6px",
                fontSize: "12px", color: "var(--text-3)", cursor: "pointer",
              }}
            >
              {collapsed ? "Show" : "Hide"}
            </button>
          )}
        </div>
      </div>

      {/* Stream cards */}
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {showEmpty ? (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "14px", padding: "20px 18px",
              textAlign: "center", color: "var(--text-3)", fontSize: "13px",
            }}>
              No recurring deposits detected yet.{" "}
              <button
                onClick={() => itemsQuery.data!.forEach(item => refresh.mutate(item.connectionId))}
                disabled={refresh.isPending}
                style={{
                  background: "none", border: "none", color: "var(--accent)",
                  cursor: "pointer", fontWeight: 600, fontSize: "13px", padding: 0,
                }}
              >
                Detect now
              </button>
            </div>
          ) : (
            inflows.map(stream => (
              <StreamCard
                key={stream.suggestionId}
                stream={stream}
                onAccept={() => handleAccept(stream.suggestionId)}
                accepting={acceptingId === stream.suggestionId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
