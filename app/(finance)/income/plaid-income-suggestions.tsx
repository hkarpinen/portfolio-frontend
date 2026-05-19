"use client";

import { useState } from "react";
import { useRecurringStreams, useRefreshRecurring, useAcceptRecurring, usePlaidItems } from "@/hooks/use-connections";
import { Icon } from "@/components/editorial/icon";
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
    <div className="bg-paper py-[16px] px-[18px] flex items-center justify-between gap-8 shadow-stamp border-ink">
      <div className="flex items-center gap-[14px] min-w-0">
        {/* Icon */}
        <div className="w-20 h-20 bg-green-soft flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p className="font-semibold text-md text-ink whitespace-nowrap overflow-hidden text-ellipsis">
            {stream.merchantName ?? stream.description}
          </p>
          <p className="text-base text-ink-3 mt-1">
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
          className="text-base font-semibold text-green no-underline py-3 px-6 bg-green-soft shrink-0 inline-flex items-center gap-[5px]" style={{ border: "1px solid oklch(68% 0.18 152 / 0.25)" }}
        >
          <Icon name="check" size={11} strokeWidth={2} /> Added
        </a>
      ) : (
        <button
          onClick={onAccept}
          disabled={accepting}
          className="bg-red text-white py-[7px] px-[16px] text-base font-semibold shrink-0" style={{ border: "none", cursor: accepting ? "not-allowed" : "pointer", opacity: accepting ? 0.6 : 1, transition: "opacity 150ms" }}
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <p className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">
            Detected from bank
          </p>
          {(streamsQuery.isLoading || refresh.isPending) && (
            <span className="text-sm text-ink-3">Loading…</span>
          )}
          {inflows.length > 0 && (
            <span className="text-sm font-bold text-red bg-red-soft py-[1px] px-[8px]">
              {inflows.filter(s => !s.isLinked).length} new
            </span>
          )}
        </div>

        <div className="flex gap-4 items-center">
          {/* Refresh / detect button */}
          {itemsQuery.data && itemsQuery.data.length > 0 && (
            <button
              onClick={() => {
                // Refresh all linked connections
                itemsQuery.data!.forEach(item => refresh.mutate(item.connectionId));
              }}
              disabled={refresh.isPending}
              className="bg-transparent py-2 px-5 text-base text-ink-3 cursor-pointer border-ink" style={{opacity: refresh.isPending ? 0.5 : 1, transition: "opacity 150ms" }}
            >
              {refresh.isPending ? "Detecting…" : "↺ Refresh"}
            </button>
          )}

          {/* Collapse toggle */}
          {inflows.length > 0 && (
            <button
              onClick={() => setCollapsed(c => !c)}
              className="bg-transparent py-2 px-3 text-base text-ink-3 cursor-pointer" style={{ border: "none" }}
            >
              {collapsed ? "Show" : "Hide"}
            </button>
          )}
        </div>
      </div>

      {/* Stream cards */}
      {!collapsed && (
        <div className="flex flex-col gap-5">
          {showEmpty ? (
            <div className="bg-paper py-[20px] px-[18px] text-center text-ink-3 text-base border-ink">
              No recurring deposits detected yet.{" "}
              <button
                onClick={() => itemsQuery.data!.forEach(item => refresh.mutate(item.connectionId))}
                disabled={refresh.isPending}
                className="bg-transparent text-red cursor-pointer font-semibold text-base p-0" style={{ border: "none" }}
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
