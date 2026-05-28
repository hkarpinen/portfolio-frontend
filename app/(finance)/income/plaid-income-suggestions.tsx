"use client";

import { useState } from "react";
import {
  useRecurringStreams,
  useRefreshRecurring,
  useAcceptRecurring,
  usePlaidItems,
} from "@/hooks/use-connections";
import { Icon } from "@/components/editorial/icon";
import { Btn } from "@/components/editorial/button";
import { formatAmount, formatShortDate } from "@/lib/formatting";
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

function StreamCard({
  stream,
  onAccept,
  accepting,
}: {
  stream: RecurringSuggestion;
  onAccept: () => void;
  accepting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-8 border-ink bg-paper px-[18px] py-[16px] shadow-stamp">
      <div className="flex min-w-0 items-center gap-[14px]">
        {/* Icon */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-green-soft">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-md font-semibold text-ink">
            {stream.merchantName ?? stream.description}
          </p>
          <p className="mt-1 text-base text-ink-3">
            {FREQ_LABELS[stream.frequency] ?? stream.frequency}
            {" · "}
            <span className="[font-variant-numeric:tabular-nums]">
              {stream.currency} {formatAmount(stream.averageAmount)} avg
            </span>
            {stream.predictedNextDate ? (
              <> · next {formatShortDate(stream.predictedNextDate)}</>
            ) : null}
          </p>
        </div>
      </div>

      {/* Action */}
      {stream.isLinked ? (
        <a
          href="/income"
          className="inline-flex shrink-0 items-center gap-[5px] border border-[oklch(68%_0.18_152_/_0.25)] bg-green-soft px-6 py-3 text-base font-semibold text-green no-underline"
        >
          <Icon name="check" size={11} strokeWidth={2} /> Added
        </a>
      ) : (
        <Btn
          variant="primary"
          size="sm"
          onClick={onAccept}
          disabled={accepting}
          className="shrink-0"
        >
          {accepting ? "Adding…" : "Add to income"}
        </Btn>
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
  const inflows: RecurringSuggestion[] = (streamsQuery.data ?? []).filter(
    (s) => s.direction === "Inflow",
  );

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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-ink-3">
            Detected from bank
          </p>
          {(streamsQuery.isLoading || refresh.isPending) && (
            <span className="text-sm text-ink-3">Loading…</span>
          )}
          {inflows.length > 0 && (
            <span className="bg-red-soft px-[8px] py-[1px] text-sm font-bold text-red">
              {inflows.filter((s) => !s.isLinked).length} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Refresh / detect button */}
          {itemsQuery.data && itemsQuery.data.length > 0 && (
            <button
              onClick={() => {
                // Refresh all linked connections
                itemsQuery.data!.forEach((item) => refresh.mutate(item.connectionId));
              }}
              disabled={refresh.isPending}
              className="cursor-pointer border-ink bg-transparent px-5 py-2 text-base text-ink-3 transition-opacity duration-150 disabled:opacity-50"
            >
              {refresh.isPending ? "Detecting…" : "↺ Refresh"}
            </button>
          )}

          {/* Collapse toggle */}
          {inflows.length > 0 && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="cursor-pointer border-none bg-transparent px-3 py-2 text-base text-ink-3"
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
            <div className="border-ink bg-paper px-[18px] py-[20px] text-center text-base text-ink-3">
              No recurring deposits detected yet.{" "}
              <button
                onClick={() =>
                  itemsQuery.data!.forEach((item) => refresh.mutate(item.connectionId))
                }
                disabled={refresh.isPending}
                className="cursor-pointer border-none bg-transparent p-0 text-base font-semibold text-red"
              >
                Detect now
              </button>
            </div>
          ) : (
            inflows.map((stream) => (
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
