"use client";

import { useState } from "react";
import { useSyncPlaidItem, useUnlinkPlaidItem } from "@/hooks/use-connections";
import { Icon } from "@/components/editorial/icon";
import type { Connection, LinkedAccountResponse } from "@/lib/api/plaid";
import { formatCurrency } from "@/lib/formatting";

const statusColor: Record<Connection["status"], string> = {
  Healthy: "var(--success)",
  LoginRequired: "var(--warning)",
  Revoked: "var(--danger)",
  Error: "var(--danger)",
};

const statusLabel: Record<Connection["status"], string> = {
  Healthy: "Connected",
  LoginRequired: "Login required",
  Revoked: "Revoked",
  Error: "Error",
};

function AccountRow({ account }: { account: LinkedAccountResponse }) {
  const balance =
    account.currentBalance != null
      ? formatCurrency(account.currentBalance, account.currency)
      : "—";
  return (
    <div className="flex justify-between items-center p-[8px_0] border-t border-ink">
      <div className="flex items-center gap-4">
        <span className="text-base text-ink-2 font-medium">
          {account.name}{account.mask ? ` ····${account.mask}` : ""}
        </span>
        {account.subtype && (
          <span className="text-sm text-ink-3 bg-paper-2 py-[2px] px-[7px]">{account.subtype}</span>
        )}
      </div>
      <span className="text-base text-ink-3 tabular-nums">{balance}</span>
    </div>
  );
}

export function ConnectionCard({ item }: { item: Connection }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const sync = useSyncPlaidItem();
  const unlink = useUnlinkPlaidItem();

  const lastSync = item.lastSyncedAt
    ? new Date(item.lastSyncedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  const isSyncing = sync.isPending && sync.variables === item.connectionId;
  const isUnlinking = unlink.isPending && unlink.variables === item.connectionId;

  return (
    <div className={`bg-paper overflow-hidden border-ink transition-opacity duration-200${isUnlinking ? " opacity-50" : " opacity-100"}`}>
      <div className="py-8 px-10 flex items-center gap-[14px]">
        <div className="w-[42px] h-[42px] bg-paper-2 flex items-center justify-center shrink-0">
          <Icon name="bank" size={20} strokeWidth={1.75} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-md font-semibold text-ink">{item.institutionName}</span>
            <span
              className="text-sm font-semibold py-1 px-4"
              style={{ color: statusColor[item.status], background: `color-mix(in oklch, ${statusColor[item.status]} 15%, transparent)` }} /* dynamic per-status color */
            >
              {statusLabel[item.status]}
            </span>
          </div>
          <p className="text-base text-ink-3 mt-[3px]">
            {item.accounts.length} account{item.accounts.length !== 1 ? "s" : ""}
            {lastSync ? ` · Synced ${lastSync}` : " · Never synced"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => sync.mutate(item.connectionId)}
            disabled={isSyncing || isUnlinking}
            className={`bg-paper-2 py-3 px-6 text-base font-medium whitespace-nowrap border-ink cursor-pointer disabled:cursor-default ${isSyncing ? "text-ink-3" : "text-ink-2"}`}
          >
            {isSyncing ? "Syncing…" : "↻ Sync"}
          </button>

          {confirming ? (
            <>
              <button
                onClick={() => setConfirming(false)}
                className="bg-transparent py-3 px-5 text-base text-ink-3 cursor-pointer border-ink"

              >
                Cancel
              </button>
              <button
                onClick={() => { unlink.mutate(item.connectionId); setConfirming(false); }}
                className="bg-red py-3 px-6 text-base font-semibold text-white cursor-pointer whitespace-nowrap border-none"
              >
                Confirm remove
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              disabled={isUnlinking}
              className="bg-transparent py-3 px-5 text-base text-red cursor-pointer border-[1.5px] border-red"
            >
              Remove
            </button>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className={`bg-transparent py-3 px-2 cursor-pointer text-ink-3 text-md leading-none border-none transition-transform duration-200${expanded ? " rotate-180" : ""}`}
            aria-label={expanded ? "Collapse accounts" : "Expand accounts"}
          >
            ▾
          </button>
        </div>
      </div>

      {expanded && item.accounts.length > 0 && (
        <div className="p-[0_20px_16px]">
          {item.accounts.map((a) => <AccountRow key={a.accountId} account={a} />)}
        </div>
      )}
    </div>
  );
}
